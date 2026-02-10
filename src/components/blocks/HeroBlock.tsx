"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { BlockSettings } from "./BlockRenderer";

interface HeroContent {
  label?: string;
  heading?: string;
  subheading?: string;
  tagline?: string;
  ctaText?: string;
  ctaLink?: string;
  ctaTextSecondary?: string;
  ctaLinkSecondary?: string;
  backgroundImage?: string;
}

interface HeroSettings extends BlockSettings {
  compact?: boolean;
  fullHeight?: boolean;
}

export function HeroBlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as HeroContent;
  const s = settings as unknown as HeroSettings;
  const label = c.label || "";
  const heading = c.heading || "";
  const subheading = c.subheading || "";
  const tagline = c.tagline || "";
  const ctaText = c.ctaText || "";
  const ctaLink = c.ctaLink || "/";
  const ctaTextSecondary = c.ctaTextSecondary || "";
  const ctaLinkSecondary = c.ctaLinkSecondary || "";
  const backgroundImage = c.backgroundImage || "";

  const sectionStyle: React.CSSProperties = {
    backgroundColor: settings.backgroundColor || "#000",
  };

  if (backgroundImage) {
    sectionStyle.backgroundImage = `url(${backgroundImage})`;
    sectionStyle.backgroundSize = "cover";
    sectionStyle.backgroundPosition = "center";
  }

  const paddingClass = s.compact
    ? "py-16 md:py-20 lg:py-24"
    : s.fullHeight
    ? "py-24 md:py-32 lg:py-40 min-h-[80vh] flex items-center justify-center"
    : "py-24 md:py-32 lg:py-40";

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
        className={`relative z-10 mx-auto px-6 text-center ${paddingClass} ${
          settings.fullWidth ? "max-w-full" : "max-w-6xl"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {label && (
            <p
              className="mb-3 text-xs font-medium uppercase tracking-[0.3em]"
              style={{ color: "#D4881C" }}
            >
              {label}
            </p>
          )}

          {tagline && !label && (
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

          {(ctaText || ctaTextSecondary) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              {ctaText && (
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
              )}
              {ctaTextSecondary && (
                <Link
                  href={ctaLinkSecondary}
                  className="inline-flex items-center gap-2 rounded-lg px-8 py-4 text-lg font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: "transparent",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(212,136,28,0.5)";
                    e.currentTarget.style.color = "#D4881C";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                    e.currentTarget.style.color = "#fff";
                  }}
                >
                  {ctaTextSecondary}
                </Link>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
