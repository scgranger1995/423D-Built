import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

// ============================================
// Admin Products API - CRUD Operations
// GET: List all products (including inactive)
// POST: Create new product (with Stripe sync)
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
  const stripe = getStripe();

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

    // Create Stripe product and price
    let stripeProductId: string | null = null;
    let stripePriceId: string | null = null;

    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const stripeProduct = await stripe.products.create({
          name,
          description: shortDescription || description || undefined,
          images: images && images.length > 0 ? images.slice(0, 8) : undefined,
          metadata: {
            category,
            slug,
          },
        });

        stripeProductId = stripeProduct.id;

        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: price,
          currency: "usd",
        });

        stripePriceId = stripePrice.id;
      }
    } catch (stripeError) {
      console.error("Stripe sync error (non-fatal):", stripeError);
      // Continue without Stripe sync - product will still be created locally
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
        stripeProductId,
        stripePriceId,
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
  const stripe = getStripe();

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

    // Update Stripe product if it exists
    try {
      if (process.env.STRIPE_SECRET_KEY && existing.stripeProductId) {
        await stripe.products.update(existing.stripeProductId, {
          name: body.name || existing.name,
          description:
            body.shortDescription ||
            body.description ||
            existing.shortDescription ||
            existing.description ||
            undefined,
          images:
            body.images && body.images.length > 0
              ? body.images.slice(0, 8)
              : undefined,
        });

        // If price changed, create a new Stripe price
        if (body.price && body.price !== existing.price) {
          const newPrice = await stripe.prices.create({
            product: existing.stripeProductId,
            unit_amount: body.price,
            currency: "usd",
          });
          body.stripePriceId = newPrice.id;

          // Archive old price
          if (existing.stripePriceId) {
            await stripe.prices.update(existing.stripePriceId, {
              active: false,
            });
          }
        }
      }
    } catch (stripeError) {
      console.error("Stripe update error (non-fatal):", stripeError);
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
        stripePriceId: body.stripePriceId || undefined,
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
  const stripe = getStripe();

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
  const stripe = getStripe();

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

    // Archive in Stripe if exists
    try {
      if (process.env.STRIPE_SECRET_KEY && product.stripeProductId) {
        await stripe.products.update(product.stripeProductId, {
          active: false,
        });
      }
    } catch (stripeError) {
      console.error("Stripe archive error (non-fatal):", stripeError);
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
