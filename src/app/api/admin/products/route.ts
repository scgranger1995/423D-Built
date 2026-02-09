import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";
import { getSquareClient } from "@/lib/square";
import crypto from "crypto";

// ============================================
// Admin Products API - CRUD Operations
// GET: List all products (including inactive)
// POST: Create new product (with Square sync)
// PUT: Update product
// PATCH: Bulk actions (activate/deactivate/delete)
// DELETE: Delete single product
// ============================================

// GET - List all products with pagination and filtering
export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return Response.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json();

    const {
      name,
      slug,
      description,
      shortDescription,
      category,
      price,
      compareAtPrice,
      material,
      color,
      dimensions,
      weight,
      images,
      featured,
      active,
      inventory,
      madeToOrder,
      customizable,
      customizationPrompt,
      tags,
    } = body;

    if (!name || !slug || !price) {
      return Response.json(
        { error: "Name, slug, and price are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      return Response.json(
        { error: "A product with this slug already exists" },
        { status: 400 }
      );
    }

    // Create Square catalog item with a variation
    let squareCatalogId: string | null = null;
    let squareVariationId: string | null = null;

    try {
      if (process.env.SQUARE_ACCESS_TOKEN) {
        const squareClient = getSquareClient();
        const priceAmount = typeof price === "number" ? price : parseInt(price);

        const response = await squareClient.catalog.object.upsert({
          idempotencyKey: crypto.randomUUID(),
          object: {
            type: "ITEM",
            id: "#new-item",
            itemData: {
              name,
              description: shortDescription || description || undefined,
              variations: [
                {
                  type: "ITEM_VARIATION",
                  id: "#new-variation",
                  itemVariationData: {
                    name: "Regular",
                    pricingType: "FIXED_PRICING",
                    priceMoney: {
                      amount: BigInt(priceAmount),
                      currency: "USD",
                    },
                  },
                },
              ],
            },
          },
        });

        squareCatalogId = response.catalogObject?.id ?? null;
        const catalogObj = response.catalogObject as { itemData?: { variations?: { id?: string }[] } } | undefined;
        squareVariationId =
          catalogObj?.itemData?.variations?.[0]?.id ?? null;
      }
    } catch (squareError) {
      console.error("Square sync error (non-fatal):", squareError);
      // Continue without Square sync - product will still be created locally
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        shortDescription: shortDescription || null,
        category: category || "OTHER",
        price: typeof price === "number" ? price : parseInt(price),
        compareAtPrice: compareAtPrice
          ? typeof compareAtPrice === "number"
            ? compareAtPrice
            : parseInt(compareAtPrice)
          : null,
        material: material || null,
        color: color || null,
        dimensions: dimensions || null,
        weight: weight ? parseFloat(weight) : null,
        images: images || [],
        featured: featured || false,
        active: active !== undefined ? active : true,
        inventory: inventory || 0,
        madeToOrder: madeToOrder || false,
        customizable: customizable || false,
        customizationPrompt: customizationPrompt || null,
        squareCatalogId,
        squareVariationId,
        tags: tags || [],
      },
    });

    return Response.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT - Update single product
export async function PUT(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // Check slug uniqueness if changed
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: body.slug },
      });
      if (slugExists) {
        return Response.json(
          { error: "A product with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update Square catalog item if it exists
    let updatedSquareVariationId: string | undefined;
    try {
      if (process.env.SQUARE_ACCESS_TOKEN && existing.squareCatalogId) {
        const squareClient = getSquareClient();

        // Retrieve current catalog object to get the version (required for updates)
        const current = await squareClient.catalog.object.get({
          objectId: existing.squareCatalogId,
        });
        const version = current.object?.version;
        const currentObj = current.object as { itemData?: { variations?: { id?: string }[] } } | undefined;
        const existingVariationId =
          existing.squareVariationId ||
          currentObj?.itemData?.variations?.[0]?.id;

        const priceAmount = body.price
          ? typeof body.price === "number"
            ? body.price
            : parseInt(body.price)
          : existing.price;

        const variations: Array<Record<string, unknown>> = [];
        if (existingVariationId) {
          // Retrieve variation version for update
          const currentVariation = await squareClient.catalog.object.get({
            objectId: existingVariationId,
          });
          variations.push({
            type: "ITEM_VARIATION",
            id: existingVariationId,
            version: currentVariation.object?.version,
            itemVariationData: {
              name: "Regular",
              pricingType: "FIXED_PRICING",
              priceMoney: {
                amount: BigInt(priceAmount),
                currency: "USD",
              },
            },
          });
        }

        const response = await squareClient.catalog.object.upsert({
          idempotencyKey: crypto.randomUUID(),
          object: {
            type: "ITEM",
            id: existing.squareCatalogId,
            version: version,
            itemData: {
              name: body.name || existing.name,
              description:
                body.shortDescription ||
                body.description ||
                existing.shortDescription ||
                existing.description ||
                undefined,
              variations:
                variations.length > 0
                  ? (variations as unknown as undefined)
                  : undefined,
            },
          },
        });

        const updatedObj = response.catalogObject as { itemData?: { variations?: { id?: string }[] } } | undefined;
        updatedSquareVariationId =
          updatedObj?.itemData?.variations?.[0]?.id ?? undefined;
      }
    } catch (squareError) {
      console.error("Square update error (non-fatal):", squareError);
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        shortDescription: body.shortDescription,
        category: body.category,
        price: body.price,
        compareAtPrice: body.compareAtPrice,
        material: body.material,
        color: body.color,
        dimensions: body.dimensions,
        weight: body.weight ? parseFloat(body.weight) : null,
        images: body.images,
        featured: body.featured,
        active: body.active,
        inventory: body.inventory,
        madeToOrder: body.madeToOrder,
        customizable: body.customizable,
        customizationPrompt: body.customizationPrompt,
        squareVariationId: updatedSquareVariationId || undefined,
        tags: body.tags,
      },
    });

    return Response.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    return Response.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// PATCH - Bulk actions
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Response.json(
        { error: "Product IDs are required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "activate":
        await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { active: true },
        });
        break;
      case "deactivate":
        await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { active: false },
        });
        break;
      case "delete":
        await prisma.product.deleteMany({
          where: { id: { in: ids } },
        });
        break;
      default:
        return Response.json(
          { error: "Invalid action. Use: activate, deactivate, or delete" },
          { status: 400 }
        );
    }

    return Response.json({ success: true, action, count: ids.length });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return Response.json(
      { error: "Bulk action failed" },
      { status: 500 }
    );
  }
}

// DELETE - Delete single product
export async function DELETE(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete from Square catalog if exists
    try {
      if (process.env.SQUARE_ACCESS_TOKEN && product.squareCatalogId) {
        const squareClient = getSquareClient();
        await squareClient.catalog.object.delete({
          objectId: product.squareCatalogId,
        });
      }
    } catch (squareError) {
      console.error("Square delete error (non-fatal):", squareError);
    }

    await prisma.product.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return Response.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
