import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

// ============================================
// Admin Inquiries API
// GET: List service inquiries with filtering
// PATCH: Update inquiry status, notes, quote, response
// ============================================

// GET - List service inquiries
export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");

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

    const [rawItems, total] = await Promise.all([
      prisma.serviceInquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.serviceInquiry.count({ where }),
    ]);

    // Parse fileUrls from JSON string back to array for the response
    const items = rawItems.map((item) => ({
      ...item,
      fileUrls: (() => {
        try {
          return JSON.parse(item.fileUrls);
        } catch {
          return [];
        }
      })(),
    }));

    return Response.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return Response.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

// PATCH - Update inquiry status, notes, quote, or response
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json();
    const { id } = body;

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

    const updatedInquiry = await prisma.serviceInquiry.update({
      where: { id },
      data: updateData,
    });

    // Parse fileUrls from JSON string back to array for the response
    const inquiry = {
      ...updatedInquiry,
      fileUrls: (() => {
        try {
          return JSON.parse(updatedInquiry.fileUrls);
        } catch {
          return [];
        }
      })(),
    };

    return Response.json({ success: true, inquiry });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return Response.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}
