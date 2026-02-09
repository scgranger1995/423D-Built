import { NextRequest, NextResponse } from "next/server";
import { getSquareClient, getSquareLocationId } from "@/lib/square";
import { prisma } from "@/lib/prisma";
import type { Currency } from "square";

// ============================================
// Square Checkout – Payment Link Creation
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

    // ------------------------------------------------------------------
    // 1. Validate request payload
    // ------------------------------------------------------------------
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided for checkout" },
        { status: 400 }
      );
    }

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

    // ------------------------------------------------------------------
    // 2. Server-side price validation from the database
    // ------------------------------------------------------------------
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, active: true, images: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

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

    // ------------------------------------------------------------------
    // 3. Build Square line items (prices in cents -> BigInt)
    // ------------------------------------------------------------------
    const locationId = getSquareLocationId();
    const client = getSquareClient();

    const lineItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const note = item.customization
        ? `Customization: ${item.customization}`
        : undefined;

      return {
        name: product.name,
        quantity: String(item.quantity),
        basePriceMoney: {
          amount: BigInt(product.price), // database price in cents
          currency: "USD" as Currency,
        },
        ...(note && { note }),
      };
    });

    // ------------------------------------------------------------------
    // 4. Create the Square order first so we know the orderId upfront
    // ------------------------------------------------------------------
    const orderResponse = await client.orders.create({
      order: {
        locationId,
        lineItems,
        taxes: [
          {
            name: "TN Sales Tax",
            percentage: "9.75",
            scope: "ORDER",
          },
        ],
      },
      idempotencyKey: crypto.randomUUID(),
    });

    const squareOrder = orderResponse.order;
    const squareOrderId = squareOrder?.id;

    if (!squareOrderId) {
      console.error("Square did not return an order ID", orderResponse);
      return NextResponse.json(
        { error: "Failed to create order. Please try again." },
        { status: 500 }
      );
    }

    // ------------------------------------------------------------------
    // 5. Create a payment link referencing the existing order
    // ------------------------------------------------------------------
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const linkResponse = await client.checkout.paymentLinks.create({
      idempotencyKey: crypto.randomUUID(),
      order: {
        locationId,
        lineItems,
        taxes: [
          {
            name: "TN Sales Tax",
            percentage: "9.75",
            scope: "ORDER",
          },
        ],
      },
      checkoutOptions: {
        redirectUrl: `${appUrl}/success?orderId=${squareOrderId}`,
        askForShippingAddress: true,
      },
    });

    const paymentLink = linkResponse.paymentLink;
    const checkoutUrl = paymentLink?.url;

    if (!checkoutUrl) {
      console.error(
        "Square did not return a checkout URL",
        linkResponse
      );
      return NextResponse.json(
        { error: "Failed to create checkout link. Please try again." },
        { status: 500 }
      );
    }

    // ------------------------------------------------------------------
    // 6. Return the checkout URL to the client
    // ------------------------------------------------------------------
    return NextResponse.json({ url: checkoutUrl });
  } catch (error: unknown) {
    console.error("Checkout creation failed:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: `Checkout failed: ${message}` },
      { status: 500 }
    );
  }
}
