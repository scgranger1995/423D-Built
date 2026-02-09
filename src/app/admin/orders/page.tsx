"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShoppingCart,
  Printer,
  Truck,
  MapPin,
  Package,
  StickyNote,
  AlertCircle,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

// ============================================
// Admin Orders Page - Full Order Management
// ============================================

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  customization: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
  };
  billingAddress: unknown;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  status: string;
  paymentStatus: string;
  stripePaymentIntentId: string | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  labelUrl: string | null;
  notes: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PAID: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PROCESSING: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  SHIPPED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DELIVERED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  REFUNDED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  PAID: "bg-green-500/20 text-green-400",
  REFUNDED: "bg-gray-500/20 text-gray-400",
};

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [creatingLabel, setCreatingLabel] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<Record<string, string>>({});

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.items || []);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Expand from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order");
    if (orderId) setExpandedOrder(orderId);
  }, []);

  // Update order status
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }
      setSuccess(`Order status updated to ${newStatus}`);
      await fetchOrders();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Add notes
  const handleAddNote = async (orderId: string) => {
    const note = noteText[orderId];
    if (!note?.trim()) return;

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, notes: note }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      setNoteText((prev) => ({ ...prev, [orderId]: "" }));
      await fetchOrders();
    } catch {
      setError("Failed to add note");
    }
  };

  // Create shipping label
  const handleCreateLabel = async (orderId: string) => {
    setCreatingLabel(orderId);
    setError("");
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createLabel", orderId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create label");
      }
      setSuccess("Shipping label created!");
      await fetchOrders();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create label");
    } finally {
      setCreatingLabel(null);
    }
  };

  // Filter orders on client side for search
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q)
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
          Orders
        </h1>
        <p className="text-gray-400 mt-1">
          Manage customer orders ({orders.length} total)
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
            placeholder="Search by order #, customer name, or email..."
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
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Order
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Items
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Total
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Payment
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
                      Loading orders...
                    </p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    <ShoppingCart
                      size={32}
                      className="mx-auto mb-3 text-gray-600"
                    />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    {/* Order Row */}
                    <tr
                      className="hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order.id ? null : order.id
                        )
                      }
                    >
                      <td className="px-4 py-4">
                        <span
                          className="font-mono text-sm font-medium"
                          style={{ color: "#D4881C" }}
                        >
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-white">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.customerEmail}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-300">
                        {order.items?.length || 0} item
                        {(order.items?.length || 0) !== 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        {formatCents(order.total)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[order.status] ||
                            "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            paymentStatusColors[order.paymentStatus] ||
                            "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {expandedOrder === order.id ? (
                          <ChevronUp size={16} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-500" />
                        )}
                      </td>
                    </tr>

                    {/* Expanded Detail View */}
                    {expandedOrder === order.id && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <div className="bg-[#0d0d0d] border-t border-b border-[#222] p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Customer & Shipping Info */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-2">
                                    <MapPin size={14} />
                                    Shipping Address
                                  </h4>
                                  <div className="text-sm text-gray-400 bg-[#111] p-3 rounded-lg border border-[#222]">
                                    <p>{order.shippingAddress.name}</p>
                                    <p>{order.shippingAddress.street1}</p>
                                    {order.shippingAddress.street2 && (
                                      <p>{order.shippingAddress.street2}</p>
                                    )}
                                    <p>
                                      {order.shippingAddress.city},{" "}
                                      {order.shippingAddress.state}{" "}
                                      {order.shippingAddress.zip}
                                    </p>
                                    <p>{order.shippingAddress.country}</p>
                                    {order.customerPhone && (
                                      <p className="mt-1 text-xs">
                                        Phone: {order.customerPhone}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Payment Info */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-2">
                                    <Package size={14} />
                                    Payment Details
                                  </h4>
                                  <div className="text-sm text-gray-400 bg-[#111] p-3 rounded-lg border border-[#222] space-y-1">
                                    <div className="flex justify-between">
                                      <span>Subtotal:</span>
                                      <span>
                                        {formatCents(order.subtotal)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Shipping:</span>
                                      <span>
                                        {formatCents(order.shippingCost)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Tax:</span>
                                      <span>
                                        {formatCents(order.taxAmount)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between pt-1 border-t border-[#222] font-semibold text-white">
                                      <span>Total:</span>
                                      <span>{formatCents(order.total)}</span>
                                    </div>
                                    {order.stripePaymentIntentId && (
                                      <p className="text-xs text-gray-500 pt-1">
                                        Stripe PI:{" "}
                                        {order.stripePaymentIntentId}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-2">
                                  <ShoppingCart size={14} />
                                  Order Items
                                </h4>
                                <div className="space-y-2">
                                  {order.items?.map((item) => (
                                    <div
                                      key={item.id}
                                      className="bg-[#111] p-3 rounded-lg border border-[#222]"
                                    >
                                      <div className="flex justify-between">
                                        <p className="text-sm font-medium text-white">
                                          {item.productName}
                                        </p>
                                        <p className="text-sm text-gray-300">
                                          {formatCents(
                                            item.unitPrice * item.quantity
                                          )}
                                        </p>
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        Qty: {item.quantity} x{" "}
                                        {formatCents(item.unitPrice)}
                                      </p>
                                      {item.customization && (
                                        <p className="text-xs text-[#E8A83E] mt-1">
                                          Custom: {item.customization}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {/* Tracking Info */}
                                {(order.trackingNumber || order.labelUrl) && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-2">
                                      <Truck size={14} />
                                      Tracking
                                    </h4>
                                    <div className="bg-[#111] p-3 rounded-lg border border-[#222] text-sm text-gray-400 space-y-1">
                                      {order.trackingCarrier && (
                                        <p>
                                          Carrier: {order.trackingCarrier}
                                        </p>
                                      )}
                                      {order.trackingNumber && (
                                        <p>
                                          Tracking #: {order.trackingNumber}
                                        </p>
                                      )}
                                      {order.labelUrl && (
                                        <a
                                          href={order.labelUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-sm mt-1 hover:underline"
                                          style={{ color: "#D4881C" }}
                                        >
                                          <Printer size={14} />
                                          Print Label
                                          <ExternalLink size={12} />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="space-y-4">
                                {/* Status Update */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-300 mb-2">
                                    Update Status
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {STATUS_OPTIONS.map((s) => (
                                      <button
                                        key={s}
                                        disabled={
                                          order.status === s ||
                                          updatingStatus === order.id
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusUpdate(order.id, s);
                                        }}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                                          order.status === s
                                            ? statusColors[s]
                                            : "border-[#333] text-gray-400 hover:border-[#555] hover:text-white"
                                        }`}
                                      >
                                        {updatingStatus === order.id ? (
                                          <Loader2
                                            size={12}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          s
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Create Shipping Label */}
                                {!order.labelUrl && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCreateLabel(order.id);
                                    }}
                                    disabled={creatingLabel === order.id}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-black rounded-lg transition-colors disabled:opacity-50"
                                    style={{ backgroundColor: "#D4881C" }}
                                  >
                                    {creatingLabel === order.id ? (
                                      <Loader2
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Truck size={14} />
                                    )}
                                    Create Shipping Label
                                  </button>
                                )}

                                {/* Notes */}
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-2">
                                    <StickyNote size={14} />
                                    Internal Notes
                                  </h4>
                                  {order.notes && (
                                    <div className="bg-[#111] p-3 rounded-lg border border-[#222] text-sm text-gray-400 mb-2 whitespace-pre-wrap">
                                      {order.notes}
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={noteText[order.id] || ""}
                                      onChange={(e) =>
                                        setNoteText((prev) => ({
                                          ...prev,
                                          [order.id]: e.target.value,
                                        }))
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.stopPropagation();
                                          handleAddNote(order.id);
                                        }
                                      }}
                                      placeholder="Add a note..."
                                      className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddNote(order.id);
                                      }}
                                      className="px-3 py-2 text-sm font-medium border border-[#333] rounded-lg text-gray-300 hover:bg-[#1a1a1a] transition-colors"
                                    >
                                      Add
                                    </button>
                                  </div>
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
