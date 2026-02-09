import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

// ============================================
// Admin Content API - Site Content Management
// GET: Retrieve all content or by section
// PUT: Create/update content items by key
// ============================================

// GET - Retrieve site content
export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "";

    const where: Record<string, unknown> = {};
    if (section) {
      where.section = section;
    }

    const items = await prisma.siteContent.findMany({
      where,
      orderBy: [{ section: "asc" }, { key: "asc" }],
    });

    return Response.json({ items });
  } catch (error) {
    console.error("Error fetching content:", error);
    return Response.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// PUT - Create or update content items
export async function PUT(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return Response.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    // Upsert each content item
    const results = await Promise.all(
      items.map(
        async (item: {
          key: string;
          value: string;
          type?: string;
          section?: string;
        }) => {
          if (!item.key) return null;

          return prisma.siteContent.upsert({
            where: { key: item.key },
            update: {
              value: item.value,
              type: (item.type as "TEXT" | "HTML" | "IMAGE" | "JSON") || "TEXT",
              section: item.section || "general",
            },
            create: {
              key: item.key,
              value: item.value,
              type: (item.type as "TEXT" | "HTML" | "IMAGE" | "JSON") || "TEXT",
              section: item.section || "general",
            },
          });
        }
      )
    );

    const saved = results.filter(Boolean);

    return Response.json({
      success: true,
      count: saved.length,
      items: saved,
    });
  } catch (error) {
    console.error("Error saving content:", error);
    return Response.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
