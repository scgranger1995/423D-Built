"use client";

import Link from "next/link";
import type { BlockSettings } from "./BlockRenderer";

interface CTAContent {
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function CTABlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as CTAContent;
  const heading = c.heading || "";
  const description = c.description || "";
  const buttonText = c.buttonText || "";
  const buttonLink = c.buttonLink || "/";

  return (
    <div
      className="py-20 px-6"
      style={{
        backgroundColor: settings.backgroundColor || "transparent",
      }}
    >
      <div
        className="mx-auto max-w-5xl rounded-2xl px-8 py-16 text-center md:px-16"
        style={{
          background:
            "linear-gradient(135deg, rgba(212,136,28,0.15) 0%, rgba(176,110,15,0.08) 100%)",
          border: "1px solid rgba(212,136,28,0.3)",
        }}
      >
        {heading && (
          <h2
            className="mb-4 text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {heading}
          </h2>
        )}

        {description && (
          <p
            className="mx-auto mb-8 max-w-2xl text-lg"
            style={{ color: "#d1d5db" }}
          >
            {description}
          </p>
        )}

        {buttonText && (
          <Link
            href={buttonLink}
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
            {buttonText}
          </Link>
        )}
      </div>
    </div>
  );
}
