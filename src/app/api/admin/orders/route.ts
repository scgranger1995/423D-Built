import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// ============================================
// Admin Orders & Inquiries API
// GET: List orders or inquiries with filtering
// PATCH: Update status, notes, tracking; password change
// ============================================

// GET - List orders or inquiries
export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "orders";
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

    if (type === "inquiries") {
      // Fetch service inquiries
      const where: Record<string, unknown> = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { customerName: { contains: search } },
          { customerEmail: { contains: search } },
          { description: { contains: search } },
        ];
      }

      const [items, total] = await Promise.all([
        prisma.serviceInquiry.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.serviceInquiry.count({ where }),
      ]);

      return Response.json({
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    }

    // Fetch orders
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return Response.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching orders/inquiries:", error);
    return Response.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

// PATCH - Update order/inquiry status, notes, tracking, or admin password
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json();
    const { id, type } = body;

    // Handle password change
    if (type === "password") {
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return Response.json(
          { error: "Current and new passwords are required" },
          { status: 400 }
        );
      }

      const session = await auth();
      if (!session?.user?.id) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return Response.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      const newHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });

      return Response.json({ success: true, message: "Password updated" });
    }

    // Handle inquiry updates
    if (type === "inquiry") {
      if (!id) {
        return Response.json(
          { error: "Inquiry ID is required" },
          { status: 400 }
        );
      }

      const updateData: Record<string, unknown> = {};

      if (body.status) {
        updateData.status = body.status;
      }
      if (body.quotedPrice !== undefined) {
        updateData.quotedPrice = body.quotedPrice;
      }
      if (body.adminNotes !== undefined) {
        // Append to existing notes
        const existing = await prisma.serviceInquiry.findUnique({
          where: { id },
          select: { adminNotes: true },
        });
        const timestamp = new Date().toLocaleString("en-US", {
          dateStyle: "short",
          timeStyle: "short",
        });
        const newNote = `[${timestamp}] ${body.adminNotes}`;
        updateData.adminNotes = existing?.adminNotes
          ? `${existing.adminNotes}\n${newNote}`
          : newNote;
      }
      if (body.adminResponse !== undefined) {
        updateData.adminResponse = body.adminResponse;
      }

      const inquiry = await prisma.serviceInquiry.update({
        where: { id },
        data: updateData,
      });

      return Response.json({ success: true, inquiry });
    }

    // Handle order updates
    if (!id) {
      return Response.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.status) {
      updateData.status = body.status;

      // Auto-update payment status based on order status
      if (body.status === "PAID") {
        updateData.paymentStatus = "PAID";
      } else if (body.status === "REFUNDED") {
        updateData.paymentStatus = "REFUNDED";
      }
    }

    if (body.trackingNumber !== undefined) {
      updateData.trackingNumber = body.trackingNumber;
    }

    if (body.trackingCarrier !== undefined) {
      updateData.trackingCarrier = body.trackingCarrier;
    }

    if (body.labelUrl !== undefined) {
      updateData.labelUrl = body.labelUrl;
    }

    if (body.shippoTransactionId !== undefined) {
      updateData.shippoTransactionId = body.shippoTransactionId;
    }

    if (body.notes !== undefined) {
      // Append to existing notes
      const existing = await prisma.order.findUnique({
        where: { id },
        select: { notes: true },
      });
      const timestamp = new Date().toLocaleString("en-US", {
        dateStyle: "short",
        timeStyle: "short",
      });
      const newNote = `[${timestamp}] ${body.notes}`;
      updateData.notes = existing?.notes
        ? `${existing.notes}\n${newNote}`
        : newNote;
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    return Response.json({ success: true, order });
  } catch (error) {
    console.error("Error updating order/inquiry:", error);
    return Response.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}
