import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInquiryConfirmation, sendAdminNotification, escapeHtml } from "@/lib/email";

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
        fileUrls: JSON.stringify(fileUrls || []),
        timeline: (timeline as (typeof VALID_TIMELINES)[number]) || "STANDARD",
        budget: budget?.trim() || null,
        referralSource: referralSource?.trim() || null,
        status: "NEW",
      },
    });

    // ---- Send email notifications (non-blocking) ----
    const trimmedName = customerName.trim();
    const trimmedEmail = customerEmail.trim().toLowerCase();

    sendInquiryConfirmation(trimmedEmail, trimmedName, serviceType).catch(
      (err) => console.error("[Email] Inquiry confirmation failed:", err)
    );

    sendAdminNotification(
      `New Inquiry: ${serviceType}`,
      `<p><strong>Customer:</strong> ${escapeHtml(trimmedName)} (${escapeHtml(trimmedEmail)})</p>
       <p><strong>Service:</strong> ${escapeHtml(serviceType)}</p>
       <p><strong>Description:</strong> ${escapeHtml(description.trim())}</p>
       ${company ? `<p><strong>Company:</strong> ${escapeHtml(company.trim())}</p>` : ""}
       ${timeline ? `<p><strong>Timeline:</strong> ${escapeHtml(timeline)}</p>` : ""}`
    ).catch((err) => console.error("[Email] Admin inquiry notification failed:", err));

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

// GET handler removed: the previous implementation had a fake Bearer token
// check that did not actually validate the token, making it insecure.
// Inquiry listing for admins is served by /api/admin/orders?type=inquiries
// which is properly protected by requireAdminApi().
