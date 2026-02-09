"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, Layers, Printer, Sparkles, ExternalLink } from "lucide-react";

// ============================================
// Types
// ============================================

interface GalleryItem {
  id: number | string;
  title: string;
  category: "3d-printing" | "laser-engraving" | "custom";
  description: string;
  material: string;
  dimensions: string;
  image?: string;
  slug?: string;
}

// ============================================
// Constants
// ============================================

const categories = [
  { id: "all", label: "All Work", icon: Layers },
  { id: "3d-printing", label: "3D Printing", icon: Printer },
  { id: "laser-engraving", label: "Laser Engraving", icon: Sparkles },
  { id: "custom", label: "Custom Projects", icon: Filter },
];

/** Map database category enum values to gallery filter IDs */
const DB_CATEGORY_MAP: Record<string, GalleryItem["category"]> = {
  PRINTING_3D: "3d-printing",
  LASER_ENGRAVE: "laser-engraving",
  DESIGN: "custom",
  OTHER: "custom",
};

/** Hardcoded fallback items shown when no products are returned from the API */
const placeholderItems: GalleryItem[] = [
  {
    id: 1,
    title: "Smoky Mountain Topographic Map",
    category: "3d-printing",
    description:
      "Multi-layer 3D printed topographic map of the Great Smoky Mountains, hand-painted with gradient elevation colors.",
    material: "PLA+",
    dimensions: '12" x 16" x 2"',
  },
  {
    id: 2,
    title: "Custom Wedding Cutting Board",
    category: "laser-engraving",
    description:
      "Personalized bamboo cutting board with names, date, and floral border design for a Bristol couple.",
    material: "Bamboo",
    dimensions: '14" x 10"',
  },
  {
    id: 3,
    title: "Tennessee Tri-Star Coaster Set",
    category: "3d-printing",
    description:
      "Set of 4 coasters featuring the Tennessee tri-star flag design with cork backing.",
    material: "PETG",
    dimensions: '4" diameter each',
  },
  {
    id: 4,
    title: "Engraved Whiskey Glass Set",
    category: "laser-engraving",
    description:
      "Set of 4 rocks glasses with mountain landscape and custom monogram.",
    material: "Glass",
    dimensions: "10 oz glasses",
  },
  {
    id: 5,
    title: "Custom Phone Stand",
    category: "3d-printing",
    description:
      "Articulating phone stand with cable management, designed and printed for a local business.",
    material: "PLA+",
    dimensions: '5" x 4" x 3"',
  },
  {
    id: 6,
    title: "Pet Portrait on Slate",
    category: "laser-engraving",
    description:
      "Photo-realistic pet portrait laser engraved on natural slate tile with stand.",
    material: "Slate",
    dimensions: '8" x 10"',
  },
  {
    id: 7,
    title: "Prototype Drone Housing",
    category: "custom",
    description:
      "Rapid prototype of a custom drone camera housing with mounting brackets. Three iterations completed in 48 hours.",
    material: "ABS",
    dimensions: '6" x 6" x 3"',
  },
  {
    id: 8,
    title: "Appalachian Trail Bookmark Set",
    category: "laser-engraving",
    description:
      "Set of walnut bookmarks engraved with different Appalachian Trail landmarks and mile markers.",
    material: "Walnut",
    dimensions: '6" x 2"',
  },
  {
    id: 9,
    title: "Replacement Appliance Knobs",
    category: "3d-printing",
    description:
      "Custom-measured and printed replacement knobs for a vintage oven. Matched original design perfectly.",
    material: "ASA (heat resistant)",
    dimensions: '1.5" diameter',
  },
  {
    id: 10,
    title: "Business Logo Sign",
    category: "custom",
    description:
      "Large-format multi-piece 3D printed sign with laser-engraved details for a local Tri-Cities restaurant.",
    material: "PLA + Birch Plywood",
    dimensions: '36" x 18"',
  },
  {
    id: 11,
    title: "Guitar Pick Display Case",
    category: "laser-engraving",
    description:
      "Custom maple display case with felt-lined compartments and engraved Bristol music scene artwork.",
    material: "Maple",
    dimensions: '10" x 8"',
  },
  {
    id: 12,
    title: "Honeycomb Desk Organizer",
    category: "3d-printing",
    description:
      "Modular honeycomb desk organizer system with magnetic connections. Customizable number of cells.",
    material: "PETG",
    dimensions: '8" x 6" x 4"',
  },
];

// ============================================
// Helpers
// ============================================

/**
 * Convert a raw product object from the /api/products response
 * into the GalleryItem shape used by this page.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbProduct(raw: any): GalleryItem {
  // Parse the JSON images field (stored as a JSON string in the DB)
  let firstImage: string | undefined;
  try {
    const parsed = JSON.parse(raw.images || "[]");
    if (Array.isArray(parsed) && parsed.length > 0) {
      firstImage = parsed[0];
    }
  } catch {
    firstImage = undefined;
  }

  return {
    id: raw.id,
    title: raw.name,
    category: DB_CATEGORY_MAP[raw.category] || "custom",
    description: raw.shortDescription || raw.description || "",
    material: raw.material || "Unknown",
    dimensions: raw.dimensions || "",
    image: firstImage,
    slug: raw.slug,
  };
}

// ============================================
// Gallery Page
// ============================================

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // null = not yet loaded; empty array means API returned zero products
  const [dbItems, setDbItems] = useState<GalleryItem[] | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products?pageSize=50");
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      if (json.success && json.data?.items?.length > 0) {
        setDbItems(json.data.items.map(mapDbProduct));
      } else {
        // API returned zero products -- use placeholder fallback
        setDbItems([]);
      }
    } catch {
      // API unavailable -- leave as null so placeholders are used
      console.warn("Could not fetch products from API, using placeholder data.");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Use real products when available, otherwise fall back to hardcoded items
  const galleryItems: GalleryItem[] =
    dbItems !== null && dbItems.length > 0 ? dbItems : placeholderItems;

  const filtered =
    activeCategory === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#111111" }}>
      {/* Hero */}
      <section
        style={{
          padding: "80px 24px 40px",
          textAlign: "center",
          borderBottom: "1px solid rgba(212,136,28,0.15)",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontFamily: "var(--font-heading), serif",
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Our{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #E8A83E, #D4881C, #B06E0F)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Gallery
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            color: "#999",
            maxWidth: 600,
            margin: "0 auto",
            fontSize: "1.1rem",
            lineHeight: 1.6,
          }}
        >
          A showcase of our 3D printing, laser engraving, and custom design work
          crafted right here in Bristol, Tennessee.
        </motion.p>
      </section>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 12,
          padding: "32px 24px",
        }}
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 50,
                border: `1px solid ${isActive ? "#D4881C" : "#333"}`,
                backgroundColor: isActive
                  ? "rgba(212,136,28,0.15)"
                  : "transparent",
                color: isActive ? "#E8A83E" : "#999",
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Icon size={16} />
              {cat.label}
            </motion.button>
          );
        })}
      </div>

      {/* Grid */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 24,
        }}
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedItem(item)}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #222",
                cursor: "pointer",
                backgroundColor: "#1a1a1a",
                transition: "border-color 0.3s",
              }}
              whileHover={{
                borderColor: "rgba(212,136,28,0.5)",
                boxShadow: "0 0 20px rgba(212,136,28,0.1)",
              }}
            >
              {/* Image area */}
              <div
                style={{
                  position: "relative",
                  height: 240,
                  backgroundColor: "#222",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.category === "3d-printing" ? (
                      <Printer size={48} color="#333" />
                    ) : item.category === "laser-engraving" ? (
                      <Sparkles size={48} color="#333" />
                    ) : (
                      <Layers size={48} color="#333" />
                    )}
                  </div>
                )}
                {/* Category badge */}
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    padding: "4px 12px",
                    borderRadius: 50,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: "rgba(212,136,28,0.9)",
                    color: "#000",
                  }}
                >
                  {item.category === "3d-printing"
                    ? "3D Print"
                    : item.category === "laser-engraving"
                      ? "Laser"
                      : "Custom"}
                </span>
              </div>

              <div style={{ padding: 20 }}>
                <h3
                  style={{
                    fontFamily: "var(--font-heading), serif",
                    fontSize: "1.15rem",
                    fontWeight: 600,
                    color: "#F5F5F5",
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    color: "#888",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      fontSize: "0.8rem",
                      color: "#666",
                    }}
                  >
                    <span>{item.material}</span>
                    <span>{item.dimensions}</span>
                  </div>
                  {item.slug && (
                    <Link
                      href={`/shop/${item.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#E8A83E",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                    >
                      Shop <ExternalLink size={12} />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <section
        style={{
          textAlign: "center",
          padding: "60px 24px 80px",
          borderTop: "1px solid rgba(212,136,28,0.15)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-heading), serif",
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#F5F5F5",
            marginBottom: 12,
          }}
        >
          Have a Project in Mind?
        </h2>
        <p
          style={{ color: "#888", marginBottom: 24, maxWidth: 500, margin: "0 auto 24px" }}
        >
          We&apos;d love to bring your idea to life. Get a free quote and
          let&apos;s create something amazing together.
        </p>
        <a
          href="/quote"
          style={{
            display: "inline-block",
            padding: "14px 32px",
            borderRadius: 8,
            backgroundColor: "#D4881C",
            color: "#000",
            fontWeight: 600,
            fontSize: "1rem",
            textDecoration: "none",
            transition: "background-color 0.2s",
          }}
        >
          Get a Free Quote
        </a>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              backgroundColor: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 16,
                border: "1px solid rgba(212,136,28,0.3)",
                maxWidth: 600,
                width: "100%",
                overflow: "hidden",
              }}
            >
              {/* Modal image */}
              <div
                style={{
                  position: "relative",
                  height: 300,
                  backgroundColor: "#222",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedItem.image ? (
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="600px"
                  />
                ) : selectedItem.category === "3d-printing" ? (
                  <Printer size={64} color="#444" />
                ) : selectedItem.category === "laser-engraving" ? (
                  <Sparkles size={64} color="#444" />
                ) : (
                  <Layers size={64} color="#444" />
                )}
              </div>

              <div style={{ padding: 32 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-heading), serif",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#F5F5F5",
                      flex: 1,
                    }}
                  >
                    {selectedItem.title}
                  </h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#888",
                      cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>

                <span
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    padding: "4px 12px",
                    borderRadius: 50,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    backgroundColor: "rgba(212,136,28,0.15)",
                    color: "#E8A83E",
                    border: "1px solid rgba(212,136,28,0.3)",
                  }}
                >
                  {selectedItem.category === "3d-printing"
                    ? "3D Printing"
                    : selectedItem.category === "laser-engraving"
                      ? "Laser Engraving"
                      : "Custom Project"}
                </span>

                <p
                  style={{
                    color: "#999",
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                    marginTop: 16,
                  }}
                >
                  {selectedItem.description}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginTop: 20,
                    padding: 16,
                    backgroundColor: "#111",
                    borderRadius: 8,
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Material
                    </span>
                    <p
                      style={{
                        color: "#E8A83E",
                        fontWeight: 600,
                        marginTop: 4,
                      }}
                    >
                      {selectedItem.material}
                    </p>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Dimensions
                    </span>
                    <p
                      style={{
                        color: "#E8A83E",
                        fontWeight: 600,
                        marginTop: 4,
                      }}
                    >
                      {selectedItem.dimensions}
                    </p>
                  </div>
                </div>

                {selectedItem.slug ? (
                  <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                    <Link
                      href={`/shop/${selectedItem.slug}`}
                      style={{
                        display: "flex",
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "12px 24px",
                        borderRadius: 8,
                        backgroundColor: "#D4881C",
                        color: "#000",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      View in Shop <ExternalLink size={16} />
                    </Link>
                    <a
                      href="/quote"
                      style={{
                        display: "flex",
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "12px 24px",
                        borderRadius: 8,
                        border: "1px solid rgba(212,136,28,0.4)",
                        backgroundColor: "transparent",
                        color: "#E8A83E",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Request Similar
                    </a>
                  </div>
                ) : (
                  <a
                    href="/quote"
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: 24,
                      padding: "12px 24px",
                      borderRadius: 8,
                      backgroundColor: "#D4881C",
                      color: "#000",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Request Something Similar
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
