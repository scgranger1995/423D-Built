"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { BlockSettings } from "./BlockRenderer";

interface HeroContent {
  heading?: string;
  subheading?: string;
  tagline?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
}

export function HeroBlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as HeroContent;
  const heading = c.heading || "";
  const subheading = c.subheading || "";
  const tagline = c.tagline || "";
  const ctaText = c.ctaText || "";
  const ctaLink = c.ctaLink || "/";
  const backgroundImage = c.backgroundImage || "";

  const sectionStyle: React.CSSProperties = {
    backgroundColor: settings.backgroundColor || "#000",
  };

  if (backgroundImage) {
    sectionStyle.backgroundImage = `url(${backgroundImage})`;
    sectionStyle.backgroundSize = "cover";
    sectionStyle.backgroundPosition = "center";
  }

  return (
    <section
      className="relative overflow-hidden"
      style={sectionStyle}
    >
      {/* Gradient overlay */}
      {backgroundImage ? (
        <div className="absolute inset-0 bg-black/70" />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(212,136,28,0.08) 0%, transparent 60%)",
          }}
        />
      )}

      <div
        className={`relative z-10 mx-auto px-6 py-24 text-center md:py-32 lg:py-40 ${
          settings.fullWidth ? "max-w-full" : "max-w-6xl"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {tagline && (
            <p
              className="mb-4 text-sm font-medium uppercase tracking-[0.3em]"
              style={{ color: "#D4881C" }}
            >
              {tagline}
            </p>
          )}

          {heading && (
            <h1
              className="mb-6 text-4xl font-bold md:text-6xl lg:text-7xl gold-gradient-text"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {heading}
            </h1>
          )}

          {subheading && (
            <p
              className="mx-auto mb-8 max-w-2xl text-lg md:text-xl"
              style={{ color: "#9ca3af" }}
            >
              {subheading}
            </p>
          )}

          {ctaText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Link
                href={ctaLink}
                className="inline-flex items-center gap-2 rounded-lg px-8 py-4 text-lg font-semibold transition-all duration-300"
                style={{
                  backgroundColor: "#D4881C",
                  color: "#000",
                  boxShadow: "0 0 20px rgba(212,136,28,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#E8A83E";
                  e.currentTarget.style.boxShadow =
                    "0 0 30px rgba(212,136,28,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#D4881C";
                  e.currentTarget.style.boxShadow =
                    "0 0 20px rgba(212,136,28,0.3)";
                }}
              >
                {ctaText}
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
