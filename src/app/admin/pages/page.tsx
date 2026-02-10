"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Loader2,
  Layout,
  AlertCircle,
  Check,
  Eye,
  Blocks,
} from "lucide-react";

// ============================================
// Admin Pages List - Page Management
// ============================================

interface PageItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  isSystem: boolean;
  blocks: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New page inline form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch pages
  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/pages?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch pages");
      const data = await res.json();
      setPages(data.items || []);
    } catch {
      setError("Failed to load pages");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (title: string) => {
    setNewTitle(title);
    setNewSlug(generateSlug(title));
  };

  // Create new page
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug: newSlug.trim() || generateSlug(newTitle),
          published: false,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create page");
      }

      setSuccess("Page created!");
      setNewTitle("");
      setNewSlug("");
      setShowNewForm(false);
      await fetchPages();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create page");
    } finally {
      setCreating(false);
    }
  };

  // Delete page
  const handleDelete = async (page: PageItem) => {
    if (page.isSystem) return;
    if (!confirm(`Are you sure you want to delete "${page.title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/pages?id=${page.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete page");
      setSuccess("Page deleted");
      await fetchPages();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to delete page");
    }
  };

  // Toggle published status
  const handleTogglePublished = async (page: PageItem) => {
    try {
      const res = await fetch(`/api/admin/pages?id=${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !page.published }),
      });
      if (!res.ok) throw new Error("Failed to update page");
      await fetchPages();
    } catch {
      setError("Failed to update page status");
    }
  };

  // Filtered pages
  const filteredPages = pages.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q)
    );
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
            Pages
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your site pages ({pages.length} total)
          </p>
        </div>
        <button
          onClick={() => {
            setShowNewForm(true);
            setError("");
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-black transition-colors hover:opacity-90"
          style={{ backgroundColor: "#D4881C" }}
        >
          <Plus size={16} />
          Add New Page
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#111] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] transition-colors"
          />
        </div>
      </div>

      {/* New Page Inline Form */}
      {showNewForm && (
        <div className="bg-[#111] border border-[#333] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "#D4881C" }}
            >
              Create New Page
            </h3>
            <button
              onClick={() => {
                setShowNewForm(false);
                setNewTitle("");
                setNewSlug("");
              }}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleCreatePage} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                  placeholder="e.g. About Us"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                  placeholder="auto-generated-from-title"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={creating || !newTitle.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-black rounded-lg transition-colors disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: "#D4881C" }}
              >
                {creating && <Loader2 size={14} className="animate-spin" />}
                Create Page
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewForm(false);
                  setNewTitle("");
                  setNewSlug("");
                }}
                className="px-5 py-2 text-sm font-medium text-gray-400 border border-[#333] rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError("")} className="ml-auto">
            <X size={14} />
          </button>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 flex items-center gap-2">
          <Check size={16} />
          {success}
        </div>
      )}

      {/* Pages Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Page Title
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Slug
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Blocks
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-gray-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Loading pages...
                    </p>
                  </td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <Layout
                      size={32}
                      className="mx-auto mb-3 text-gray-600"
                    />
                    <p>No pages found</p>
                    <button
                      onClick={() => setShowNewForm(true)}
                      className="mt-2 text-sm hover:underline"
                      style={{ color: "#D4881C" }}
                    >
                      Create your first page
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr
                    key={page.id}
                    className="hover:bg-[#1a1a1a] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#222] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Layout size={14} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {page.title}
                          </p>
                          {page.isSystem && (
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                              System Page
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-400 font-mono">
                        /{page.slug}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePublished(page)}
                        className="flex items-center gap-2 group"
                        title={page.published ? "Click to unpublish" : "Click to publish"}
                      >
                        {page.published ? (
                          <>
                            <ToggleRight size={20} style={{ color: "#D4881C" }} />
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                              Published
                            </span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={20} className="text-gray-500 group-hover:text-gray-300" />
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                              Draft
                            </span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Blocks size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-300">
                          {page.blocks}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {page.published && (
                          <Link
                            href={`/${page.slug}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
                            title="View Page"
                          >
                            <Eye size={14} />
                          </Link>
                        )}
                        <Link
                          href={`/admin/pages/${page.id}`}
                          className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(page)}
                          disabled={page.isSystem}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                          title={page.isSystem ? "System pages cannot be deleted" : "Delete"}
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
    </div>
  );
}
