import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

// ============================================
// Stripe Checkout Session Creation
// ============================================

interface CheckoutLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // in cents
  customization?: string | null;
  image?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body as { items: CheckoutLineItem[] };

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided for checkout" },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.productName || !item.quantity || !item.unitPrice) {
        return NextResponse.json(
          { error: "Invalid item data: name, quantity, and price are required" },
          { status: 400 }
        );
      }
      if (item.quantity < 1) {
        return NextResponse.json(
          { error: "Item quantity must be at least 1" },
          { status: 400 }
        );
      }
      if (item.unitPrice < 50) {
        return NextResponse.json(
          { error: "Item price must be at least $0.50" },
          { status: 400 }
        );
      }
    }

    // Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => {
        const description = item.customization
          ? `Customization: ${item.customization}`
          : undefined;

        const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData =
          {
            name: item.productName,
            ...(description && { description }),
            metadata: {
              productId: item.productId,
              ...(item.customization && {
                customization: item.customization,
              }),
            },
          };

        // Add product image if available and it's a full URL
        if (item.image && item.image.startsWith("http")) {
          productData.images = [item.image];
        }

        return {
          price_data: {
            currency: "usd",
            product_data: productData,
            unit_amount: item.unitPrice,
          },
          quantity: item.quantity,
        };
      }
    );

    // Determine success and cancel URLs
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000";

    // Create Stripe Checkout Session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 799,
              currency: "usd",
            },
            display_name: "Standard Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 10 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 1499,
              currency: "usd",
            },
            display_name: "Priority Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 2 },
              maximum: { unit: "business_day", value: 5 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "usd",
            },
            display_name: "Free Shipping (Orders over $75)",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 10 },
            },
          },
        },
      ],
      automatic_tax: { enabled: false },
      metadata: {
        itemCount: items.length.toString(),
        productIds: items.map((i) => i.productId).join(","),
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Checkout session creation failed:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout session. Please try again." },
      { status: 500 }
    );
  }
}
