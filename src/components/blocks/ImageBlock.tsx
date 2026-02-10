"use client";

import { useState } from "react";
import Image from "next/image";
import type { BlockSettings } from "./BlockRenderer";

interface ImageContent {
  url?: string;
  alt?: string;
  caption?: string;
}

export function ImageBlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as ImageContent;
  const url = c.url || "";
  const alt = c.alt || "Image";
  const caption = c.caption || "";
  const [imgError, setImgError] = useState(false);

  if (!url) return null;

  // Determine if the URL is from a configured remote pattern (Next.js Image optimization)
  const isOptimizable =
    url.startsWith("/") ||
    url.includes("res.cloudinary.com") ||
    url.includes("images.unsplash.com") ||
    url.includes("squarecdn.com") ||
    url.includes("lh3.googleusercontent.com");

  return (
    <div
      className={`py-20 px-6 ${
        settings.fullWidth ? "" : "mx-auto max-w-5xl"
      }`}
      style={{
        backgroundColor: settings.backgroundColor || "transparent",
      }}
    >
      <figure className={settings.fullWidth ? "mx-auto max-w-5xl" : ""}>
        <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid #2a2a2a" }}>
          {isOptimizable && !imgError ? (
            <Image
              src={url}
              alt={alt}
              width={1200}
              height={675}
              className="h-auto w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={alt}
              className="h-auto w-full object-cover"
              onError={() => setImgError(true)}
            />
          )}
        </div>

        {caption && (
          <figcaption
            className="mt-4 text-center text-sm"
            style={{ color: "#9ca3af" }}
          >
            {caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
