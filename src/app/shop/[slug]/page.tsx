"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  Package,
  Truck,
  Shield,
  Star,
  Check,
} from "lucide-react";
import {
  PLACEHOLDER_PRODUCTS,
  getProductBySlug,
  getRelatedProducts,
  formatPrice,
  type PlaceholderProduct,
} from "@/lib/placeholder-products";
import { useCart, type CartItem } from "@/hooks/useCart";

// ============================================
// Types
// ============================================

type TabId = "description" | "materials" | "shipping";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

// Map database category values to placeholder category values
const DB_CATEGORY_MAP: Record<string, PlaceholderProduct["category"]> = {
  PRINTING_3D: "3d_print",
  LASER_ENGRAVE: "laser_engrave",
  DESIGN: "custom",
  OTHER: "custom",
};

/**
 * Convert a raw database product (with JSON string fields) into
 * the PlaceholderProduct shape used by the existing UI components.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbProduct(raw: any): PlaceholderProduct {
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

// ============================================
// Product Image Gallery
// ============================================

function ProductImageGallery({ images, name }: { images: string[]; name: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-dark-gray">
        {!imageErrors.has(selectedIndex) ? (
          <Image
            src={images[selectedIndex] || "/images/placeholder.jpg"}
            alt={`${name} - Image ${selectedIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            onError={() => handleImageError(selectedIndex)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-24 w-24 text-white/20" />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                selectedIndex === index
                  ? "border-gold shadow-md shadow-gold/20"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              {!imageErrors.has(index) ? (
                <Image
                  src={img}
                  alt={`${name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-dark-gray">
                  <Package className="h-6 w-6 text-white/20" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Related Product Card
// ============================================

function RelatedProductCard({ product }: { product: PlaceholderProduct }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-dark-gray transition-all hover:border-gold/40">
        <div className="relative aspect-square overflow-hidden">
          {!imageError ? (
            <Image
              src={product.images[0] || "/images/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-dark-gray">
              <Package className="h-12 w-12 text-white/20" />
            </div>
          )}
        </div>
        <div className="p-3">
          <h4 className="text-sm font-semibold text-off-white transition-colors group-hover:text-gold">
            {product.name}
          </h4>
          <p className="mt-1 text-sm font-bold text-gold">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ============================================
// Product Detail Page
// ============================================

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const placeholderProduct = getProductBySlug(slug);
  const { addItem } = useCart();

  // Start with the placeholder product so the page renders immediately
  const [product, setProduct] = useState<PlaceholderProduct | undefined>(placeholderProduct);

  // Fetch the product from the database API, falling back to placeholder
  useEffect(() => {
    let cancelled = false;
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        if (json.success && json.data) {
          const mapped = mapDbProduct(json.data);
          if (!cancelled) setProduct(mapped);
        }
        // If no data from API, keep the placeholder product
      } catch {
        // API unavailable -- keep placeholder product
        console.warn("Could not fetch product from database, using placeholder data.");
      }
    }
    fetchProduct();
    return () => { cancelled = true; };
  }, [slug]);

  // Related products: try to derive from the same source (DB products via API),
  // but fall back to placeholder-based related products for simplicity
  const [relatedProducts, setRelatedProducts] = useState<PlaceholderProduct[]>(
    () => getRelatedProducts(slug, 4)
  );

  useEffect(() => {
    let cancelled = false;
    async function fetchRelated() {
      try {
        const res = await fetch("/api/products?pageSize=50");
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        if (json.success && json.data?.items?.length > 0) {
          const allProducts: PlaceholderProduct[] = json.data.items.map(mapDbProduct);
          const current = allProducts.find((p) => p.slug === slug);
          if (current) {
            const sameCategory = allProducts.filter(
              (p) => p.category === current.category && p.slug !== slug
            );
            const others = allProducts.filter(
              (p) => p.category !== current.category && p.slug !== slug
            );
            const related = [...sameCategory, ...others].slice(0, 4);
            if (!cancelled && related.length > 0) setRelatedProducts(related);
          }
        }
      } catch {
        // Keep placeholder related products
      }
    }
    fetchRelated();
    return () => { cancelled = true; };
  }, [slug]);

  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-white/20" />
          <h1 className="mb-2 font-heading text-3xl font-bold text-off-white">
            Product Not Found
          </h1>
          <p className="mb-6 text-white/50">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-gold-light"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const tabs: Tab[] = [
    { id: "description", label: "Description", icon: <Package className="h-4 w-4" /> },
    { id: "materials", label: "Materials & Care", icon: <Shield className="h-4 w-4" /> },
    { id: "shipping", label: "Shipping Info", icon: <Truck className="h-4 w-4" /> },
  ];

  const handleAddToCart = () => {
    const cartItem: Omit<CartItem, "id"> = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/images/placeholder.jpg",
      quantity,
      customization: customization || undefined,
    };

    addItem(cartItem);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className="min-h-screen bg-dark">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-white/50">
          <Link href="/shop" className="transition-colors hover:text-gold">
            Shop
          </Link>
          <span>/</span>
          <span className="text-off-white">{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProductImageGallery images={product.images} name={product.name} />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.madeToOrder && (
                <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-gold">
                  Made to Order
                </span>
              )}
              {product.featured && (
                <span className="flex items-center gap-1 rounded-full bg-gold-dark/20 px-3 py-1 text-xs font-semibold text-gold-light">
                  <Star className="h-3 w-3" /> Featured
                </span>
              )}
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                {product.category === "3d_print"
                  ? "3D Printed"
                  : product.category === "laser_engrave"
                  ? "Laser Engraved"
                  : "Custom"}
              </span>
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="mb-3 font-heading text-3xl font-bold text-off-white sm:text-4xl">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gold">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-lg text-white/40 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-white/70">{product.shortDescription}</p>

            {/* Material & Dimensions */}
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-white/10 bg-dark-gray p-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                  Material
                </span>
                <p className="mt-1 text-sm text-off-white">{product.material}</p>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                  Dimensions
                </span>
                <p className="mt-1 text-sm text-off-white">{product.dimensions}</p>
              </div>
              {product.color && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                    Color
                  </span>
                  <p className="mt-1 text-sm text-off-white">{product.color}</p>
                </div>
              )}
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                  Weight
                </span>
                <p className="mt-1 text-sm text-off-white">{product.weight} oz</p>
              </div>
            </div>

            {/* Customization */}
            {product.customizable && product.customizationPrompt && (
              <div>
                <label className="mb-2 block text-sm font-medium text-off-white">
                  {product.customizationPrompt}
                </label>
                <textarea
                  value={customization}
                  onChange={(e) => setCustomization(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-dark-gray p-3 text-off-white placeholder-white/30 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
                  placeholder="Enter your customization details..."
                />
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Quantity Selector */}
              <div className="flex items-center rounded-lg border border-white/10 bg-dark-gray">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-white/60 transition-colors hover:text-white"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[3rem] text-center text-lg font-semibold text-off-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-white/60 transition-colors hover:text-white"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={addedToCart}
                className={`flex flex-1 items-center justify-center gap-3 rounded-lg px-8 py-3.5 text-base font-semibold transition-all ${
                  addedToCart
                    ? "bg-green-600 text-white"
                    : "bg-gold text-black hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="h-5 w-5" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart - {formatPrice(product.price * quantity)}
                  </>
                )}
              </button>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-sm">
              {product.madeToOrder ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                  <span className="text-blue-400">
                    Made to order - ships in 5-10 business days
                  </span>
                </>
              ) : product.inventory > 0 ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-green-400">
                    In stock - {product.inventory} available
                  </span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="text-red-400">Out of stock</span>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16"
        >
          {/* Tab Headers */}
          <div className="flex border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-gold text-gold"
                    : "border-transparent text-white/50 hover:text-white/80"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="py-8"
            >
              {activeTab === "description" && (
                <div className="prose prose-invert max-w-3xl">
                  <p className="text-white/70 leading-relaxed">{product.description}</p>
                  {product.tags.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "materials" && (
                <div className="max-w-3xl space-y-6">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-off-white">
                      Material
                    </h3>
                    <p className="text-white/70">{product.material}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-off-white">
                      Care Instructions
                    </h3>
                    <p className="text-white/70">{product.careInstructions}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-off-white">
                      Dimensions & Weight
                    </h3>
                    <ul className="space-y-1 text-white/70">
                      <li>Dimensions: {product.dimensions}</li>
                      <li>Weight: {product.weight} oz</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="max-w-3xl space-y-6">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-off-white">
                      Shipping Information
                    </h3>
                    <p className="text-white/70">{product.shippingInfo}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-dark-gray p-6">
                    <h4 className="mb-4 font-semibold text-off-white">
                      Shipping Policy
                    </h4>
                    <ul className="space-y-3 text-sm text-white/60">
                      <li className="flex items-start gap-3">
                        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        Free standard shipping on orders over $75
                      </li>
                      <li className="flex items-start gap-3">
                        <Package className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        All items are carefully packaged with protective materials
                      </li>
                      <li className="flex items-start gap-3">
                        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        Shipping within the United States only
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 border-t border-white/10 pt-12"
          >
            <h2 className="mb-8 font-heading text-2xl font-bold text-off-white">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {relatedProducts.map((rp) => (
                <RelatedProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
