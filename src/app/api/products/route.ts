import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// ============================================
// Products API
// ============================================

/**
 * GET /api/products
 * Fetch all active products with optional filtering, search, and pagination.
 *
 * Query Parameters:
 * - slug: Fetch a single product by slug (returns { success, data: product })
 * - category: Filter by ProductCategory (PRINTING_3D, LASER_ENGRAVE, DESIGN, OTHER)
 * - search: Search in name, description, and tags
 * - sort: Sort order (newest, price-asc, price-desc, popular, name-asc, name-desc)
 * - featured: Filter featured products only ("true")
 * - minPrice: Minimum price in cents
 * - maxPrice: Maximum price in cents
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 12, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // --- Single product by slug ---
    const slug = searchParams.get("slug");
    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
      });

      if (!product || !product.active) {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: product });
    }

    // --- Product listing with filters ---

    // Parse query parameters
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || "newest";
    const featured = searchParams.get("featured") === "true";
    const minPrice = searchParams.get("minPrice")
      ? parseInt(searchParams.get("minPrice")!, 10)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseInt(searchParams.get("maxPrice")!, 10)
      : undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") || "12", 10))
    );

    // Build where clause - only show active products
    const where: Prisma.ProductWhereInput = {
      active: true,
    };

    // Category filter
    if (category) {
      const validCategories = [
        "PRINTING_3D",
        "LASER_ENGRAVE",
        "DESIGN",
        "OTHER",
      ];
      if (validCategories.includes(category)) {
        where.category = category;
      }
    }

    // Featured filter
    if (featured) {
      where.featured = true;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        (where.price as Prisma.IntFilter).gte = minPrice;
      }
      if (maxPrice !== undefined) {
        (where.price as Prisma.IntFilter).lte = maxPrice;
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { shortDescription: { contains: search } },
        { tags: { contains: search.toLowerCase() } },
        { material: { contains: search } },
      ];
    }

    // Build orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sort) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "popular":
        orderBy = { featured: "desc" };
        break;
      case "name-asc":
        orderBy = { name: "asc" };
        break;
      case "name-desc":
        orderBy = { name: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          description: true,
          category: true,
          price: true,
          compareAtPrice: true,
          material: true,
          color: true,
          dimensions: true,
          weight: true,
          images: true,
          featured: true,
          active: true,
          inventory: true,
          madeToOrder: true,
          customizable: true,
          customizationPrompt: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: products,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve products. Please try again later.",
      },
      { status: 500 }
    );
  }
}
