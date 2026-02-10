import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

// ============================================
// Admin Page Blocks API - CRUD Operations
// GET: List all blocks for a page
// POST: Create new block
// PUT: Update existing block
// PATCH: Reorder blocks
// DELETE: Delete single block
// ============================================

// GET - List all blocks for a page, ordered by sortOrder
export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return Response.json(
        { error: "Page ID is required" },
        { status: 400 }
      );
    }

    // Verify page exists
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    const blocks = await prisma.pageBlock.findMany({
      where: { pageId },
      orderBy: { sortOrder: "asc" },
    });

    return Response.json({ blocks });
  } catch (error) {
    console.error("Error fetching blocks:", error);
    return Response.json(
      { error: "Failed to fetch blocks" },
      { status: 500 }
    );
  }
}

// POST - Create a new block
export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json();

    const { pageId, type, content, settings, sortOrder } = body;

    if (!pageId || !type) {
      return Response.json(
        { error: "Page ID and block type are required" },
        { status: 400 }
      );
    }

    // Verify page exists
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    // If no sortOrder provided, place at end
    let blockSortOrder = sortOrder;
    if (blockSortOrder === undefined || blockSortOrder === null) {
      const lastBlock = await prisma.pageBlock.findFirst({
        where: { pageId },
        orderBy: { sortOrder: "desc" },
      });
      blockSortOrder = lastBlock ? lastBlock.sortOrder + 1 : 0;
    }

    const block = await prisma.pageBlock.create({
      data: {
        pageId,
        type,
        content: content || "{}",
        settings: settings || "{}",
        sortOrder: blockSortOrder,
      },
    });

    return Response.json({ success: true, block }, { status: 201 });
  } catch (error) {
    console.error("Error creating block:", error);
    return Response.json(
      { error: "Failed to create block" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing block's content, settings, or type
export async function PUT(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json(
        { error: "Block ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existing = await prisma.pageBlock.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: "Block not found" }, { status: 404 });
    }

    const block = await prisma.pageBlock.update({
      where: { id },
      data: {
        type: body.type,
        content: body.content,
        settings: body.settings,
        sortOrder: body.sortOrder,
      },
    });

    return Response.json({ success: true, block });
  } catch (error) {
    console.error("Error updating block:", error);
    return Response.json(
      { error: "Failed to update block" },
      { status: 500 }
    );
  }
}

// PATCH - Reorder blocks (bulk sortOrder update)
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json();
    const { blocks } = body;

    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      return Response.json(
        { error: "Blocks array is required with { id, sortOrder } entries" },
        { status: 400 }
      );
    }

    // Update each block's sortOrder in a transaction
    await prisma.$transaction(
      blocks.map((block: { id: string; sortOrder: number }) =>
        prisma.pageBlock.update({
          where: { id: block.id },
          data: { sortOrder: block.sortOrder },
        })
      )
    );

    return Response.json({ success: true, count: blocks.length });
  } catch (error) {
    console.error("Error reordering blocks:", error);
    return Response.json(
      { error: "Failed to reorder blocks" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a single block
export async function DELETE(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json(
        { error: "Block ID is required" },
        { status: 400 }
      );
    }

    const block = await prisma.pageBlock.findUnique({ where: { id } });
    if (!block) {
      return Response.json({ error: "Block not found" }, { status: 404 });
    }

    await prisma.pageBlock.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting block:", error);
    return Response.json(
      { error: "Failed to delete block" },
      { status: 500 }
    );
  }
}
