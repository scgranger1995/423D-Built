import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================
// Service Inquiry API
// ============================================

// Valid enum values matching Prisma schema
const VALID_SERVICE_TYPES = [
  "PRINTING_3D",
  "LASER_ENGRAVING",
  "DESIGN",
  "CONSULTATION",
] as const;

const VALID_TIMELINES = ["STANDARD", "RUSH", "FLEXIBLE"] as const;

/**
 * POST /api/inquiries
 * Create a new service inquiry from a customer.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      company,
      serviceType,
      description,
      material,
      color,
      quantity,
      fileUrls,
      timeline,
      budget,
      referralSource,
    } = body;

    // ---- Validation ----
    const errors: string[] = [];

    if (!customerName || typeof customerName !== "string" || customerName.trim().length === 0) {
      errors.push("Customer name is required");
    }

    if (!customerEmail || typeof customerEmail !== "string") {
      errors.push("Customer email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      errors.push("Invalid email address format");
    }

    if (
      !serviceType ||
      !VALID_SERVICE_TYPES.includes(serviceType as (typeof VALID_SERVICE_TYPES)[number])
    ) {
      errors.push(
        `Service type must be one of: ${VALID_SERVICE_TYPES.join(", ")}`
      );
    }

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      errors.push("Description is required and must be at least 10 characters");
    }

    if (timeline && !VALID_TIMELINES.includes(timeline as (typeof VALID_TIMELINES)[number])) {
      errors.push(`Timeline must be one of: ${VALID_TIMELINES.join(", ")}`);
    }

    if (quantity !== undefined && (typeof quantity !== "number" || quantity < 1)) {
      errors.push("Quantity must be a positive number");
    }

    if (fileUrls && !Array.isArray(fileUrls)) {
      errors.push("File URLs must be an array");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: errors,
        },
        { status: 400 }
      );
    }

    // ---- Create inquiry ----
    const inquiry = await prisma.serviceInquiry.create({
      data: {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone?.trim() || null,
        company: company?.trim() || null,
        serviceType: serviceType as (typeof VALID_SERVICE_TYPES)[number],
        description: description.trim(),
        material: material?.trim() || null,
        color: color?.trim() || null,
        quantity: quantity || 1,
        fileUrls: fileUrls || [],
        timeline: (timeline as (typeof VALID_TIMELINES)[number]) || "STANDARD",
        budget: budget?.trim() || null,
        referralSource: referralSource?.trim() || null,
        status: "NEW",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: inquiry.id,
          message:
            "Thank you for your inquiry! We will review your request and get back to you within 1-2 business days.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create service inquiry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit inquiry. Please try again later.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/inquiries
 * Retrieve all service inquiries (admin only).
 * In production, this should be protected by authentication middleware.
 */
export async function GET(request: NextRequest) {
  try {
    // Basic auth check via header (in production, use NextAuth session)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const status = searchParams.get("status") || undefined;
    const serviceType = searchParams.get("serviceType") || undefined;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;

    // Fetch inquiries with pagination
    const [inquiries, total] = await Promise.all([
      prisma.serviceInquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.serviceInquiry.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: inquiries,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Failed to fetch inquiries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve inquiries" },
      { status: 500 }
    );
  }
}
