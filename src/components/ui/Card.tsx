"use client";

import React, { type ReactNode } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Disable the hover glow / scale effect */
  disableHover?: boolean;
  onClick?: () => void;
}

interface CardImageProps {
  src: string;
  alt: string;
  /** Aspect ratio class (default: aspect-[4/3]) */
  aspect?: string;
  overlay?: ReactNode;
  priority?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Card (root wrapper)                                                */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className = "",
  disableHover = false,
  onClick,
}: CardProps) {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-xl
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      style={{
        backgroundColor: "#1a1a1a",
        border: "1px solid rgba(212,136,28,0.08)",
      }}
      whileHover={
        disableHover
          ? undefined
          : {
              scale: 1.02,
              borderColor: "rgba(212,136,28,0.4)",
              boxShadow: "0 0 30px rgba(212,136,28,0.15), 0 8px 32px rgba(0,0,0,0.4)",
            }
      }
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card.Image                                                         */
/* ------------------------------------------------------------------ */

export function CardImage({
  src,
  alt,
  aspect = "aspect-[4/3]",
  overlay,
  priority = false,
}: CardImageProps) {
  return (
    <div className={`relative w-full overflow-hidden ${aspect} group`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        priority={priority}
      />

      {/* Dark overlay that appears on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        {overlay}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card.Body                                                          */
/* ------------------------------------------------------------------ */

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/*  Card.Title                                                         */
/* ------------------------------------------------------------------ */

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return (
    <h3
      className={`text-lg font-semibold font-heading mb-1 ${className}`}
      style={{ color: "#F5F5F5" }}
    >
      {children}
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/*  Card.Description                                                   */
/* ------------------------------------------------------------------ */

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className = "" }: CardDescriptionProps) {
  return (
    <p className={`text-sm leading-relaxed ${className}`} style={{ color: "#9ca3af" }}>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Card.Price                                                         */
/* ------------------------------------------------------------------ */

interface CardPriceProps {
  amount: number;
  currency?: string;
  className?: string;
}

export function CardPrice({ amount, currency = "$", className = "" }: CardPriceProps) {
  return (
    <span
      className={`text-xl font-bold ${className}`}
      style={{ color: "#D4881C" }}
    >
      {currency}
      {amount.toFixed(2)}
    </span>
  );
}
