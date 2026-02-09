"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
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
  CreditCard,
  Clock,
  Mail,
  Phone,
  Hash,
  ArrowRight,
  RefreshCw,
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

// Valid order statuses including CONFIRMED
const STATUS_OPTIONS = [
  "PENDING",
  "PAID",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

// Ordered workflow for status progression arrows
const STATUS_WORKFLOW: Record<string, string[]> = {
  PENDING: ["PAID", "CONFIRMED", "CANCELLED"],
  PAID: ["CONFIRMED", "PROCESSING", "REFUNDED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

const CARRIER_OPTIONS = [
  { value: "", label: "Select Carrier" },
  { value: "USPS", label: "USPS" },
  { value: "UPS", label: "UPS" },
  { value: "FedEx", label: "FedEx" },
  { value: "DHL", label: "DHL" },
  { value: "Other", label: "Other" },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PAID: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  CONFIRMED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  PROCESSING: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  SHIPPED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DELIVERED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  REFUNDED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock size={12} />,
  PAID: <CreditCard size={12} />,
  CONFIRMED: <Check size={12} />,
  PROCESSING: <Package size={12} />,
  SHIPPED: <Truck size={12} />,
  DELIVERED: <Check size={12} />,
  CANCELLED: <X size={12} />,
  REFUNDED: <RefreshCw size={12} />,
};

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  PAID: "bg-green-500/20 text-green-400",
  FAILED: "bg-red-500/20 text-red-400",
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

function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

// ============================================
// Order Detail Modal Component
// ============================================
function OrderDetailModal({
  order,
  onClose,
  onStatusUpdate,
  onTrackingUpdate,
  onNoteAdd,
  onCreateLabel,
  updatingStatus,
  creatingLabel,
}: {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: string) => Promise<void>;
  onTrackingUpdate: (
    orderId: string,
    trackingNumber: string,
    trackingCarrier: string
  ) => Promise<void>;
  onNoteAdd: (orderId: string, note: string) => Promise<void>;
  onCreateLabel: (orderId: string) => Promise<void>;
  updatingStatus: string | null;
  creatingLabel: string | null;
}) {
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || ""
  );
  const [trackingCarrier, setTrackingCarrier] = useState(
    order.trackingCarrier || ""
  );
  const [noteText, setNoteText] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "details" | "shipping" | "notes"
  >("details");
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);

  const nextStatuses = STATUS_WORKFLOW[order.status] || [];

  const handleTrackingSave = async () => {
    if (!trackingNumber.trim()) return;
    setSavingTracking(true);
    await onTrackingUpdate(order.id, trackingNumber, trackingCarrier);
    setSavingTracking(false);
  };

  const handleNoteSave = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    await onNoteAdd(order.id, noteText);
    setNoteText("");
    setSavingNote(false);
  };

  const handleStatusClick = (status: string) => {
    if (status === "CANCELLED" || status === "REFUNDED") {
      setConfirmStatus(status);
    } else {
      onStatusUpdate(order.id, status);
    }
  };

  const handleConfirmStatusChange = () => {
    if (confirmStatus) {
      onStatusUpdate(order.id, confirmStatus);
      setConfirmStatus(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Slide-over Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative h-full w-full max-w-2xl bg-[#0a0a0a] border-l border-[#222] shadow-2xl overflow-y-auto"
        >
          {/* Panel Header */}
          <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#222] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Order{" "}
                    <span style={{ color: "#D4881C" }}>
                      {order.orderNumber}
                    </span>
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      statusColors[order.status] ||
                      "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {statusIcons[order.status]}
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  Placed {formatDate(order.createdAt)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-4">
              {(
                [
                  { key: "details", label: "Details", icon: Package },
                  { key: "shipping", label: "Shipping", icon: Truck },
                  { key: "notes", label: "Notes", icon: StickyNote },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.key
                      ? "bg-[#1a1a1a] text-white border border-[#333]"
                      : "text-gray-500 hover:text-gray-300 hover:bg-[#111]"
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Panel Body */}
          <div className="p-6 space-y-6">
            <AnimatePresence mode="wait">
              {/* ===== DETAILS TAB ===== */}
              {activeTab === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Status Update Section */}
                  <div className="space-y-3">
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider"
                      style={{ color: "#D4881C" }}
                    >
                      Update Status
                    </h3>

                    {/* Status confirmation dialog */}
                    <AnimatePresence>
                      {confirmStatus && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-sm text-red-400 mb-2">
                              Are you sure you want to mark this order as{" "}
                              <strong>{confirmStatus}</strong>?
                              {confirmStatus === "CANCELLED" &&
                                " This cannot be easily undone."}
                              {confirmStatus === "REFUNDED" &&
                                " Make sure the refund has been processed in Stripe."}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={handleConfirmStatusChange}
                                disabled={updatingStatus === order.id}
                                className="px-3 py-1.5 text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 rounded-md hover:bg-red-500/30 transition-colors"
                              >
                                {updatingStatus === order.id ? (
                                  <Loader2
                                    size={12}
                                    className="animate-spin"
                                  />
                                ) : (
                                  `Yes, ${confirmStatus.toLowerCase()} order`
                                )}
                              </button>
                              <button
                                onClick={() => setConfirmStatus(null)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-400 border border-[#333] rounded-md hover:bg-[#1a1a1a] transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Suggested next statuses */}
                    {nextStatuses.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">
                          Suggested next status:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {nextStatuses.map((s) => (
                            <motion.button
                              key={s}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              disabled={updatingStatus === order.id}
                              onClick={() => handleStatusClick(s)}
                              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                                s === "CANCELLED" || s === "REFUNDED"
                                  ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                  : "border-[#D4881C]/30 text-[#E8A83E] hover:bg-[#D4881C]/10"
                              }`}
                            >
                              {updatingStatus === order.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <>
                                  <ArrowRight size={14} />
                                  {s}
                                </>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All statuses dropdown */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">
                        Or set any status:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            disabled={
                              order.status === s ||
                              updatingStatus === order.id
                            }
                            onClick={() => handleStatusClick(s)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                              order.status === s
                                ? statusColors[s]
                                : "border-[#333] text-gray-400 hover:border-[#555] hover:text-white"
                            }`}
                          >
                            {statusIcons[s]}
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider"
                      style={{ color: "#D4881C" }}
                    >
                      Customer
                    </h3>
                    <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-2">
                      <p className="text-sm font-medium text-white">
                        {order.customerName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail size={13} />
                        <a
                          href={`mailto:${order.customerEmail}`}
                          className="hover:underline"
                          style={{ color: "#D4881C" }}
                        >
                          {order.customerEmail}
                        </a>
                      </div>
                      {order.customerPhone && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Phone size={13} />
                          <span>{order.customerPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="space-y-3">
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: "#D4881C" }}
                    >
                      <MapPin size={14} />
                      Shipping Address
                    </h3>
                    <div className="bg-[#111] border border-[#222] rounded-xl p-4 text-sm text-gray-400 space-y-0.5">
                      <p className="text-white font-medium">
                        {order.shippingAddress.name}
                      </p>
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
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: "#D4881C" }}
                    >
                      <ShoppingCart size={14} />
                      Items ({order.items?.length || 0})
                    </h3>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-[#111] border border-[#222] rounded-xl p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {item.productName}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Qty: {item.quantity} x{" "}
                                {formatCents(item.unitPrice)}
                              </p>
                              {item.customization && (
                                <p className="text-xs mt-1.5 px-2 py-1 bg-[#D4881C]/10 border border-[#D4881C]/20 rounded-md inline-block"
                                  style={{ color: "#E8A83E" }}
                                >
                                  Custom: {item.customization}
                                </p>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-white">
                              {formatCents(item.unitPrice * item.quantity)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="space-y-3">
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: "#D4881C" }}
                    >
                      <CreditCard size={14} />
                      Payment
                    </h3>
                    <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Subtotal</span>
                        <span>{formatCents(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Shipping</span>
                        <span>{formatCents(order.shippingCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Tax</span>
                        <span>{formatCents(order.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-white pt-2 border-t border-[#222]">
                        <span>Total</span>
                        <span>{formatCents(order.total)}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-xs text-gray-500">
                          Payment Status:
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            paymentStatusColors[order.paymentStatus] ||
                            "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>

                      {order.stripePaymentIntentId && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                          <Hash size={11} />
                          <span className="font-mono">
                            {order.stripePaymentIntentId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ===== SHIPPING TAB ===== */}
              {activeTab === "shipping" && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Current Tracking Info */}
                  {(order.trackingNumber || order.labelUrl) && (
                    <div className="space-y-3">
                      <h3
                        className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                        style={{ color: "#D4881C" }}
                      >
                        <Truck size={14} />
                        Current Tracking
                      </h3>
                      <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-2">
                        {order.trackingCarrier && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Carrier:</span>
                            <span className="text-white font-medium">
                              {order.trackingCarrier}
                            </span>
                          </div>
                        )}
                        {order.trackingNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Tracking #:</span>
                            <span className="text-white font-mono font-medium">
                              {order.trackingNumber}
                            </span>
                          </div>
                        )}
                        {order.labelUrl && (
                          <a
                            href={order.labelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[#D4881C]/30 hover:bg-[#D4881C]/10 transition-colors mt-2"
                            style={{ color: "#D4881C" }}
                          >
                            <Printer size={14} />
                            Print Shipping Label
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add/Update Tracking Number */}
                  <div className="space-y-3">
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider"
                      style={{ color: "#D4881C" }}
                    >
                      {order.trackingNumber
                        ? "Update Tracking"
                        : "Add Tracking Number"}
                    </h3>
                    <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                          Carrier
                        </label>
                        <div className="relative">
                          <select
                            value={trackingCarrier}
                            onChange={(e) =>
                              setTrackingCarrier(e.target.value)
                            }
                            className="w-full appearance-none px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C] cursor-pointer"
                          >
                            {CARRIER_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                          Tracking Number
                        </label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="e.g. 1Z999AA10123456784"
                          className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={handleTrackingSave}
                          disabled={
                            !trackingNumber.trim() || savingTracking
                          }
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-black rounded-lg transition-colors disabled:opacity-50"
                          style={{ backgroundColor: "#D4881C" }}
                        >
                          {savingTracking ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          {order.trackingNumber
                            ? "Update Tracking"
                            : "Save Tracking"}
                        </motion.button>
                        {!order.trackingNumber && (
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={async () => {
                              if (!trackingNumber.trim()) return;
                              setSavingTracking(true);
                              await onTrackingUpdate(
                                order.id,
                                trackingNumber,
                                trackingCarrier
                              );
                              await onStatusUpdate(order.id, "SHIPPED");
                              setSavingTracking(false);
                            }}
                            disabled={
                              !trackingNumber.trim() || savingTracking
                            }
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors disabled:opacity-50"
                          >
                            {savingTracking ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Truck size={14} />
                            )}
                            Save & Mark Shipped
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Create Shipping Label */}
                  {!order.labelUrl && (
                    <div className="space-y-3">
                      <h3
                        className="text-sm font-semibold uppercase tracking-wider"
                        style={{ color: "#D4881C" }}
                      >
                        Shipping Label
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => onCreateLabel(order.id)}
                        disabled={creatingLabel === order.id}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-black rounded-xl transition-colors disabled:opacity-50"
                        style={{ backgroundColor: "#D4881C" }}
                      >
                        {creatingLabel === order.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Truck size={14} />
                        )}
                        Create Shipping Label
                      </motion.button>
                    </div>
                  )}

                  {/* Shipping Address (duplicated for convenience) */}
                  <div className="space-y-3">
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: "#D4881C" }}
                    >
                      <MapPin size={14} />
                      Ship To
                    </h3>
                    <div className="bg-[#111] border border-[#222] rounded-xl p-4 text-sm text-gray-400 space-y-0.5">
                      <p className="text-white font-medium">
                        {order.shippingAddress.name}
                      </p>
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
                      {order.shippingAddress.phone && (
                        <p className="text-xs mt-1">
                          Phone: {order.shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ===== NOTES TAB ===== */}
              {activeTab === "notes" && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Add Note */}
                  <div className="space-y-3">
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: "#D4881C" }}
                    >
                      <StickyNote size={14} />
                      Add Internal Note
                    </h3>
                    <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-3">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add internal notes about this order..."
                        rows={4}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] resize-y"
                      />
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleNoteSave}
                        disabled={!noteText.trim() || savingNote}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-black rounded-lg transition-colors disabled:opacity-50"
                        style={{ backgroundColor: "#D4881C" }}
                      >
                        {savingNote ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <StickyNote size={14} />
                        )}
                        Add Note
                      </motion.button>
                    </div>
                  </div>

                  {/* Existing Notes */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-300">
                      Note History
                    </h3>
                    {order.notes ? (
                      <div className="bg-[#111] border border-[#222] rounded-xl p-4">
                        <div className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed space-y-3">
                          {order.notes.split("\n").map((line, i) => {
                            // Parse timestamp format: [M/D/YY, H:MM AM/PM]
                            const match = line.match(
                              /^\[(.+?)\]\s*(.*)$/
                            );
                            if (match) {
                              return (
                                <div
                                  key={i}
                                  className="border-l-2 border-[#333] pl-3"
                                >
                                  <p className="text-xs text-gray-600 mb-0.5">
                                    {match[1]}
                                  </p>
                                  <p className="text-gray-300">
                                    {match[2]}
                                  </p>
                                </div>
                              );
                            }
                            return line.trim() ? (
                              <p key={i}>{line}</p>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#111] border border-[#222] rounded-xl p-8 text-center">
                        <StickyNote
                          size={24}
                          className="mx-auto mb-2 text-gray-600"
                        />
                        <p className="text-sm text-gray-500">
                          No notes yet
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ============================================
// Main Orders Page
// ============================================
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [creatingLabel, setCreatingLabel] = useState<string | null>(null);

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

  // Open detail from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order");
    if (orderId && orders.length > 0) {
      const order = orders.find((o) => o.id === orderId);
      if (order) setSelectedOrder(order);
    }
  }, [orders]);

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
      // Update selected order with fresh data
      const updatedOrders = await fetch(
        `/api/admin/orders?${new URLSearchParams().toString()}`
      ).then((r) => r.json());
      const updated = (updatedOrders.items || []).find(
        (o: Order) => o.id === orderId
      );
      if (updated) setSelectedOrder(updated);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Update tracking info
  const handleTrackingUpdate = async (
    orderId: string,
    trackingNumber: string,
    trackingCarrier: string
  ) => {
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          trackingNumber,
          trackingCarrier,
        }),
      });
      if (!res.ok) throw new Error("Failed to update tracking");
      setSuccess("Tracking information updated");
      await fetchOrders();
      // Refresh selected order
      const updatedOrders = await fetch(
        `/api/admin/orders?${new URLSearchParams().toString()}`
      ).then((r) => r.json());
      const updated = (updatedOrders.items || []).find(
        (o: Order) => o.id === orderId
      );
      if (updated) setSelectedOrder(updated);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update tracking"
      );
    }
  };

  // Add notes
  const handleAddNote = async (orderId: string, note: string) => {
    if (!note?.trim()) return;

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, notes: note }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      setSuccess("Note added");
      await fetchOrders();
      // Refresh selected order
      const updatedOrders = await fetch(
        `/api/admin/orders?${new URLSearchParams().toString()}`
      ).then((r) => r.json());
      const updated = (updatedOrders.items || []).find(
        (o: Order) => o.id === orderId
      );
      if (updated) setSelectedOrder(updated);
      setTimeout(() => setSuccess(""), 3000);
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
      // Refresh selected order
      const updatedOrders = await fetch(
        `/api/admin/orders?${new URLSearchParams().toString()}`
      ).then((r) => r.json());
      const updated = (updatedOrders.items || []).find(
        (o: Order) => o.id === orderId
      );
      if (updated) setSelectedOrder(updated);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create label"
      );
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

  // Status counts for filter bar
  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Orders
        </h1>
        <p className="text-gray-400 mt-1">
          Manage customer orders ({orders.length} total)
        </p>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
              <button onClick={() => setError("")} className="ml-auto">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 flex items-center gap-2">
              <Check size={16} />
              {success}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-3"
      >
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

        {/* Status Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              statusFilter === ""
                ? "bg-white/10 text-white border-white/20"
                : "text-gray-500 border-[#333] hover:border-[#555] hover:text-gray-300"
            }`}
          >
            All ({orders.length})
          </button>
          {STATUS_OPTIONS.filter((s) => statusCounts[s]).map((s) => (
            <button
              key={s}
              onClick={() =>
                setStatusFilter(statusFilter === s ? "" : s)
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                statusFilter === s
                  ? statusColors[s]
                  : "text-gray-500 border-[#333] hover:border-[#555] hover:text-gray-300"
              }`}
            >
              {statusIcons[s]}
              {s} ({statusCounts[s]})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-[#111] border border-[#222] rounded-xl overflow-hidden"
      >
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
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                  Tracking
                </th>
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
                filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-[#1a1a1a] transition-colors cursor-pointer group"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-4">
                      <span
                        className="font-mono text-sm font-medium group-hover:underline"
                        style={{ color: "#D4881C" }}
                      >
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400">
                      {formatDateShort(order.createdAt)}
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
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          statusColors[order.status] ||
                          "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {statusIcons[order.status]}
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
                      {order.trackingNumber ? (
                        <span className="inline-flex items-center gap-1 text-xs text-purple-400">
                          <Truck size={12} />
                          {order.trackingCarrier || "Tracked"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">--</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            key={selectedOrder.id}
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusUpdate={handleStatusUpdate}
            onTrackingUpdate={handleTrackingUpdate}
            onNoteAdd={handleAddNote}
            onCreateLabel={handleCreateLabel}
            updatingStatus={updatingStatus}
            creatingLabel={creatingLabel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
