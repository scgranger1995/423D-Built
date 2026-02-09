import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// ============================================
// Stripe Checkout Session Creation
// ============================================

interface CheckoutLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice?: number; // ignored — price is always fetched from database
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

    // Validate each item has required fields
    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return NextResponse.json(
          { error: "Invalid item data: productId and quantity are required" },
          { status: 400 }
        );
      }
      if (item.quantity < 1) {
        return NextResponse.json(
          { error: "Item quantity must be at least 1" },
          { status: 400 }
        );
      }
    }

    // Server-side price validation: look up each product in the database
    // to prevent price manipulation from the client
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, active: true, images: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Verify all products exist and are active
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
      if (!product.active) {
        return NextResponse.json(
          { error: `Product is no longer available: ${product.name}` },
          { status: 400 }
        );
      }
      if (product.price < 50) {
        return NextResponse.json(
          { error: `Product price is invalid for: ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Build Stripe line items using database prices (never trust client prices)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => {
        const product = productMap.get(item.productId)!;
        const description = item.customization
          ? `Customization: ${item.customization}`
          : undefined;

        const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData =
          {
            name: product.name,
            ...(description && { description }),
            metadata: {
              productId: item.productId,
              ...(item.customization && {
                customization: item.customization,
              }),
            },
          };

        // Add product image if available and it's a full URL
        // Parse images from the database JSON string
        let imageUrl: string | undefined;
        try {
          const images = JSON.parse(product.images);
          if (Array.isArray(images) && images.length > 0 && typeof images[0] === "string" && images[0].startsWith("http")) {
            imageUrl = images[0];
          }
        } catch {
          // Ignore parse errors for images
        }
        if (imageUrl) {
          productData.images = [imageUrl];
        }

        return {
          price_data: {
            currency: "usd",
            product_data: productData,
            unit_amount: product.price, // use database price, not client-sent price
          },
          quantity: item.quantity,
        };
      }
    );

    // Calculate cart subtotal (in cents) for shipping & tax logic
    const subtotal = items.reduce(
      (sum, item) => sum + productMap.get(item.productId)!.price * item.quantity,
      0
    );

    // Tennessee sales tax (9.75%) as a separate non-shippable line item
    const TN_TAX_RATE = 0.0975;
    const taxAmount = Math.round(subtotal * TN_TAX_RATE);

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Tennessee Sales Tax (9.75%)",
        },
        unit_amount: taxAmount,
      },
      quantity: 1,
    });

    // Build shipping options: always include Standard and Priority
    const FREE_SHIPPING_THRESHOLD = 7500; // $75.00 in cents

    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] =
      [
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
      ];

    // Only offer free shipping when subtotal meets the $75 threshold
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      shippingOptions.unshift({
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
      });
    }

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
      shipping_options: shippingOptions,
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
