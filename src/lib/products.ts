// ============================================
// Shared product mapping utilities
// ============================================

import type { PlaceholderProduct } from "@/lib/placeholder-products";

/**
 * Raw database product shape (the JSON returned from the /api/products endpoint).
 * Fields like `images` and `tags` are stored as JSON strings in the database.
 */
export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  material?: string | null;
  color?: string | null;
  dimensions?: string | null;
  weight?: number | null;
  images: string; // JSON string
  featured?: boolean;
  active?: boolean;
  inventory?: number;
  madeToOrder?: boolean;
  customizable?: boolean;
  customizationPrompt?: string | null;
  tags: string; // JSON string
  careInstructions?: string | null;
  shippingInfo?: string | null;
}

/**
 * Map database category enum values to the PlaceholderProduct category union.
 */
export const DB_CATEGORY_MAP: Record<string, PlaceholderProduct["category"]> = {
  PRINTING_3D: "3d_print",
  LASER_ENGRAVE: "laser_engrave",
  DESIGN: "custom",
  OTHER: "custom",
};

/**
 * Convert a raw database product (with JSON string fields) into
 * the PlaceholderProduct shape used by the existing UI components.
 */
export function mapDbProduct(raw: DbProduct): PlaceholderProduct {
  const images: string[] = (() => {
    try {
      const parsed = JSON.parse(raw.images || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const tags: string[] = (() => {
    try {
      const parsed = JSON.parse(raw.tags || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    shortDescription: raw.shortDescription || "",
    description: raw.description || "",
    category: DB_CATEGORY_MAP[raw.category] || "custom",
    price: raw.price,
    compareAtPrice: raw.compareAtPrice ?? undefined,
    material: raw.material || "Unknown",
    color: raw.color ?? undefined,
    dimensions: raw.dimensions || "",
    weight: raw.weight ?? 0,
    images,
    featured: raw.featured ?? false,
    active: raw.active ?? true,
    inventory: raw.inventory ?? 0,
    madeToOrder: raw.madeToOrder ?? false,
    customizable: raw.customizable ?? false,
    customizationPrompt: raw.customizationPrompt ?? undefined,
    tags,
    careInstructions: raw.careInstructions || "Handle with care.",
    shippingInfo:
      raw.shippingInfo ||
      "Ships within 3-5 business days. Standard USPS shipping.",
  };
}
