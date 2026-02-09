"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Loader2,
  MessageSquare,
  Download,
  Mail,
  AlertCircle,
  Check,
  X,
  DollarSign,
  StickyNote,
  User,
  Clock,
  FileText,
  Send,
  ExternalLink,
  Hash,
  Briefcase,
  Phone,
  Palette,
  Box,
  Calendar,
  ArrowRight,
} from "lucide-react";

// ============================================
// Admin Inquiries Page - Service Inquiry Management
// ============================================

interface ServiceInquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  company: string | null;
  serviceType: string;
  description: string;
  material: string | null;
  color: string | null;
  quantity: number;
  fileUrls: string[];
  timeline: string;
  budget: string | null;
  referralSource: string | null;
  status: string;
  quotedPrice: number | null;
  adminNotes: string | null;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_FLOW = [
  "NEW",
  "REVIEWED",
  "QUOTED",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  REVIEWED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  QUOTED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  ACCEPTED: "bg-green-500/20 text-green-400 border-green-500/30",
  IN_PROGRESS: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusDotColors: Record<string, string> = {
  NEW: "bg-blue-400",
  REVIEWED: "bg-yellow-400",
  QUOTED: "bg-purple-400",
  ACCEPTED: "bg-green-400",
  IN_PROGRESS: "bg-orange-400",
  COMPLETED: "bg-emerald-400",
  CANCELLED: "bg-red-400",
};

const serviceTypeLabels: Record<string, string> = {
  PRINTING_3D: "3D Printing",
  LASER_ENGRAVING: "Laser Engraving",
  DESIGN: "Design",
  CONSULTATION: "Consultation",
};

const timelineLabels: Record<string, string> = {
  STANDARD: "Standard (2-3 weeks)",
  RUSH: "Rush (1 week)",
  FLEXIBLE: "Flexible",
};

const timelineBadgeColors: Record<string, string> = {
  STANDARD: "bg-gray-500/20 text-gray-400",
  RUSH: "bg-red-500/20 text-red-400",
  FLEXIBLE: "bg-teal-500/20 text-teal-400",
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function getFileNameFromUrl(url: string): string {
  try {
    const parts = url.split("/");
    const name = parts[parts.length - 1];
    return decodeURIComponent(name).replace(/^\d+-/, "") || `File`;
  } catch {
    return "File";
  }
}

function getFileExtension(url: string): string {
  try {
    const parts = url.split(".");
    return parts[parts.length - 1].toUpperCase().slice(0, 4);
  } catch {
    return "FILE";
  }
}

// Status progression helper: get next valid status
function getNextStatus(current: string): string | null {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx < 0 || idx >= STATUS_FLOW.length - 2) return null; // Skip CANCELLED as a "next"
  return STATUS_FLOW[idx + 1];
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<ServiceInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<ServiceInquiry | null>(
    null
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [quotePrice, setQuotePrice] = useState("");
  const [noteText, setNoteText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [savingResponse, setSavingResponse] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", "inquiries");
      if (statusFilter) params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch inquiries");
      const data = await res.json();
      setInquiries(data.items || []);
    } catch {
      setError("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Open from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inquiryId = params.get("inquiry");
    if (inquiryId && inquiries.length > 0) {
      const found = inquiries.find((i) => i.id === inquiryId);
      if (found) openDetail(found);
    }
  }, [inquiries]);

  // Open detail panel
  const openDetail = (inquiry: ServiceInquiry) => {
    setSelectedInquiry(inquiry);
    setQuotePrice(
      inquiry.quotedPrice ? (inquiry.quotedPrice / 100).toFixed(2) : ""
    );
    setResponseText(inquiry.adminResponse || "");
    setNoteText("");
    setShowStatusDropdown(false);
    setError("");
    setSuccess("");
  };

  // Close detail panel
  const closeDetail = () => {
    setSelectedInquiry(null);
    setQuotePrice("");
    setResponseText("");
    setNoteText("");
    setShowStatusDropdown(false);
  };

  // Update inquiry status
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    setError("");
    setShowStatusDropdown(false);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: "inquiry", status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setSuccess(`Status updated to ${newStatus.replace(/_/g, " ")}`);
      await fetchInquiries();
      // Update the selected inquiry locally
      setSelectedInquiry((prev) =>
        prev && prev.id === id ? { ...prev, status: newStatus } : prev
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  // Submit quote
  const handleSubmitQuote = async (id: string) => {
    if (!quotePrice) return;

    setUpdatingId(id);
    setError("");
    try {
      const priceCents = Math.round(parseFloat(quotePrice) * 100);
      if (isNaN(priceCents) || priceCents <= 0) {
        setError("Please enter a valid price");
        setUpdatingId(null);
        return;
      }
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          type: "inquiry",
          quotedPrice: priceCents,
          status: "QUOTED",
        }),
      });
      if (!res.ok) throw new Error("Failed to submit quote");
      setSuccess("Quote submitted successfully!");
      await fetchInquiries();
      setSelectedInquiry((prev) =>
        prev && prev.id === id
          ? { ...prev, quotedPrice: priceCents, status: "QUOTED" }
          : prev
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quote");
    } finally {
      setUpdatingId(null);
    }
  };

  // Save admin notes
  const handleSaveNotes = async (id: string) => {
    if (!noteText.trim()) return;

    setSavingNotes(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: "inquiry", adminNotes: noteText }),
      });
      if (!res.ok) throw new Error("Failed to save notes");
      const data = await res.json();
      setNoteText("");
      setSuccess("Notes saved!");
      await fetchInquiries();
      setSelectedInquiry((prev) =>
        prev && prev.id === id
          ? { ...prev, adminNotes: data.inquiry?.adminNotes ?? prev.adminNotes }
          : prev
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  // Save admin response
  const handleSaveResponse = async (id: string) => {
    if (!responseText.trim()) return;

    setSavingResponse(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          type: "inquiry",
          adminResponse: responseText,
        }),
      });
      if (!res.ok) throw new Error("Failed to save response");
      setSuccess("Response saved!");
      await fetchInquiries();
      setSelectedInquiry((prev) =>
        prev && prev.id === id
          ? { ...prev, adminResponse: responseText }
          : prev
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save response");
    } finally {
      setSavingResponse(false);
    }
  };

  // Stats
  const statusCounts = inquiries.reduce(
    (acc, inq) => {
      acc[inq.status] = (acc[inq.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Filter
  const filteredInquiries = inquiries.filter((inq) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inq.customerName.toLowerCase().includes(q) ||
      inq.customerEmail.toLowerCase().includes(q) ||
      inq.description.toLowerCase().includes(q) ||
      (inq.company && inq.company.toLowerCase().includes(q))
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
            Service Inquiries
          </h1>
          <p className="text-gray-400 mt-1">
            Manage custom service requests ({inquiries.length} total)
          </p>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {STATUS_FLOW.map((s) => (
          <motion.button
            key={s}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
            className={`relative p-3 rounded-xl border transition-all ${
              statusFilter === s
                ? "border-[#D4881C] bg-[#D4881C]/5"
                : "border-[#222] bg-[#111] hover:border-[#333]"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2 h-2 rounded-full ${statusDotColors[s] || "bg-gray-500"}`}
              />
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                {s.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-xl font-bold text-white text-left">
              {statusCounts[s] || 0}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && !selectedInquiry && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2"
          >
            <AlertCircle size={16} />
            {error}
            <button onClick={() => setError("")} className="ml-auto">
              <X size={14} />
            </button>
          </motion.div>
        )}
        {success && !selectedInquiry && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 flex items-center gap-2"
          >
            <Check size={16} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by name, email, company, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#111] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 bg-[#111] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C] cursor-pointer"
          >
            <option value="">All Statuses</option>
            {STATUS_FLOW.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Service
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Timeline
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Quote
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Files
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Loader2
                      size={24}
                      className="mx-auto animate-spin text-gray-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Loading inquiries...
                    </p>
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <MessageSquare
                      size={32}
                      className="mx-auto mb-3 text-gray-600"
                    />
                    <p>No inquiries found</p>
                    {statusFilter && (
                      <button
                        onClick={() => setStatusFilter("")}
                        className="mt-2 text-sm hover:underline"
                        style={{ color: "#D4881C" }}
                      >
                        Clear filter
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry, index) => (
                  <motion.tr
                    key={inquiry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={`hover:bg-[#1a1a1a] transition-colors cursor-pointer ${
                      selectedInquiry?.id === inquiry.id
                        ? "bg-[#1a1a1a]"
                        : ""
                    }`}
                    onClick={() => openDetail(inquiry)}
                  >
                    <td className="px-4 py-4 text-sm text-gray-400 whitespace-nowrap">
                      {formatDateShort(inquiry.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-white font-medium">
                        {inquiry.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {inquiry.customerEmail}
                      </p>
                      {inquiry.company && (
                        <p className="text-xs text-gray-600">
                          {inquiry.company}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">
                      {serviceTypeLabels[inquiry.serviceType] ||
                        inquiry.serviceType}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          timelineBadgeColors[inquiry.timeline] ||
                          "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        <Clock size={10} />
                        {inquiry.timeline === "RUSH"
                          ? "Rush"
                          : inquiry.timeline === "FLEXIBLE"
                            ? "Flexible"
                            : "Standard"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          statusColors[inquiry.status] ||
                          "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusDotColors[inquiry.status] || "bg-gray-500"}`}
                        />
                        {inquiry.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {inquiry.quotedPrice ? (
                        <span
                          className="font-semibold"
                          style={{ color: "#D4881C" }}
                        >
                          {formatCents(inquiry.quotedPrice)}
                        </span>
                      ) : (
                        <span className="text-gray-600">--</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {inquiry.fileUrls && inquiry.fileUrls.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <FileText size={12} />
                          {inquiry.fileUrls.length}
                        </span>
                      ) : (
                        <span className="text-gray-600">--</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <ChevronRight size={16} className="text-gray-500" />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================= */}
      {/* Inquiry Detail Slide-Out Panel */}
      {/* ============================= */}
      <AnimatePresence>
        {selectedInquiry && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={closeDetail}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#0a0a0a] border-l border-[#222] z-50 overflow-y-auto"
            >
              {/* Panel Header */}
              <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#222]">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white">
                      Inquiry Details
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        statusColors[selectedInquiry.status] ||
                        "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusDotColors[selectedInquiry.status] || "bg-gray-500"}`}
                      />
                      {selectedInquiry.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <button
                    onClick={closeDetail}
                    className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Messages inside panel */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mx-6 mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2"
                    >
                      <AlertCircle size={16} />
                      {error}
                      <button
                        onClick={() => setError("")}
                        className="ml-auto"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mx-6 mb-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 flex items-center gap-2"
                    >
                      <Check size={16} />
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6 space-y-6">
                {/* ---- Customer Info Card ---- */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-[#111] border border-[#222] rounded-xl p-5"
                >
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-4"
                    style={{ color: "#D4881C" }}
                  >
                    <User
                      size={12}
                      className="inline mr-1.5"
                      style={{ color: "#D4881C" }}
                    />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Name</p>
                      <p className="text-sm text-white font-medium">
                        {selectedInquiry.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Email</p>
                      <a
                        href={`mailto:${selectedInquiry.customerEmail}`}
                        className="text-sm hover:underline"
                        style={{ color: "#D4881C" }}
                      >
                        {selectedInquiry.customerEmail}
                      </a>
                    </div>
                    {selectedInquiry.customerPhone && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">
                          <Phone size={10} className="inline mr-1" />
                          Phone
                        </p>
                        <p className="text-sm text-gray-300">
                          {selectedInquiry.customerPhone}
                        </p>
                      </div>
                    )}
                    {selectedInquiry.company && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">
                          <Briefcase size={10} className="inline mr-1" />
                          Company
                        </p>
                        <p className="text-sm text-gray-300">
                          {selectedInquiry.company}
                        </p>
                      </div>
                    )}
                    {selectedInquiry.referralSource && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-0.5">
                          Referral Source
                        </p>
                        <p className="text-sm text-gray-400">
                          {selectedInquiry.referralSource}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#222] flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={10} />
                    Submitted {formatDate(selectedInquiry.createdAt)}
                  </div>
                </motion.div>

                {/* ---- Service Details Card ---- */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-[#111] border border-[#222] rounded-xl p-5"
                >
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-4"
                    style={{ color: "#D4881C" }}
                  >
                    <FileText
                      size={12}
                      className="inline mr-1.5"
                      style={{ color: "#D4881C" }}
                    />
                    Service Details
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        Service Type
                      </p>
                      <p className="text-sm text-white font-medium">
                        {serviceTypeLabels[selectedInquiry.serviceType] ||
                          selectedInquiry.serviceType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Timeline</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          timelineBadgeColors[selectedInquiry.timeline] ||
                          "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        <Clock size={10} />
                        {timelineLabels[selectedInquiry.timeline] ||
                          selectedInquiry.timeline}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        <Hash size={10} className="inline mr-1" />
                        Quantity
                      </p>
                      <p className="text-sm text-white font-medium">
                        {selectedInquiry.quantity}
                      </p>
                    </div>
                    {selectedInquiry.material && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">
                          <Box size={10} className="inline mr-1" />
                          Material
                        </p>
                        <p className="text-sm text-gray-300">
                          {selectedInquiry.material}
                        </p>
                      </div>
                    )}
                    {selectedInquiry.color && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">
                          <Palette size={10} className="inline mr-1" />
                          Color
                        </p>
                        <p className="text-sm text-gray-300">
                          {selectedInquiry.color}
                        </p>
                      </div>
                    )}
                    {selectedInquiry.budget && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">
                          <DollarSign size={10} className="inline mr-1" />
                          Budget
                        </p>
                        <p className="text-sm text-gray-300">
                          {selectedInquiry.budget}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">
                      Project Description
                    </p>
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {selectedInquiry.description}
                    </div>
                  </div>
                </motion.div>

                {/* ---- Uploaded Files Card ---- */}
                {selectedInquiry.fileUrls &&
                  selectedInquiry.fileUrls.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bg-[#111] border border-[#222] rounded-xl p-5"
                    >
                      <h3
                        className="text-xs font-semibold uppercase tracking-wider mb-4"
                        style={{ color: "#D4881C" }}
                      >
                        <Download
                          size={12}
                          className="inline mr-1.5"
                          style={{ color: "#D4881C" }}
                        />
                        Uploaded Files ({selectedInquiry.fileUrls.length})
                      </h3>
                      <div className="space-y-2">
                        {selectedInquiry.fileUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg hover:border-[#333] transition-colors group"
                          >
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                              style={{
                                backgroundColor: "rgba(212, 136, 28, 0.15)",
                                color: "#D4881C",
                              }}
                            >
                              {getFileExtension(url)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-300 truncate group-hover:text-white transition-colors">
                                {getFileNameFromUrl(url)}
                              </p>
                              <p className="text-xs text-gray-600">
                                Click to download
                              </p>
                            </div>
                            <ExternalLink
                              size={14}
                              className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0"
                            />
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}

                {/* ---- Status Management Card ---- */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-[#111] border border-[#222] rounded-xl p-5"
                >
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-4"
                    style={{ color: "#D4881C" }}
                  >
                    Status Management
                  </h3>

                  {/* Status Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      {STATUS_FLOW.filter((s) => s !== "CANCELLED").map(
                        (s, i) => {
                          const statusIdx = STATUS_FLOW.indexOf(
                            selectedInquiry.status
                          );
                          const thisIdx = STATUS_FLOW.indexOf(s);
                          const isActive = thisIdx <= statusIdx;
                          const isCurrent =
                            s === selectedInquiry.status;
                          return (
                            <React.Fragment key={s}>
                              {i > 0 && (
                                <div
                                  className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${
                                    isActive ? "bg-[#D4881C]" : "bg-[#333]"
                                  }`}
                                />
                              )}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-3 h-3 rounded-full border-2 transition-colors ${
                                    isCurrent
                                      ? "border-[#D4881C] bg-[#D4881C]"
                                      : isActive
                                        ? "border-[#D4881C] bg-[#D4881C]/50"
                                        : "border-[#444] bg-transparent"
                                  }`}
                                />
                                <span
                                  className={`text-[9px] mt-1 whitespace-nowrap ${
                                    isCurrent
                                      ? "text-[#D4881C] font-semibold"
                                      : isActive
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                  }`}
                                >
                                  {s.replace(/_/g, " ")}
                                </span>
                              </div>
                            </React.Fragment>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Quick Next Status + Status Selector */}
                  <div className="flex items-center gap-3">
                    {getNextStatus(selectedInquiry.status) && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleStatusUpdate(
                            selectedInquiry.id,
                            getNextStatus(selectedInquiry.status)!
                          )
                        }
                        disabled={updatingId === selectedInquiry.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-black rounded-lg transition-colors disabled:opacity-50"
                        style={{ backgroundColor: "#D4881C" }}
                      >
                        {updatingId === selectedInquiry.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <ArrowRight size={14} />
                            Move to{" "}
                            {getNextStatus(selectedInquiry.status)!.replace(
                              /_/g,
                              " "
                            )}
                          </>
                        )}
                      </motion.button>
                    )}

                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowStatusDropdown(!showStatusDropdown)
                        }
                        className="px-4 py-2.5 text-sm font-medium border border-[#333] rounded-lg text-gray-300 hover:bg-[#1a1a1a] transition-colors flex items-center gap-2"
                      >
                        Set Status
                        <ChevronDown size={12} />
                      </button>

                      <AnimatePresence>
                        {showStatusDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute bottom-full right-0 mb-2 bg-[#111] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-20 min-w-[180px]"
                          >
                            {STATUS_FLOW.map((s) => (
                              <button
                                key={s}
                                disabled={
                                  selectedInquiry.status === s ||
                                  updatingId === selectedInquiry.id
                                }
                                onClick={() =>
                                  handleStatusUpdate(selectedInquiry.id, s)
                                }
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#1a1a1a] transition-colors flex items-center gap-2.5 disabled:opacity-30 disabled:cursor-not-allowed ${
                                  selectedInquiry.status === s
                                    ? "text-[#D4881C] font-medium"
                                    : "text-gray-300"
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${statusDotColors[s] || "bg-gray-500"}`}
                                />
                                {s.replace(/_/g, " ")}
                                {selectedInquiry.status === s && (
                                  <Check
                                    size={12}
                                    className="ml-auto"
                                    style={{ color: "#D4881C" }}
                                  />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>

                {/* ---- Quote Price Card ---- */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-[#111] border border-[#222] rounded-xl p-5"
                >
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-4"
                    style={{ color: "#D4881C" }}
                  >
                    <DollarSign
                      size={12}
                      className="inline mr-1.5"
                      style={{ color: "#D4881C" }}
                    />
                    Quoted Price
                  </h3>

                  {selectedInquiry.quotedPrice && (
                    <div className="mb-3 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg">
                      <p className="text-xs text-gray-500 mb-0.5">
                        Current Quote
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "#D4881C" }}
                      >
                        {formatCents(selectedInquiry.quotedPrice)}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={quotePrice}
                        onChange={(e) => setQuotePrice(e.target.value)}
                        placeholder="Enter quote amount..."
                        className="w-full pl-8 pr-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] transition-colors"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubmitQuote(selectedInquiry.id)}
                      disabled={
                        !quotePrice || updatingId === selectedInquiry.id
                      }
                      className="px-5 py-2.5 text-sm font-semibold text-black rounded-lg transition-colors disabled:opacity-50"
                      style={{ backgroundColor: "#D4881C" }}
                    >
                      {updatingId === selectedInquiry.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Set Quote"
                      )}
                    </motion.button>
                  </div>
                </motion.div>

                {/* ---- Admin Response Card ---- */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-[#111] border border-[#222] rounded-xl p-5"
                >
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-4"
                    style={{ color: "#D4881C" }}
                  >
                    <MessageSquare
                      size={12}
                      className="inline mr-1.5"
                      style={{ color: "#D4881C" }}
                    />
                    Admin Response
                  </h3>

                  <p className="text-xs text-gray-500 mb-2">
                    Write a response to the customer. This can be included in
                    email communications.
                  </p>

                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    placeholder="Write your response to the customer..."
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] resize-y transition-colors"
                  />

                  <div className="flex items-center gap-3 mt-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSaveResponse(selectedInquiry.id)}
                      disabled={!responseText.trim() || savingResponse}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-black rounded-lg transition-colors disabled:opacity-50"
                      style={{ backgroundColor: "#D4881C" }}
                    >
                      {savingResponse ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      Save Response
                    </motion.button>

                    <a
                      href={`mailto:${selectedInquiry.customerEmail}?subject=Re: ${
                        serviceTypeLabels[selectedInquiry.serviceType] ||
                        selectedInquiry.serviceType
                      } Inquiry - 423D Built&body=${encodeURIComponent(
                        `Hi ${selectedInquiry.customerName},\n\n${responseText || "Thank you for your inquiry about our " + (serviceTypeLabels[selectedInquiry.serviceType] || selectedInquiry.serviceType) + " services."}\n\nBest regards,\n423D Built Team`
                      )}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-[#333] rounded-lg text-gray-300 hover:bg-[#1a1a1a] transition-colors"
                    >
                      <Mail size={14} />
                      Send via Email
                    </a>
                  </div>
                </motion.div>

                {/* ---- Admin Notes Card ---- */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-[#111] border border-[#222] rounded-xl p-5"
                >
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-4"
                    style={{ color: "#D4881C" }}
                  >
                    <StickyNote
                      size={12}
                      className="inline mr-1.5"
                      style={{ color: "#D4881C" }}
                    />
                    Internal Notes
                  </h3>

                  {/* Existing notes */}
                  {selectedInquiry.adminNotes && (
                    <div className="mb-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 max-h-48 overflow-y-auto">
                      <div className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
                        {selectedInquiry.adminNotes
                          .split("\n")
                          .map((line, i) => (
                            <div
                              key={i}
                              className={
                                line.startsWith("[")
                                  ? "mt-2 first:mt-0"
                                  : ""
                              }
                            >
                              {line.startsWith("[") ? (
                                <>
                                  <span className="text-xs text-gray-600">
                                    {line.match(/\[.*?\]/)?.[0]}
                                  </span>
                                  <span className="text-gray-300">
                                    {line.replace(/\[.*?\]/, "")}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-300">{line}</span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* New note input */}
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={2}
                    placeholder="Add an internal note (only visible to admins)..."
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] resize-y transition-colors"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSaveNotes(selectedInquiry.id)}
                    disabled={!noteText.trim() || savingNotes}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[#333] rounded-lg text-gray-300 hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
                  >
                    {savingNotes ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <StickyNote size={14} />
                    )}
                    Add Note
                  </motion.button>
                </motion.div>

                {/* Bottom spacer for scroll */}
                <div className="h-6" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
