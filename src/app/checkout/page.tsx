"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/placeholder-products";

// ============================================
// Checkout Page
// ============================================

export default function CheckoutPage() {
  const { items, getTotal, getItemCount, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  const subtotal = getTotal();
  const itemCount = getItemCount();

  useEffect(() => {
    // Prevent double-calls in StrictMode
    if (hasStarted.current) return;

    // If no items, redirect to cart
    if (items.length === 0) {
      setLoading(false);
      return;
    }

    hasStarted.current = true;

    async function createCheckoutSession() {
      try {
        setLoading(true);
        setError(null);

        const lineItems = items.map((item) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          customization: item.customization || null,
          image: item.image,
        }));

        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: lineItems }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create checkout session");
        }

        if (data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
        } else {
          throw new Error("No checkout URL returned");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
        setLoading(false);
        hasStarted.current = false;
      }
    }

    createCheckoutSession();
  }, [items, router]);

  // Empty cart state
  if (!loading && items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-white/10 bg-dark-gray">
            <ShoppingCart className="h-10 w-10 text-white/20" />
          </div>
          <h1 className="mb-3 font-heading text-2xl font-bold text-off-white">
            Your Cart is Empty
          </h1>
          <p className="mb-6 text-white/50">
            Add some items to your cart before checking out.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-gold-light"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Shop
          </Link>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="mb-3 font-heading text-2xl font-bold text-off-white">
            Checkout Error
          </h1>
          <p className="mb-6 text-white/60">{error}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                hasStarted.current = false;
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-gold-light"
            >
              <CreditCard className="h-4 w-4" />
              Try Again
            </button>
            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-off-white transition-colors hover:border-white/30"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading / Redirecting state
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        {/* Loading Spinner */}
        <div className="mx-auto mb-8">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-gold" />
            <div className="absolute inset-0 animate-ping rounded-full border border-gold/20" />
          </div>
        </div>

        <h1 className="mb-3 font-heading text-2xl font-bold text-off-white">
          Preparing Your Checkout
        </h1>
        <p className="mb-2 text-white/60">
          Redirecting you to our secure payment page...
        </p>

        {/* Order Summary */}
        <div className="mx-auto mt-8 max-w-xs rounded-lg border border-white/10 bg-dark-gray p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
            <span className="font-semibold text-gold">
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/40">
          <ShieldCheck className="h-4 w-4" />
          256-bit SSL encrypted checkout via Stripe
        </div>
      </motion.div>
    </div>
  );
}
