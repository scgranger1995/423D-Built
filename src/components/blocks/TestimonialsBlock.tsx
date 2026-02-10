"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Quote } from "lucide-react";
import type { BlockSettings } from "./BlockRenderer";

interface TestimonialItem {
  name?: string;
  role?: string;
  quote?: string;
}

interface TestimonialsContent {
  items?: TestimonialItem[];
}

export function TestimonialsBlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as TestimonialsContent;
  const items = Array.isArray(c.items) ? c.items : [];
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  if (items.length === 0) return null;

  return (
    <div
      ref={ref}
      className={`py-20 px-6 ${settings.fullWidth ? "" : "mx-auto max-w-7xl"}`}
      style={{
        backgroundColor: settings.backgroundColor || "transparent",
      }}
    >
      <div
        className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${
          items.length >= 3 ? "lg:grid-cols-3" : ""
        } ${settings.fullWidth ? "mx-auto max-w-7xl" : ""}`}
      >
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: "easeOut",
            }}
            className="relative rounded-xl p-6"
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
            }}
          >
            {/* Quote icon */}
            <div
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: "rgba(212,136,28,0.1)" }}
            >
              <Quote className="h-5 w-5" style={{ color: "#D4881C" }} />
            </div>

            {/* Quote text */}
            {item.quote && (
              <blockquote
                className="mb-6 text-base leading-relaxed italic"
                style={{ color: "#d1d5db" }}
              >
                &ldquo;{item.quote}&rdquo;
              </blockquote>
            )}

            {/* Author */}
            <div
              className="border-t pt-4"
              style={{ borderColor: "#2a2a2a" }}
            >
              {item.name && (
                <p className="font-semibold text-white">{item.name}</p>
              )}
              {item.role && (
                <p className="text-sm" style={{ color: "#D4881C" }}>
                  {item.role}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
