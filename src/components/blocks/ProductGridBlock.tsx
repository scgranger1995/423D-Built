"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Loader2 } from "lucide-react";
import type { BlockSettings } from "./BlockRenderer";

interface ProductGridContent {
  category?: string;
  count?: number;
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
  const count = c.count || 6;

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        let url = `/api/products?pageSize=${count}`;
        if (category) {
          url += `&category=${encodeURIComponent(category)}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        if (json.success && json.data?.items) {
          setProducts(json.data.items.slice(0, count));
        }
      } catch {
        console.warn("Could not fetch products for ProductGridBlock");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category, count]);

  return (
    <div
      className={`py-20 px-6 ${settings.fullWidth ? "" : "mx-auto max-w-7xl"}`}
      style={{
        backgroundColor: settings.backgroundColor || "transparent",
      }}
    >
      <div className={settings.fullWidth ? "mx-auto max-w-7xl" : ""}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              className="h-8 w-8 animate-spin"
              style={{ color: "#D4881C" }}
            />
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-white/20" />
            <p style={{ color: "#9ca3af" }}>No products available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
