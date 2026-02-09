"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";

/* ------------------------------------------------------------------ */
/*  Nav links                                                          */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/shop", label: "Shop" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/quote", label: "Get a Quote" },
] as const;

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const headerVariants = {
  hidden: { y: -80, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const linkVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.06, duration: 0.35 },
  }),
};

const drawerVariants = {
  closed: { x: "100%", opacity: 0 },
  open: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
};

const mobileItemVariants = {
  closed: { x: 30, opacity: 0 },
  open: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: 0.08 * i, duration: 0.3 },
  }),
};

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

export default function Header() {
  const pathname = usePathname();
  const { getItemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = getItemCount();

  /* --- track scroll for bg opacity ----------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* --- close drawer on route change ---------- */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /* --- lock body scroll when drawer open ----- */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(0,0,0,0.95)" : "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(212,136,28,0.2)",
        }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* ----- Logo ----- */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="relative h-10 w-10 overflow-hidden rounded-full"
              style={{ border: "2px solid #D4881C" }}
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Image
                src="/images/logo.jpg"
                alt="423D Built Logo"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </motion.div>

            <div className="flex flex-col leading-tight">
              <span
                className="text-lg font-bold tracking-tight"
                style={{ color: "#D4881C", fontFamily: "var(--font-heading)" }}
              >
                423D Built
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-gray-400">
                3D Printing &amp; Laser Engraving
              </span>
            </div>
          </Link>

          {/* ----- Desktop nav links ----- */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                custom={i}
                variants={linkVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href={link.href}
                  className="relative px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                  style={{
                    color: isActive(link.href) ? "#D4881C" : "#d1d5db",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(link.href)) {
                      e.currentTarget.style.color = "#E8A83E";
                      e.currentTarget.style.backgroundColor = "rgba(212,136,28,0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.href)) {
                      e.currentTarget.style.color = "#d1d5db";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {link.label}
                  {/* active indicator bar */}
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ backgroundColor: "#D4881C" }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* ----- Right side: Cart + Hamburger ----- */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 group">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingCart
                  size={22}
                  className="transition-colors duration-200"
                  style={{ color: "#d1d5db" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as SVGSVGElement).style.color = "#D4881C";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as SVGSVGElement).style.color = "#d1d5db";
                  }}
                />
              </motion.div>

              {/* item count badge */}
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-black"
                    style={{ backgroundColor: "#D4881C" }}
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-md"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} style={{ color: "#D4881C" }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} style={{ color: "#d1d5db" }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* ----- Mobile slide-out drawer ----- */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="exit"
              className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col lg:hidden"
              style={{
                backgroundColor: "#111111",
                borderLeft: "1px solid rgba(212,136,28,0.2)",
              }}
            >
              {/* Close button */}
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="p-2"
                >
                  <X size={24} style={{ color: "#D4881C" }} />
                </button>
              </div>

              {/* Logo in drawer */}
              <div className="flex items-center gap-3 px-6 pb-6">
                <div
                  className="relative h-10 w-10 overflow-hidden rounded-full"
                  style={{ border: "2px solid #D4881C" }}
                >
                  <Image
                    src="/images/logo.jpg"
                    alt="423D Built Logo"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <span
                  className="text-lg font-bold"
                  style={{ color: "#D4881C", fontFamily: "var(--font-heading)" }}
                >
                  423D Built
                </span>
              </div>

              {/* Divider */}
              <div className="mx-6 h-px" style={{ backgroundColor: "rgba(212,136,28,0.15)" }} />

              {/* Nav links */}
              <nav className="flex flex-col gap-1 px-4 py-6">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    custom={i}
                    variants={mobileItemVariants}
                    initial="closed"
                    animate="open"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200"
                      style={{
                        color: isActive(link.href) ? "#D4881C" : "#d1d5db",
                        backgroundColor: isActive(link.href)
                          ? "rgba(212,136,28,0.1)"
                          : "transparent",
                      }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom tagline */}
              <div className="mt-auto px-6 py-6">
                <div
                  className="h-px mb-4"
                  style={{ backgroundColor: "rgba(212,136,28,0.15)" }}
                />
                <p className="text-xs text-gray-500 text-center">
                  Handcrafted in Bristol, TN
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
