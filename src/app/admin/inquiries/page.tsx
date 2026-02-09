"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
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
  createdAt: string;
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
  NEW: "bg-blue-500/20 text-blue-400",
  REVIEWED: "bg-yellow-500/20 text-yellow-400",
  QUOTED: "bg-purple-500/20 text-purple-400",
  ACCEPTED: "bg-green-500/20 text-green-400",
  IN_PROGRESS: "bg-orange-500/20 text-orange-400",
  COMPLETED: "bg-emerald-500/20 text-emerald-400",
  CANCELLED: "bg-red-500/20 text-red-400",
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

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<ServiceInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedInquiry, setExpandedInquiry] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [quotePrices, setQuotePrices] = useState<Record<string, string>>({});
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/orders?type=inquiries&${params.toString()}`);
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

  // Expand from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inquiryId = params.get("inquiry");
    if (inquiryId) setExpandedInquiry(inquiryId);
  }, []);

  // Update inquiry status
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: "inquiry", status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setSuccess(`Inquiry status updated to ${newStatus.replace("_", " ")}`);
      await fetchInquiries();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  // Submit quote
  const handleSubmitQuote = async (id: string) => {
    const priceStr = quotePrices[id];
    if (!priceStr) return;

    setUpdatingId(id);
    setError("");
    try {
      const priceCents = Math.round(parseFloat(priceStr) * 100);
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
      setSuccess("Quote submitted!");
      setQuotePrices((prev) => ({ ...prev, [id]: "" }));
      await fetchInquiries();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quote");
    } finally {
      setUpdatingId(null);
    }
  };

  // Save admin notes
  const handleSaveNotes = async (id: string) => {
    const notes = adminNotes[id];
    if (!notes?.trim()) return;

    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: "inquiry", adminNotes: notes }),
      });
      if (!res.ok) throw new Error("Failed to save notes");
      setAdminNotes((prev) => ({ ...prev, [id]: "" }));
      await fetchInquiries();
    } catch {
      setError("Failed to save notes");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter
  const filteredInquiries = inquiries.filter((inq) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inq.customerName.toLowerCase().includes(q) ||
      inq.customerEmail.toLowerCase().includes(q) ||
      inq.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Messages */}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by name, email, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#111] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
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
                {s.replace("_", " ")}
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
                  Service Type
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
                <th className="w-10 px-4 py-3" />
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
                      Loading inquiries...
                    </p>
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <MessageSquare
                      size={32}
                      className="mx-auto mb-3 text-gray-600"
                    />
                    <p>No inquiries found</p>
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <React.Fragment key={inquiry.id}>
                    <tr
                      className="hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedInquiry(
                          expandedInquiry === inquiry.id ? null : inquiry.id
                        )
                      }
                    >
                      <td className="px-4 py-4 text-sm text-gray-400">
                        {formatDate(inquiry.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-white">
                          {inquiry.customerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {inquiry.customerEmail}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-300">
                        {serviceTypeLabels[inquiry.serviceType] ||
                          inquiry.serviceType}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {timelineLabels[inquiry.timeline] || inquiry.timeline}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[inquiry.status] ||
                            "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {inquiry.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {inquiry.quotedPrice ? (
                          <span style={{ color: "#D4881C" }}>
                            {formatCents(inquiry.quotedPrice)}
                          </span>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {expandedInquiry === inquiry.id ? (
                          <ChevronUp size={16} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-500" />
                        )}
                      </td>
                    </tr>

                    {/* Expanded Detail */}
                    {expandedInquiry === inquiry.id && (
                      <tr>
                        <td colSpan={7} className="p-0">
                          <div className="bg-[#0d0d0d] border-t border-b border-[#222] p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Customer Details */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-2">
                                    <User size={14} />
                                    Customer Details
                                  </h4>
                                  <div className="bg-[#111] p-3 rounded-lg border border-[#222] text-sm text-gray-400 space-y-1">
                                    <p>
                                      <strong className="text-white">
                                        {inquiry.customerName}
                                      </strong>
                                    </p>
                                    <p>{inquiry.customerEmail}</p>
                                    {inquiry.customerPhone && (
                                      <p>{inquiry.customerPhone}</p>
                                    )}
                                    {inquiry.company && (
                                      <p>Company: {inquiry.company}</p>
                                    )}
                                    {inquiry.referralSource && (
                                      <p className="text-xs text-gray-500">
                                        Referral: {inquiry.referralSource}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Description */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-2">
                                    <FileText size={14} />
                                    Project Description
                                  </h4>
                                  <div className="bg-[#111] p-3 rounded-lg border border-[#222] text-sm text-gray-400 whitespace-pre-wrap">
                                    {inquiry.description}
                                  </div>
                                </div>

                                {/* Project Details */}
                                <div className="bg-[#111] p-3 rounded-lg border border-[#222] text-sm text-gray-400 space-y-1">
                                  <p>
                                    Quantity:{" "}
                                    <span className="text-white">
                                      {inquiry.quantity}
                                    </span>
                                  </p>
                                  {inquiry.material && (
                                    <p>
                                      Material:{" "}
                                      <span className="text-white">
                                        {inquiry.material}
                                      </span>
                                    </p>
                                  )}
                                  {inquiry.color && (
                                    <p>
                                      Color:{" "}
                                      <span className="text-white">
                                        {inquiry.color}
                                      </span>
                                    </p>
                                  )}
                                  {inquiry.budget && (
                                    <p>
                                      Budget:{" "}
                                      <span className="text-white">
                                        {inquiry.budget}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Files & Reply */}
                              <div className="space-y-4">
                                {/* Uploaded Files */}
                                {inquiry.fileUrls &&
                                  inquiry.fileUrls.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-2">
                                        <Download size={14} />
                                        Uploaded Files
                                      </h4>
                                      <div className="space-y-2">
                                        {inquiry.fileUrls.map(
                                          (url, i) => (
                                            <a
                                              key={i}
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-2 bg-[#111] p-3 rounded-lg border border-[#222] text-sm hover:border-[#444] transition-colors"
                                              style={{ color: "#D4881C" }}
                                            >
                                              <Download size={14} />
                                              File {i + 1}
                                            </a>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {/* Quote Input */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-2">
                                    <DollarSign size={14} />
                                    Quote Price
                                  </h4>
                                  {inquiry.quotedPrice && (
                                    <p
                                      className="text-lg font-bold mb-2"
                                      style={{ color: "#D4881C" }}
                                    >
                                      {formatCents(inquiry.quotedPrice)}
                                    </p>
                                  )}
                                  <div className="flex gap-2">
                                    <div className="relative flex-1">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        $
                                      </span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={quotePrices[inquiry.id] || ""}
                                        onChange={(e) =>
                                          setQuotePrices((prev) => ({
                                            ...prev,
                                            [inquiry.id]: e.target.value,
                                          }))
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Enter quote..."
                                        className="w-full pl-8 pr-4 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                                      />
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSubmitQuote(inquiry.id);
                                      }}
                                      disabled={
                                        !quotePrices[inquiry.id] ||
                                        updatingId === inquiry.id
                                      }
                                      className="px-4 py-2 text-sm font-semibold text-black rounded-lg transition-colors disabled:opacity-50"
                                      style={{ backgroundColor: "#D4881C" }}
                                    >
                                      {updatingId === inquiry.id ? (
                                        <Loader2
                                          size={14}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        "Quote"
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Reply via Email */}
                                <a
                                  href={`mailto:${inquiry.customerEmail}?subject=Re: ${
                                    serviceTypeLabels[inquiry.serviceType] ||
                                    inquiry.serviceType
                                  } Inquiry - 423D Built&body=Hi ${inquiry.customerName},%0D%0A%0D%0AThank you for your inquiry about our ${
                                    serviceTypeLabels[inquiry.serviceType] ||
                                    inquiry.serviceType
                                  } services.%0D%0A%0D%0A`}
                                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-[#333] rounded-lg text-gray-300 hover:bg-[#1a1a1a] transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Mail size={14} />
                                  Reply via Email
                                </a>
                              </div>

                              {/* Status & Notes */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-300 mb-2">
                                    Update Status
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {STATUS_FLOW.map((s) => (
                                      <button
                                        key={s}
                                        disabled={
                                          inquiry.status === s ||
                                          updatingId === inquiry.id
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusUpdate(inquiry.id, s);
                                        }}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                                          inquiry.status === s
                                            ? statusColors[s] +
                                              " border-transparent"
                                            : "border-[#333] text-gray-400 hover:border-[#555] hover:text-white"
                                        }`}
                                      >
                                        {s.replace("_", " ")}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Admin Notes */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-2">
                                    <StickyNote size={14} />
                                    Admin Notes
                                  </h4>
                                  {inquiry.adminNotes && (
                                    <div className="bg-[#111] p-3 rounded-lg border border-[#222] text-sm text-gray-400 mb-2 whitespace-pre-wrap">
                                      {inquiry.adminNotes}
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <textarea
                                      value={adminNotes[inquiry.id] || ""}
                                      onChange={(e) =>
                                        setAdminNotes((prev) => ({
                                          ...prev,
                                          [inquiry.id]: e.target.value,
                                        }))
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      rows={2}
                                      placeholder="Add internal notes..."
                                      className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] resize-y"
                                    />
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveNotes(inquiry.id);
                                    }}
                                    disabled={
                                      !adminNotes[inquiry.id] ||
                                      updatingId === inquiry.id
                                    }
                                    className="mt-2 px-4 py-2 text-sm font-medium border border-[#333] rounded-lg text-gray-300 hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
                                  >
                                    Save Notes
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
