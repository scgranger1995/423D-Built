"use client";

import React, { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Style maps                                                         */
/* ------------------------------------------------------------------ */

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "text-black font-semibold",
  secondary:
    "bg-transparent font-semibold",
  ghost:
    "bg-transparent font-medium",
  danger:
    "bg-red-600 text-white font-semibold hover:bg-red-700",
};

const variantInline: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: "#D4881C",
    color: "#000000",
  },
  secondary: {
    border: "2px solid #D4881C",
    color: "#D4881C",
  },
  ghost: {
    color: "#D4881C",
  },
  danger: {},
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-sm rounded-md",
  md: "px-6 py-2.5 text-base rounded-lg",
  lg: "px-8 py-3.5 text-lg rounded-lg",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    /* Framer Motion hover/tap colours for primary and secondary */
    const hoverStyle: Record<ButtonVariant, HTMLMotionProps<"button">["whileHover"]> = {
      primary: {
        backgroundColor: "#E8A83E",
        scale: 1.03,
        boxShadow: "0 0 20px rgba(212,136,28,0.4)",
      },
      secondary: {
        backgroundColor: "rgba(212,136,28,0.1)",
        scale: 1.03,
        boxShadow: "0 0 20px rgba(212,136,28,0.3)",
      },
      ghost: {
        backgroundColor: "rgba(212,136,28,0.08)",
        scale: 1.02,
      },
      danger: {
        scale: 1.03,
        boxShadow: "0 0 20px rgba(220,38,38,0.4)",
      },
    };

    const tapStyle: Record<ButtonVariant, HTMLMotionProps<"button">["whileTap"]> = {
      primary: { scale: 0.97, backgroundColor: "#B06E0F" },
      secondary: { scale: 0.97 },
      ghost: { scale: 0.97 },
      danger: { scale: 0.97 },
    };

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center gap-2
          transition-colors duration-200 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        style={variantInline[variant]}
        whileHover={isDisabled ? undefined : hoverStyle[variant]}
        whileTap={isDisabled ? undefined : tapStyle[variant]}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...(rest as HTMLMotionProps<"button">)}
      >
        {loading && (
          <Loader2
            className="animate-spin"
            size={size === "sm" ? 14 : size === "lg" ? 20 : 16}
          />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
