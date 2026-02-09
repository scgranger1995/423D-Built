"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Package,
  Truck,
  ShieldCheck,
  X,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/placeholder-products";

// ============================================
// Constants
// ============================================

const TN_TAX_RATE = 0.0975;
const FLAT_RATE_SHIPPING = 799; // $7.99 in cents
const FREE_SHIPPING_THRESHOLD = 7500; // $75.00 in cents

// ============================================
// Cart Item Component
// ============================================

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: {
    id: string;
    productId: string;
    slug: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    customization?: string;
  };
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const lineTotal = item.price * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4 rounded-xl border border-white/10 bg-dark-gray p-4 sm:gap-6 sm:p-6"
    >
      {/* Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28">
        {!imageError ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="112px"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/30">
            <Package className="h-8 w-8 text-white/20" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                href={`/shop/${item.slug}`}
                className="text-base font-semibold text-off-white transition-colors hover:text-gold sm:text-lg"
              >
                {item.name}
              </Link>
              <p className="mt-0.5 text-sm text-gold">
                {formatPrice(item.price)} each
              </p>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="rounded-lg p-2 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
              aria-label={`Remove ${item.name} from cart`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Customization */}
          {item.customization && (
            <div className="mt-2 rounded-md border border-white/5 bg-black/20 px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                Customization:
              </span>
              <p className="mt-0.5 text-sm text-white/60">
                {item.customization}
              </p>
            </div>
          )}
        </div>

        {/* Quantity & Line Total */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-white/10 bg-black/20">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="px-3 py-2 text-white/60 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[2.5rem] text-center text-sm font-semibold text-off-white">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="px-3 py-2 text-white/60 transition-colors hover:text-white"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="text-lg font-bold text-off-white">
            {formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// Empty Cart Component
// ============================================

function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      {/* Cart Illustration */}
      <div className="relative mb-8">
        <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-white/10 bg-dark-gray">
          <ShoppingCart className="h-16 w-16 text-white/15" />
        </div>
        <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-dark bg-dark-gray">
          <X className="h-5 w-5 text-white/30" />
        </div>
      </div>

      <h2 className="mb-3 font-heading text-2xl font-bold text-off-white">
        Your Cart is Empty
      </h2>
      <p className="mb-8 max-w-sm text-center text-white/50">
        Looks like you have not added any items to your cart yet. Browse our
        handcrafted creations and find something you love.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 text-base font-semibold text-black transition-colors hover:bg-gold-light"
      >
        <ShoppingCart className="h-5 w-5" />
        Browse Shop
      </Link>
    </motion.div>
  );
}

// ============================================
// Cart Page
// ============================================

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } =
    useCart();

  const subtotal = getTotal();
  const itemCount = getItemCount();
  const taxAmount = Math.round(subtotal * TN_TAX_RATE);
  const shippingCost =
    subtotal === 0
      ? 0
      : subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : FLAT_RATE_SHIPPING;
  const total = subtotal + taxAmount + shippingCost;

  return (
    <div className="min-h-screen bg-dark">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-off-white sm:text-4xl">
              Shopping Cart
            </h1>
            {itemCount > 0 && (
              <p className="mt-1 text-white/50">
                {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
              </p>
            )}
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-white/40 transition-colors hover:text-red-400"
            >
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <LayoutGroup>
                <AnimatePresence mode="popLayout">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </LayoutGroup>

              {/* Continue Shopping */}
              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-gold"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                layout
                className="sticky top-8 rounded-xl border border-white/10 bg-dark-gray p-6"
              >
                <h2 className="mb-6 text-lg font-semibold text-off-white">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-off-white">{formatPrice(subtotal)}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Shipping Estimate</span>
                    <span className="text-off-white">
                      {shippingCost === 0 ? (
                        <span className="text-green-400">Free</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>

                  {/* Free Shipping Notice */}
                  {shippingCost > 0 && (
                    <div className="rounded-lg border border-gold/20 bg-gold/5 px-3 py-2">
                      <p className="text-xs text-gold">
                        Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more
                        for free shipping!
                      </p>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gold transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              (subtotal / FREE_SHIPPING_THRESHOLD) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tax */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">
                      Tax (TN 9.75%)
                    </span>
                    <span className="text-off-white">{formatPrice(taxAmount)}</span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10" />

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-off-white">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-gold">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3.5 text-base font-semibold text-black transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
                >
                  <CreditCard className="h-5 w-5" />
                  Proceed to Checkout
                </Link>

                {/* Security Note */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/40">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure checkout powered by Stripe
                </div>

                {/* Shipping & Returns */}
                <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <Truck className="h-4 w-4 shrink-0 text-gold/60" />
                    Free shipping on orders over $75
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <Package className="h-4 w-4 shrink-0 text-gold/60" />
                    Carefully packaged with protection
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-gold/60" />
                    100% satisfaction guaranteed
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
