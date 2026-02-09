import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

// ============================================
// Stripe Webhook Handler
// ============================================

// Disable body parsing so we can access the raw body for signature verification
export const dynamic = "force-dynamic";

/**
 * Generate a unique order number with format: 423D-YYYYMMDD-XXXX
 */
function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `423D-${datePart}-${randomPart}`;
}

/**
 * Handle a completed checkout session.
 * Creates an Order with OrderItems in the database.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Skip if order already exists for this session
  const existingOrder = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (existingOrder) {
    console.log(`Order already exists for session ${session.id}, skipping.`);
    return;
  }

  // Retrieve line items from Stripe
  const stripe = getStripe();
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  });

  // Extract customer details
  const customerEmail =
    session.customer_details?.email || session.customer_email || "unknown@email.com";
  const customerName = session.customer_details?.name || "Customer";
  const customerPhone = session.customer_details?.phone || null;

  // Extract shipping address
  const shippingDetails = (session as unknown as Record<string, unknown>).shipping_details as Stripe.Checkout.Session.CustomerDetails | null || session.customer_details;
  const shippingAddress = shippingDetails?.address
    ? {
        name: shippingDetails.name || customerName,
        street1: shippingDetails.address.line1 || "",
        street2: shippingDetails.address.line2 || undefined,
        city: shippingDetails.address.city || "",
        state: shippingDetails.address.state || "",
        zip: shippingDetails.address.postal_code || "",
        country: shippingDetails.address.country || "US",
        phone: customerPhone || undefined,
      }
    : {
        name: customerName,
        street1: "Address not provided",
        city: "",
        state: "",
        zip: "",
        country: "US",
      };

  // Calculate amounts
  const subtotal = session.amount_subtotal || 0;
  const total = session.amount_total || 0;
  const shippingCost = session.total_details?.amount_shipping || 0;
  const taxAmount = session.total_details?.amount_tax || 0;

  // Build order items
  const orderItems = lineItems.data.map((lineItem) => {
    const product = lineItem.price?.product as Stripe.Product | undefined;
    const metadata = product?.metadata || {};

    return {
      productId: metadata.productId || null,
      productName: lineItem.description || product?.name || "Product",
      quantity: lineItem.quantity || 1,
      unitPrice: lineItem.price?.unit_amount || 0,
      customization: metadata.customization || null,
    };
  });

  // Create order in database
  await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress: JSON.stringify(shippingAddress),
      subtotal,
      shippingCost,
      taxAmount,
      total,
      status: "PAID",
      paymentStatus: "PAID",
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null,
      items: {
        create: orderItems,
      },
    },
  });

  console.log(`Order created for session ${session.id}`);
}

/**
 * Handle a charge refund event.
 * Updates the order status to REFUNDED.
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) {
    console.warn("Refund event missing payment_intent ID");
    return;
  }

  const order = await prisma.order.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!order) {
    console.warn(`No order found for payment intent ${paymentIntentId}`);
    return;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "REFUNDED",
      paymentStatus: "REFUNDED",
    },
  });

  console.log(`Order ${order.orderNumber} marked as refunded`);
}

// ============================================
// Webhook POST Handler
// ============================================

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Webhook signature verification failed: ${message}`);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${message}` },
        { status: 400 }
      );
    }

    // Handle events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
