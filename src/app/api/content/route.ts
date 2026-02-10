import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================
// Public Content API - Read-only site content
// Used by Footer, Header, and other public components
// ============================================

export async function GET(request: NextRequest) {
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

    // Return as a key-value map for easy consumption
    const content: Record<string, string> = {};
    for (const item of items) {
      content[item.key] = item.value;
    }

    return Response.json({ content });
  } catch (error) {
    console.error("Error fetching public content:", error);
    return Response.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
