import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSquareClient } from "@/lib/square";
import {
  sendOrderConfirmation,
  sendAdminNotification,
  type OrderItem,
} from "@/lib/email";

// ============================================
// Square Webhook Handler
// ============================================

// Disable body parsing so we can access the raw body for signature verification
export const dynamic = "force-dynamic";

// ---------- Square webhook types ----------

interface SquareWebhookEvent {
  type: string;
  event_id: string;
  data: {
    type: string;
    id: string;
    object: Record<string, unknown>;
  };
}

interface SquarePayment {
  id: string;
  order_id?: string;
  amount_money?: { amount: number; currency: string };
  status: string;
  receipt_url?: string;
  buyer_email_address?: string;
}

interface SquareRefund {
  id: string;
  payment_id: string;
  order_id?: string;
  amount_money?: { amount: number; currency: string };
  status: string;
}

interface SquareOrderLineItem {
  name?: string;
  quantity?: string;
  base_price_money?: { amount: number; currency: string };
  total_money?: { amount: number; currency: string };
  metadata?: Record<string, string>;
  note?: string;
}

interface SquareAddress {
  first_name?: string;
  last_name?: string;
  address_line_1?: string;
  address_line_2?: string;
  locality?: string;
  administrative_district_level_1?: string;
  postal_code?: string;
  country?: string;
}

interface SquareFulfillment {
  type?: string;
  shipment_details?: {
    recipient?: {
      display_name?: string;
      email_address?: string;
      phone_number?: string;
      address?: SquareAddress;
    };
  };
}

interface SquareOrder {
  id: string;
  line_items?: SquareOrderLineItem[];
  fulfillments?: SquareFulfillment[];
  total_money?: { amount: number; currency: string };
  total_tax_money?: { amount: number; currency: string };
  total_discount_money?: { amount: number; currency: string };
  net_amounts?: {
    total_money?: { amount: number; currency: string };
    tax_money?: { amount: number; currency: string };
    discount_money?: { amount: number; currency: string };
  };
  metadata?: Record<string, string>;
}

// ---------- Signature verification ----------

/**
 * Verify that a webhook request truly came from Square using HMAC-SHA256.
 */
function isValidSquareWebhook(
  body: string,
  signature: string,
  signatureKey: string,
  notificationUrl: string
): boolean {
  const hmac = crypto.createHmac("sha256", signatureKey);
  hmac.update(notificationUrl + body);
  const expectedSignature = hmac.digest("base64");
  return signature === expectedSignature;
}

// ---------- Helpers ----------

/**
 * Generate a unique order number with format: 423D-YYYYMMDD-XXXX
 */
function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `423D-${datePart}-${randomPart}`;
}

// ---------- Event handlers ----------

/**
 * Handle a payment.completed event.
 * Fetches the full order from Square, then creates an Order with OrderItems
 * in the database and sends email notifications.
 */
async function handlePaymentCompleted(payment: SquarePayment) {
  const paymentId = payment.id;
  const orderId = payment.order_id;

  if (!orderId) {
    console.warn(
      `[Square Webhook] payment.completed missing order_id for payment ${paymentId}`
    );
    return;
  }

  // Idempotency: skip if order already exists for this Square order
  const existingOrder = await prisma.order.findUnique({
    where: { squareOrderId: orderId },
  });

  if (existingOrder) {
    console.log(
      `[Square Webhook] Order already exists for Square order ${orderId}, skipping.`
    );
    return;
  }

  // Fetch full order details from Square to get line items, shipping, etc.
  const client = getSquareClient();
  let squareOrder: SquareOrder;

  try {
    const response = await client.orders.get({ orderId });
    // Square SDK v40+ may use BigInt internally, but we serialize to plain object
    squareOrder = JSON.parse(
      JSON.stringify(response.order, (_key, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    ) as SquareOrder;
  } catch (err) {
    console.error(
      `[Square Webhook] Failed to retrieve Square order ${orderId}:`,
      err
    );
    return;
  }

  // Extract customer details from payment + order fulfillments
  const fulfillment = squareOrder.fulfillments?.[0];
  const recipient = fulfillment?.shipment_details?.recipient;

  const customerEmail =
    payment.buyer_email_address ||
    recipient?.email_address ||
    "unknown@email.com";
  const customerName = recipient?.display_name || "Customer";
  const customerPhone = recipient?.phone_number || null;

  // Extract shipping address
  const addr = recipient?.address;
  const shippingAddress = addr
    ? {
        name: recipient?.display_name || customerName,
        street1: addr.address_line_1 || "",
        street2: addr.address_line_2 || undefined,
        city: addr.locality || "",
        state: addr.administrative_district_level_1 || "",
        zip: addr.postal_code || "",
        country: addr.country || "US",
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

  // Calculate amounts (Square amounts are in cents)
  const total = squareOrder.total_money?.amount || payment.amount_money?.amount || 0;
  const taxAmount = squareOrder.total_tax_money?.amount || 0;

  // Estimate subtotal: total - tax (shipping is embedded in Square order totals)
  // This is an approximation; Square doesn't separate shipping from the total in the same way
  const subtotal = total - taxAmount;
  const shippingCost = 0; // Shipping is included in total; extracted separately if available

  // Build order items from Square line items
  const orderItems = (squareOrder.line_items || []).map((lineItem) => {
    const quantity = parseInt(lineItem.quantity || "1", 10);
    const unitPrice =
      lineItem.base_price_money?.amount ||
      Math.round((lineItem.total_money?.amount || 0) / quantity);

    return {
      productId: lineItem.metadata?.productId || null,
      productName: lineItem.name || "Product",
      quantity,
      unitPrice,
      customization: lineItem.note || lineItem.metadata?.customization || null,
    };
  });

  // Create order in database
  const orderNumber = generateOrderNumber();
  await prisma.order.create({
    data: {
      orderNumber,
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
      squareOrderId: orderId,
      squarePaymentId: paymentId,
      items: {
        create: orderItems,
      },
    },
  });

  console.log(
    `[Square Webhook] Order ${orderNumber} created for Square order ${orderId}`
  );

  // ---- Send email notifications (non-blocking) ----
  const emailItems: OrderItem[] = orderItems.map((item) => ({
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));

  // Fire-and-forget so email failures never break the webhook
  sendOrderConfirmation(
    customerEmail,
    customerName,
    orderNumber,
    emailItems,
    total
  ).catch((err) =>
    console.error("[Email] Order confirmation failed:", err)
  );

  sendAdminNotification(
    `New Order: ${orderNumber}`,
    `<p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
     <p><strong>Order:</strong> ${orderNumber}</p>
     <p><strong>Total:</strong> $${(total / 100).toFixed(2)}</p>
     <p><strong>Items:</strong> ${emailItems.map((i) => `${i.productName} x${i.quantity}`).join(", ")}</p>`
  ).catch((err) =>
    console.error("[Email] Admin order notification failed:", err)
  );
}

/**
 * Handle a refund.created or refund.updated event.
 * Finds the order by squarePaymentId and marks it as REFUNDED.
 */
async function handleRefund(refund: SquareRefund) {
  const paymentId = refund.payment_id;

  if (!paymentId) {
    console.warn(
      "[Square Webhook] Refund event missing payment_id"
    );
    return;
  }

  const order = await prisma.order.findUnique({
    where: { squarePaymentId: paymentId },
  });

  if (!order) {
    console.warn(
      `[Square Webhook] No order found for Square payment ${paymentId}`
    );
    return;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "REFUNDED",
      paymentStatus: "REFUNDED",
    },
  });

  console.log(
    `[Square Webhook] Order ${order.orderNumber} marked as refunded`
  );
}

// ============================================
// Webhook POST Handler
// ============================================

export async function POST(request: NextRequest) {
  try {
    const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    const notificationUrl = process.env.SQUARE_WEBHOOK_URL;

    if (!signatureKey || !notificationUrl) {
      console.error(
        "[Square Webhook] Missing SQUARE_WEBHOOK_SIGNATURE_KEY or SQUARE_WEBHOOK_URL env vars"
      );
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get("x-square-hmacsha256-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-square-hmacsha256-signature header" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!isValidSquareWebhook(body, signature, signatureKey, notificationUrl)) {
      console.error("[Square Webhook] Signature verification failed");
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Parse the verified body
    const event: SquareWebhookEvent = JSON.parse(body);

    // Handle events
    switch (event.type) {
      case "payment.updated": {
        const payment = event.data.object.payment as unknown as SquarePayment;
        if (payment.status === "COMPLETED") {
          await handlePaymentCompleted(payment);
        }
        break;
      }

      case "refund.created":
      case "refund.updated": {
        const refund = event.data.object.refund as unknown as SquareRefund;
        await handleRefund(refund);
        break;
      }

      default:
        console.log(`[Square Webhook] Unhandled event type: ${event.type}`);
    }

    // Always return 200 for all events so Square doesn't retry
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Square Webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
