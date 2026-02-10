"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import type { BlockSettings } from "./BlockRenderer";

interface ProductGridContent {
  category?: string;
  count?: number;
  heading?: string;
  subheading?: string;
  showFeatured?: boolean;
  maxProducts?: number;
  ctaText?: string;
  ctaLink?: string;
  showAllProducts?: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string; // JSON string
  shortDescription?: string;
  material?: string;
  category?: string;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function ProductCard({ product, index }: { product: ProductItem; index: number }) {
  const [imgError, setImgError] = useState(false);

  let images: string[] = [];
  try {
    const parsed = JSON.parse(product.images || "[]");
    images = Array.isArray(parsed) ? parsed : [];
  } catch {
    images = [];
  }

  const imageUrl = images[0] || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/shop/${product.slug}`} className="group block">
        <div
          className="overflow-hidden rounded-xl transition-all duration-300"
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(212,136,28,0.4)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(212,136,28,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#2a2a2a";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-black/40">
            {imageUrl && !imgError ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-16 w-16 text-white/20" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {product.material && (
              <span
                className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {product.material}
              </span>
            )}

            <h3 className="mb-1 text-lg font-semibold text-white transition-colors group-hover:text-gold">
              {product.name}
            </h3>

            {product.shortDescription && (
              <p
                className="mb-3 line-clamp-2 text-sm"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {product.shortDescription}
              </p>
            )}

            <span className="text-lg font-bold" style={{ color: "#D4881C" }}>
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProductGridBlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as ProductGridContent;
  const category = c.category || "";
  const count = c.maxProducts || c.count || 6;
  const heading = c.heading || "";
  const subheading = c.subheading || "";
  const showFeatured = c.showFeatured || false;
  const ctaText = c.ctaText || "";
  const ctaLink = c.ctaLink || "/shop";

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function doFetchProducts() {
    setLoading(true);
    setError(null);

    let url = `/api/products?pageSize=${count}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    if (showFeatured) {
      url += `&featured=true`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json) => {
        if (json.success && json.data?.items) {
          setProducts(json.data.items.slice(0, count));
        }
      })
      .catch(() => {
        setError("Unable to load products. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { doFetchProducts(); }, [category, count, showFeatured]);

  return (
    <div
      className={`py-20 px-6 ${settings.fullWidth ? "" : "mx-auto max-w-7xl"}`}
      style={{
        backgroundColor: settings.backgroundColor || "transparent",
      }}
    >
      <div className={settings.fullWidth ? "mx-auto max-w-7xl" : ""}>
        {heading && (
          <h2
            className="mb-4 text-center text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {heading}
          </h2>
        )}

        {subheading && (
          <p
            className="mx-auto mb-12 max-w-3xl text-center text-lg"
            style={{ color: "#9ca3af" }}
          >
            {subheading}
          </p>
        )}

        {!subheading && heading && <div className="mb-12" />}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              className="h-8 w-8 animate-spin"
              style={{ color: "#D4881C" }}
            />
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12" style={{ color: "#D4881C" }} />
            <p className="mb-4 text-lg" style={{ color: "#9ca3af" }}>{error}</p>
            <button
              onClick={() => doFetchProducts()}
              className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 font-semibold transition-all duration-300"
              style={{
                backgroundColor: "transparent",
                color: "#D4881C",
                border: "1px solid rgba(212,136,28,0.4)",
              }}
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-white/20" />
            <p style={{ color: "#9ca3af" }}>No products available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        {ctaText && (
          <div className="mt-12 text-center">
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-2 rounded-lg px-8 py-3 text-lg font-semibold transition-all duration-300"
              style={{
                backgroundColor: "transparent",
                color: "#D4881C",
                border: "1px solid rgba(212,136,28,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(212,136,28,0.1)";
                e.currentTarget.style.borderColor = "#D4881C";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "rgba(212,136,28,0.3)";
              }}
            >
              {ctaText}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
