"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Quote, Star } from "lucide-react";
import type { BlockSettings } from "./BlockRenderer";

interface TestimonialItem {
  name?: string;
  role?: string;
  location?: string;
  quote?: string;
  text?: string;
  rating?: number;
}

interface TestimonialsContent {
  heading?: string;
  items?: TestimonialItem[];
  testimonials?: TestimonialItem[];
}

export function TestimonialsBlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as TestimonialsContent;
  const heading = c.heading || "";
  const items = Array.isArray(c.items)
    ? c.items
    : Array.isArray(c.testimonials)
    ? c.testimonials
    : [];
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
      <div className={settings.fullWidth ? "mx-auto max-w-7xl" : ""}>
        {heading && (
          <h2
            className="mb-12 text-center text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {heading}
          </h2>
        )}

        <div
          className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${
            items.length >= 3 ? "lg:grid-cols-3" : ""
          }`}
        >
          {items.map((item, index) => {
            const quoteText = item.quote || item.text || "";
            const subtitle = item.role || item.location || "";
            const rating = item.rating || 0;

            return (
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

                {/* Rating stars */}
                {rating > 0 && (
                  <div className="mb-3 flex gap-1">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4"
                        style={{ color: "#D4881C", fill: "#D4881C" }}
                      />
                    ))}
                  </div>
                )}

                {/* Quote text */}
                {quoteText && (
                  <blockquote
                    className="mb-6 text-base leading-relaxed italic"
                    style={{ color: "#d1d5db" }}
                  >
                    &ldquo;{quoteText}&rdquo;
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
                  {subtitle && (
                    <p className="text-sm" style={{ color: "#D4881C" }}>
                      {subtitle}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
