import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

// ============================================
// Admin Pages API - CRUD Operations
// GET: List all pages with block count
// POST: Create new page
// PUT: Update existing page
// DELETE: Delete page (prevents system page deletion)
// ============================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET - List all pages ordered by sortOrder, include block count
export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const includeBlocks = searchParams.get("includeBlocks") === "true";
    const slug = searchParams.get("slug");

    // Fetch single page by slug
    if (slug) {
      const page = await prisma.page.findUnique({
        where: { slug },
        include: {
          blocks: {
            orderBy: { sortOrder: "asc" },
          },
          _count: {
            select: { blocks: true },
          },
        },
      });

      if (!page) {
        return Response.json({ error: "Page not found" }, { status: 404 });
      }

      return Response.json({ page });
    }

    // Fetch all pages
    const pages = await prisma.page.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        blocks: includeBlocks
          ? { orderBy: { sortOrder: "asc" } }
          : false,
        _count: {
          select: { blocks: true },
        },
      },
    });

    return Response.json({ pages });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return Response.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

// POST - Create new page
export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json();

    const {
      title,
      slug,
      description,
      published,
      isSystem,
    } = body;

    if (!title) {
      return Response.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Auto-generate slug from title if not provided
    const pageSlug = slug || slugify(title);

    // Check for duplicate slug
    const existingSlug = await prisma.page.findUnique({
      where: { slug: pageSlug },
    });
    if (existingSlug) {
      return Response.json(
        { error: "A page with this slug already exists" },
        { status: 400 }
      );
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug: pageSlug,
        description: description || null,
        published: published || false,
        isSystem: isSystem || false,
      },
      include: {
        _count: {
          select: { blocks: true },
        },
      },
    });

    return Response.json({ success: true, page }, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return Response.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}

// PUT - Update existing page
export async function PUT(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json(
        { error: "Page ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    // Check slug uniqueness if changed
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.page.findUnique({
        where: { slug: body.slug },
      });
      if (slugExists) {
        return Response.json(
          { error: "A page with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        published: body.published,
        sortOrder: body.sortOrder,
      },
      include: {
        _count: {
          select: { blocks: true },
        },
      },
    });

    return Response.json({ success: true, page });
  } catch (error) {
    console.error("Error updating page:", error);
    return Response.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}

// DELETE - Delete single page (prevents system page deletion)
export async function DELETE(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json(
        { error: "Page ID is required" },
        { status: 400 }
      );
    }

    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    // Prevent deleting system pages
    if (page.isSystem) {
      return Response.json(
        { error: "System pages cannot be deleted" },
        { status: 403 }
      );
    }

    await prisma.page.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return Response.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
