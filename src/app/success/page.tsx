"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Package,
  Cog,
  ClipboardCheck,
  Truck,
  Home,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/placeholder-products";

// ============================================
// Types
// ============================================

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  customization: string | null;
}

interface OrderData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

// ============================================
// Confetti Particle Component
// ============================================

function ConfettiParticle({
  delay,
  color,
}: {
  delay: number;
  color: string;
}) {
  const randomX = Math.random() * 100;
  const randomDuration = 2.5 + Math.random() * 2;
  const randomSize = 6 + Math.random() * 8;

  return (
    <motion.div
      initial={{
        opacity: 1,
        x: `${randomX}vw`,
        y: -20,
        rotate: 0,
        scale: 1,
      }}
      animate={{
        opacity: [1, 1, 0],
        y: "110vh",
        rotate: Math.random() * 720 - 360,
        scale: [1, 0.8, 0.5],
      }}
      transition={{
        duration: randomDuration,
        delay,
        ease: "easeIn",
      }}
      className="pointer-events-none fixed z-50"
      style={{
        width: randomSize,
        height: randomSize * (0.5 + Math.random()),
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
      }}
    />
  );
}

// ============================================
// Confetti Animation
// ============================================

function Confetti() {
  const colors = [
    "#D4881C", // Gold
    "#E8A83E", // Gold Light
    "#B06E0F", // Gold Dark
    "#FFFFFF", // White
    "#F5F5F5", // Off-white
    "#FFD700", // Bright gold
  ];

  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 1.5,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {particles.map((p) => (
        <ConfettiParticle key={p.id} delay={p.delay} color={p.color} />
      ))}
    </div>
  );
}

// ============================================
// Timeline Step
// ============================================

interface TimelineStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "complete" | "current" | "upcoming";
}

function TimelineStepItem({
  step,
  index,
  isLast,
}: {
  step: TimelineStep;
  index: number;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.8 + index * 0.15 }}
      className="flex gap-4"
    >
      {/* Icon & Line */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            step.status === "complete"
              ? "bg-green-500/20 text-green-400"
              : step.status === "current"
              ? "bg-gold/20 text-gold ring-2 ring-gold/30"
              : "bg-white/5 text-white/30"
          }`}
        >
          {step.icon}
        </div>
        {!isLast && (
          <div
            className={`my-1 w-0.5 flex-1 ${
              step.status === "complete" ? "bg-green-500/30" : "bg-white/10"
            }`}
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-8">
        <h4
          className={`font-semibold ${
            step.status === "current" ? "text-gold" : "text-off-white"
          }`}
        >
          {step.title}
        </h4>
        <p className="mt-0.5 text-sm text-white/50">{step.description}</p>
      </div>
    </motion.div>
  );
}

// ============================================
// Order Details Card
// ============================================

function OrderDetailsCard({ order }: { order: OrderData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mx-auto mt-8 max-w-lg rounded-xl border border-white/10 bg-dark-gray p-6"
    >
      {/* Order Number & Customer */}
      <div className="mb-5 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-white/40">
          Order Number
        </p>
        <p className="mt-1 font-mono text-lg font-bold text-gold">
          {order.orderNumber}
        </p>
        <p className="mt-1 text-sm text-white/50">
          {order.customerName}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Items */}
      <div className="mt-4 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-white/40">
          Items Ordered
        </p>
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between gap-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-off-white">
                {item.productName}
                {item.quantity > 1 && (
                  <span className="ml-1 text-white/40">
                    x{item.quantity}
                  </span>
                )}
              </p>
              {item.customization && (
                <p className="mt-0.5 truncate text-xs text-white/40">
                  Customization: {item.customization}
                </p>
              )}
            </div>
            <p className="shrink-0 text-sm text-off-white">
              {formatPrice(item.unitPrice * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="mt-4 border-t border-white/10" />

      {/* Totals */}
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/50">Subtotal</span>
          <span className="text-off-white">{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Shipping</span>
          <span className="text-off-white">
            {order.shippingCost === 0 ? (
              <span className="text-green-400">Free</span>
            ) : (
              formatPrice(order.shippingCost)
            )}
          </span>
        </div>
        {order.taxAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-white/50">Tax</span>
            <span className="text-off-white">
              {formatPrice(order.taxAmount)}
            </span>
          </div>
        )}
        <div className="flex justify-between border-t border-white/10 pt-2">
          <span className="font-semibold text-off-white">Total</span>
          <span className="font-bold text-gold">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      {/* Confirmation email note */}
      <p className="mt-4 text-center text-xs text-white/40">
        A confirmation email has been sent to {order.customerEmail}.
      </p>
    </motion.div>
  );
}

// ============================================
// Processing Fallback (webhook hasn't fired yet)
// ============================================

function ProcessingFallback({ sessionId }: { sessionId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mx-auto mt-8 max-w-md rounded-lg border border-gold/20 bg-gold/5 p-6 text-center"
    >
      <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-gold" />
      <p className="text-sm font-medium text-gold">
        Processing your order...
      </p>
      <p className="mt-2 text-xs text-white/50">
        Your payment was successful. We are finalizing your order details.
        This usually takes just a moment.
      </p>
      <div className="mt-4 rounded-md border border-white/10 bg-dark-gray px-3 py-2">
        <p className="text-xs text-white/40">
          Reference:{" "}
          <span className="font-mono text-white/60">
            {sessionId.length > 30
              ? `${sessionId.slice(0, 15)}...${sessionId.slice(-10)}`
              : sessionId}
          </span>
        </p>
      </div>
      <p className="mt-3 text-xs text-white/40">
        A confirmation email will be sent once your order is confirmed.
      </p>
    </motion.div>
  );
}

// ============================================
// Success Content (with useSearchParams)
// ============================================

function SuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const hasCleared = useRef(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderNotFound, setOrderNotFound] = useState(false);
  const retryCount = useRef(0);
  const maxRetries = 5;

  const sessionId = searchParams.get("session_id");

  // Fetch order details from the API
  const fetchOrder = useCallback(async () => {
    if (!sessionId) {
      setOrderLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/orders?session_id=${encodeURIComponent(sessionId)}`);
      if (res.ok) {
        const data: OrderData = await res.json();
        setOrder(data);
        setOrderLoading(false);
        setOrderNotFound(false);
      } else if (res.status === 404) {
        // Webhook may not have fired yet; retry a few times
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          setTimeout(fetchOrder, 2000); // retry after 2 seconds
        } else {
          setOrderNotFound(true);
          setOrderLoading(false);
        }
      } else {
        setOrderLoading(false);
        setOrderNotFound(true);
      }
    } catch {
      setOrderLoading(false);
      setOrderNotFound(true);
    }
  }, [sessionId]);

  // Clear cart on mount (once)
  useEffect(() => {
    if (!hasCleared.current) {
      clearCart();
      hasCleared.current = true;
    }
  }, [clearCart]);

  // Fetch order on mount
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const timelineSteps: TimelineStep[] = [
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: "Order Received",
      description: "We have received your order and payment has been confirmed.",
      status: "complete",
    },
    {
      icon: <Cog className="h-5 w-5" />,
      title: "Production",
      description:
        "Your items are being handcrafted in our Bristol, TN workshop.",
      status: "current",
    },
    {
      icon: <ClipboardCheck className="h-5 w-5" />,
      title: "Quality Check",
      description:
        "Every piece is inspected for quality before packaging.",
      status: "upcoming",
    },
    {
      icon: <Truck className="h-5 w-5" />,
      title: "Shipping",
      description:
        "Your order will be carefully packaged and shipped to your doorstep.",
      status: "upcoming",
    },
    {
      icon: <Home className="h-5 w-5" />,
      title: "Delivered",
      description:
        "Enjoy your handcrafted creation from 423D Built!",
      status: "upcoming",
    },
  ];

  return (
    <>
      {showConfetti && <Confetti />}

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Celebration Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="mb-8 text-center"
        >
          <div className="relative mx-auto inline-flex">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle2 className="h-14 w-14 text-green-400" />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -right-2 -top-2"
            >
              <Sparkles className="h-8 w-8 text-gold" />
            </motion.div>
          </div>
        </motion.div>

        {/* Thank You Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-3 font-heading text-4xl font-bold text-off-white sm:text-5xl">
            Thank You For Your Order!
          </h1>
          <p className="mx-auto max-w-lg text-lg text-white/60">
            Your order has been placed successfully. We are excited to start
            crafting your items in our Bristol, TN workshop.
          </p>

          {/* Order Details or Processing Fallback */}
          {sessionId && (
            <>
              {orderLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mx-auto mt-6 flex items-center justify-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-gold" />
                  <span className="text-sm text-white/50">
                    Loading order details...
                  </span>
                </motion.div>
              ) : order ? (
                <OrderDetailsCard order={order} />
              ) : orderNotFound ? (
                <ProcessingFallback sessionId={sessionId} />
              ) : null}
            </>
          )}
        </motion.div>

        {/* What Happens Next Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="mb-6 text-center font-heading text-2xl font-bold text-off-white">
            What Happens Next
          </h2>

          <div className="rounded-xl border border-white/10 bg-dark-gray p-6 sm:p-8">
            {timelineSteps.map((step, index) => (
              <TimelineStepItem
                key={step.title}
                step={step}
                index={index}
                isLast={index === timelineSteps.length - 1}
              />
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 text-base font-semibold text-black transition-colors hover:bg-gold-light"
          >
            <ShoppingBag className="h-5 w-5" />
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-8 py-3.5 text-base font-semibold text-off-white transition-colors hover:border-white/30 hover:bg-white/5"
          >
            Back to Home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </>
  );
}

// ============================================
// Success Page (wrapped in Suspense for useSearchParams)
// ============================================

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-dark">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gold border-t-transparent" />
              <p className="text-white/60">Loading...</p>
            </div>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
