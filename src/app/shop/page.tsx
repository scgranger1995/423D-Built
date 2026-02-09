"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  ShoppingCart,
  ChevronDown,
  Package,
  Star,
} from "lucide-react";
import {
  PLACEHOLDER_PRODUCTS,
  filterProducts,
  formatPrice,
  type PlaceholderProduct,
} from "@/lib/placeholder-products";
import { useCart, type CartItem } from "@/hooks/useCart";

// ============================================
// Constants
// ============================================

const CATEGORIES = [
  { value: "all", label: "All Products" },
  { value: "3d_print", label: "3D Prints" },
  { value: "laser_engrave", label: "Laser Engraved" },
  { value: "custom", label: "Custom" },
];

const MATERIALS = [
  "All Materials",
  "PLA",
  "PETG",
  "Walnut",
  "Bamboo",
  "Cedar",
  "Maple",
  "Birch",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Popular" },
];

const ITEMS_PER_PAGE = 6;

// ============================================
// Product Card Component
// ============================================

function ProductCard({
  product,
  index,
}: {
  product: PlaceholderProduct;
  index: number;
}) {
  const { addItem } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const cartItem: Omit<CartItem, "id"> = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/images/placeholder.jpg",
      quantity: 1,
    };

    addItem(cartItem);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      layout
    >
      <Link href={`/shop/${product.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-dark-gray transition-all duration-300 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-black/40">
            {!imageError ? (
              <Image
                src={product.images[0] || "/images/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-dark-gray">
                <Package className="h-16 w-16 text-white/20" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {product.madeToOrder && (
                <span className="rounded-full bg-gold/90 px-3 py-1 text-xs font-semibold text-black backdrop-blur-sm">
                  Made to Order
                </span>
              )}
              {product.compareAtPrice && (
                <span className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  Sale
                </span>
              )}
              {product.featured && (
                <span className="flex items-center gap-1 rounded-full bg-gold-dark/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  <Star className="h-3 w-3" /> Featured
                </span>
              )}
            </div>

            {/* Quick Add Button */}
            <div className="absolute bottom-0 left-0 right-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
              <button
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-2 bg-gold py-3 text-sm font-semibold text-black transition-colors hover:bg-gold-light"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Material Badge */}
            <span className="mb-2 inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/60">
              {product.material}
            </span>

            <h3 className="mb-1 text-lg font-semibold text-off-white transition-colors group-hover:text-gold">
              {product.name}
            </h3>

            <p className="mb-3 line-clamp-2 text-sm text-white/50">
              {product.shortDescription}
            </p>

            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gold">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-white/40 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ============================================
// Shop Page
// ============================================

export default function ShopPage() {
  const [category, setCategory] = useState("all");
  const [material, setMaterial] = useState("All Materials");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const filteredProducts = useMemo(() => {
    return filterProducts({
      category,
      material: material !== "All Materials" ? material : undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      search: search || undefined,
      sort,
    });
  }, [category, material, sort, search, priceRange]);

  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleClearFilters = () => {
    setCategory("all");
    setMaterial("All Materials");
    setSort("newest");
    setSearch("");
    setPriceRange([0, 10000]);
    setDisplayCount(ITEMS_PER_PAGE);
  };

  const hasActiveFilters =
    category !== "all" ||
    material !== "All Materials" ||
    search !== "" ||
    priceRange[0] > 0 ||
    priceRange[1] < 10000;

  return (
    <div className="min-h-screen bg-dark">
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-white/10 bg-black">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 50%, rgba(212, 136, 28, 0.3) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(176, 110, 15, 0.2) 0%, transparent 50%)",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 font-heading text-4xl font-bold tracking-tight text-off-white sm:text-5xl lg:text-6xl"
          >
            Shop Our{" "}
            <span className="gold-gradient-text">Creations</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto max-w-2xl text-lg text-white/60"
          >
            Handcrafted 3D prints and laser-engraved pieces inspired by
            Tennessee and the Appalachian mountains. Every item is made with
            care in Bristol, TN.
          </motion.p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setDisplayCount(ITEMS_PER_PAGE);
              }}
              className="w-full rounded-lg border border-white/10 bg-dark-gray py-2.5 pl-10 pr-4 text-off-white placeholder-white/40 outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none rounded-lg border border-white/10 bg-dark-gray py-2.5 pl-4 pr-10 text-sm text-off-white outline-none transition-colors focus:border-gold/50"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-dark-gray px-4 py-2.5 text-sm text-off-white transition-colors hover:border-gold/40 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-black">
                  !
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } w-full shrink-0 lg:block lg:w-64`}
          >
            <div className="sticky top-8 space-y-6 rounded-xl border border-white/10 bg-dark-gray p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-off-white">
                  Filters
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-gold hover:text-gold-light"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-white/50">
                  Category
                </h3>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setCategory(cat.value);
                        setDisplayCount(ITEMS_PER_PAGE);
                      }}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        category === cat.value
                          ? "bg-gold/20 text-gold"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Filter */}
              <div>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-white/50">
                  Material
                </h3>
                <div className="space-y-2">
                  {MATERIALS.map((mat) => (
                    <button
                      key={mat}
                      onClick={() => {
                        setMaterial(mat);
                        setDisplayCount(ITEMS_PER_PAGE);
                      }}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        material === mat
                          ? "bg-gold/20 text-gold"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-white/50">
                  Price Range
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">
                        $
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={priceRange[0] / 100}
                        onChange={(e) =>
                          setPriceRange([
                            Math.round(Number(e.target.value) * 100),
                            priceRange[1],
                          ])
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-7 pr-2 text-sm text-off-white outline-none focus:border-gold/50"
                        placeholder="Min"
                      />
                    </div>
                    <span className="text-white/30">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">
                        $
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={priceRange[1] / 100}
                        onChange={(e) =>
                          setPriceRange([
                            priceRange[0],
                            Math.round(Number(e.target.value) * 100),
                          ])
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-7 pr-2 text-sm text-off-white outline-none focus:border-gold/50"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Filters (Mobile) */}
              <button
                onClick={() => setShowFilters(false)}
                className="mt-4 w-full rounded-lg bg-gold py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gold-light lg:hidden"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results count */}
            <p className="mb-6 text-sm text-white/50">
              Showing {displayedProducts.length} of {filteredProducts.length}{" "}
              products
            </p>

            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-dark-gray py-20"
              >
                <Package className="mb-4 h-16 w-16 text-white/20" />
                <h3 className="mb-2 text-xl font-semibold text-off-white">
                  No products found
                </h3>
                <p className="mb-6 text-white/50">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gold-light"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${category}-${material}-${sort}-${search}`}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                  >
                    {displayedProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={handleLoadMore}
                      className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-transparent px-8 py-3 text-sm font-semibold text-gold transition-all hover:border-gold hover:bg-gold/10"
                    >
                      Load More Products
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <p className="mt-2 text-xs text-white/40">
                      {filteredProducts.length - displayCount} more items
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
