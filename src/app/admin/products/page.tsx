"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Upload,
  Loader2,
  ChevronDown,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from "lucide-react";

// ============================================
// Admin Products Page - Full CRUD Management
// ============================================

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  category: string;
  price: number;
  compareAtPrice: number | null;
  material: string | null;
  color: string | null;
  dimensions: string | null;
  weight: number | null;
  images: string[];
  featured: boolean;
  active: boolean;
  inventory: number;
  madeToOrder: boolean;
  customizable: boolean;
  customizationPrompt: string | null;
  tags: string[];
  createdAt: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  price: string;
  compareAtPrice: string;
  material: string;
  color: string;
  dimensions: string;
  weight: string;
  images: string[];
  featured: boolean;
  active: boolean;
  inventory: string;
  madeToOrder: boolean;
  customizable: boolean;
  customizationPrompt: string;
  tags: string;
}

const CATEGORIES = [
  { value: "PRINTING_3D", label: "3D Print" },
  { value: "LASER_ENGRAVE", label: "Laser Engrave" },
  { value: "DESIGN", label: "Design" },
  { value: "OTHER", label: "Other" },
];

const defaultFormData: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  category: "PRINTING_3D",
  price: "",
  compareAtPrice: "",
  material: "",
  color: "",
  dimensions: "",
  weight: "",
  images: [],
  featured: false,
  active: true,
  inventory: "0",
  madeToOrder: false,
  customizable: false,
  customizationPrompt: "",
  tags: "",
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (categoryFilter) params.set("category", categoryFilter);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data.items || []);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Auto-show modal if URL has ?action=new
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "new") {
      openNewProductModal();
    }
  }, []);

  // Modal handlers
  const openNewProductModal = () => {
    setEditingProduct(null);
    setFormData(defaultFormData);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      category: product.category,
      price: (product.price / 100).toFixed(2),
      compareAtPrice: product.compareAtPrice
        ? (product.compareAtPrice / 100).toFixed(2)
        : "",
      material: product.material || "",
      color: product.color || "",
      dimensions: product.dimensions || "",
      weight: product.weight ? product.weight.toString() : "",
      images: product.images || [],
      featured: product.featured,
      active: product.active,
      inventory: product.inventory.toString(),
      madeToOrder: product.madeToOrder,
      customizable: product.customizable,
      customizationPrompt: product.customizationPrompt || "",
      tags: (product.tags || []).join(", "),
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(defaultFormData);
    setError("");
  };

  // Form handlers
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingProduct ? prev.slug : generateSlug(name),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.url as string;
      });
      const urls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
      }));
    } catch {
      setError("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        shortDescription: formData.shortDescription || null,
        category: formData.category,
        price: Math.round(parseFloat(formData.price || "0") * 100),
        compareAtPrice: formData.compareAtPrice
          ? Math.round(parseFloat(formData.compareAtPrice) * 100)
          : null,
        material: formData.material || null,
        color: formData.color || null,
        dimensions: formData.dimensions || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        images: formData.images,
        featured: formData.featured,
        active: formData.active,
        inventory: parseInt(formData.inventory || "0"),
        madeToOrder: formData.madeToOrder,
        customizable: formData.customizable,
        customizationPrompt: formData.customizationPrompt || null,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const url = editingProduct
        ? `/api/admin/products?id=${editingProduct.id}`
        : "/api/admin/products";

      const res = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product");
      }

      setSuccess(editingProduct ? "Product updated!" : "Product created!");
      await fetchProducts();
      setTimeout(() => closeModal(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchProducts();
    } catch {
      setError("Failed to delete product");
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    if (action === "delete") {
      if (
        !confirm(`Are you sure you want to delete ${ids.length} product(s)?`)
      )
        return;
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      if (!res.ok) throw new Error("Bulk action failed");
      setSelectedIds(new Set());
      await fetchProducts();
    } catch {
      setError("Bulk action failed");
    }
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Products
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your product catalog ({products.length} total)
          </p>
        </div>
        <button
          onClick={openNewProductModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-black transition-colors"
          style={{ backgroundColor: "#D4881C" }}
        >
          <Plus size={16} />
          Add New Product
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#111] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 bg-[#111] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C] transition-colors cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] border border-[#333] rounded-lg">
          <span className="text-sm text-gray-400">
            {selectedIds.size} selected
          </span>
          <button
            onClick={() => handleBulkAction("activate")}
            className="px-3 py-1.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-md hover:bg-green-500/30 transition-colors"
          >
            Activate
          </button>
          <button
            onClick={() => handleBulkAction("deactivate")}
            className="px-3 py-1.5 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-md hover:bg-yellow-500/30 transition-colors"
          >
            Deactivate
          </button>
          <button
            onClick={() => handleBulkAction("delete")}
            className="px-3 py-1.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30 transition-colors"
          >
            Delete
          </button>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && !showModal && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError("")} className="ml-auto">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === products.length &&
                      products.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-gray-600 accent-[#D4881C]"
                  />
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Product
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Category
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Price
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Inventory
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-gray-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Loading products...
                    </p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <ImageIcon
                      size={32}
                      className="mx-auto mb-3 text-gray-600"
                    />
                    <p>No products found</p>
                    <button
                      onClick={openNewProductModal}
                      className="mt-2 text-sm hover:underline"
                      style={{ color: "#D4881C" }}
                    >
                      Add your first product
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-[#1a1a1a] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="rounded border-gray-600 accent-[#D4881C]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#222] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={16} className="text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-300">
                        {CATEGORIES.find((c) => c.value === product.category)
                          ?.label || product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">
                        {formatCents(product.price)}
                      </p>
                      {product.compareAtPrice && (
                        <p className="text-xs text-gray-500 line-through">
                          {formatCents(product.compareAtPrice)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {product.madeToOrder ? (
                        <span className="text-xs text-blue-400">
                          Made to Order
                        </span>
                      ) : (
                        <span
                          className={`text-sm ${
                            product.inventory <= 0
                              ? "text-red-400"
                              : product.inventory < 5
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          {product.inventory}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.active
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {product.active ? "Active" : "Inactive"}
                        </span>
                        {product.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#D4881C]/20 text-[#E8A83E]">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={closeModal}
          />
          <div className="relative bg-[#111] border border-[#333] rounded-2xl w-full max-w-3xl shadow-2xl my-8">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-[#111] border-b border-[#222] px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error/Success in modal */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 flex items-center gap-2">
                  <Check size={16} />
                  {success}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <h3
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "#D4881C" }}
                >
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                      placeholder="e.g. Custom 3D Printed Vase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                      placeholder="auto-generated-from-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        shortDescription: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                    placeholder="Brief description for product cards"
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Full Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] resize-y"
                    placeholder="Detailed product description..."
                  />
                </div>
              </div>

              {/* Category & Pricing */}
              <div className="space-y-4">
                <h3
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "#D4881C" }}
                >
                  Category & Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C] cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Price (USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        className="w-full pl-8 pr-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Compare At Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.compareAtPrice}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            compareAtPrice: e.target.value,
                          }))
                        }
                        className="w-full pl-8 pr-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Properties */}
              <div className="space-y-4">
                <h3
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "#D4881C" }}
                >
                  Physical Properties
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Material
                    </label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          material: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                      placeholder="e.g. PLA, Wood"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                      placeholder="e.g. Black, Natural"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={formData.dimensions}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dimensions: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                      placeholder="e.g. 10x5x3 cm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Weight (oz)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          weight: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "#D4881C" }}
                >
                  Images
                </h3>
                <div className="flex flex-wrap gap-3">
                  {formData.images.map((url, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 bg-[#222] rounded-lg overflow-hidden group"
                    >
                      <img
                        src={url}
                        alt={`Product image ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-20 h-20 bg-[#0a0a0a] border-2 border-dashed border-[#333] rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-[#D4881C] hover:text-[#D4881C] transition-colors"
                  >
                    {uploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Upload size={16} />
                        <span className="text-[10px] mt-1">Upload</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <h3
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ color: "#D4881C" }}
                >
                  Settings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Active */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        active: !prev.active,
                      }))
                    }
                    className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#333] rounded-lg hover:border-[#444] transition-colors"
                  >
                    <span className="text-sm text-gray-300">Active</span>
                    {formData.active ? (
                      <ToggleRight size={24} style={{ color: "#D4881C" }} />
                    ) : (
                      <ToggleLeft size={24} className="text-gray-500" />
                    )}
                  </button>

                  {/* Featured */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        featured: !prev.featured,
                      }))
                    }
                    className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#333] rounded-lg hover:border-[#444] transition-colors"
                  >
                    <span className="text-sm text-gray-300">Featured</span>
                    {formData.featured ? (
                      <ToggleRight size={24} style={{ color: "#D4881C" }} />
                    ) : (
                      <ToggleLeft size={24} className="text-gray-500" />
                    )}
                  </button>

                  {/* Made to Order */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        madeToOrder: !prev.madeToOrder,
                      }))
                    }
                    className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#333] rounded-lg hover:border-[#444] transition-colors"
                  >
                    <span className="text-sm text-gray-300">Made to Order</span>
                    {formData.madeToOrder ? (
                      <ToggleRight size={24} style={{ color: "#D4881C" }} />
                    ) : (
                      <ToggleLeft size={24} className="text-gray-500" />
                    )}
                  </button>

                  {/* Customizable */}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        customizable: !prev.customizable,
                      }))
                    }
                    className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#333] rounded-lg hover:border-[#444] transition-colors"
                  >
                    <span className="text-sm text-gray-300">Customizable</span>
                    {formData.customizable ? (
                      <ToggleRight size={24} style={{ color: "#D4881C" }} />
                    ) : (
                      <ToggleLeft size={24} className="text-gray-500" />
                    )}
                  </button>
                </div>

                {/* Customization Prompt */}
                {formData.customizable && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Customization Prompt
                    </label>
                    <textarea
                      value={formData.customizationPrompt}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customizationPrompt: e.target.value,
                        }))
                      }
                      rows={2}
                      className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] resize-y"
                      placeholder='e.g. "Enter the text you want engraved..."'
                    />
                  </div>
                )}
              </div>

              {/* Inventory */}
              {!formData.madeToOrder && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Inventory Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.inventory}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        inventory: e.target.value,
                      }))
                    }
                    className="w-32 px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
                  />
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                  placeholder="Comma separated: vase, decor, custom"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 text-sm font-medium text-gray-400 border border-[#333] rounded-lg hover:bg-[#1a1a1a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-black rounded-lg transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "#D4881C" }}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
