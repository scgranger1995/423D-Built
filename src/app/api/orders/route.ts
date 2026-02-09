import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================
// Public Order Lookup API
// GET: Look up an order by Square order ID
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json(
        { error: "order_id query parameter is required" },
        { status: 400 }
      );
    }

    // Look up the order by Square order ID
    const order = await prisma.order.findUnique({
      where: { squareOrderId: orderId },
      include: { items: true },
    });

    if (!order) {
      // The webhook may not have fired yet — return 404 so the client
      // can show a "processing" message and retry.
      return NextResponse.json(
        { error: "Order not found. It may still be processing." },
        { status: 404 }
      );
    }

    // Return only safe, public-facing fields (no internal IDs or admin notes)
    return NextResponse.json({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      status: order.status,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      total: order.total,
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        customization: item.customization,
      })),
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error("Order lookup error:", error);
    return NextResponse.json(
      { error: "Failed to look up order" },
      { status: 500 }
    );
  }
}
