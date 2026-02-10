"use client";

import type { BlockSettings } from "./BlockRenderer";

interface CustomHTMLContent {
  html?: string;
}

export function CustomHTMLBlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as CustomHTMLContent;
  const html = c.html || "";

  if (!html) return null;

  return (
    <div
      className={`py-20 px-6 ${settings.fullWidth ? "" : "mx-auto max-w-4xl"}`}
      style={{
        backgroundColor: settings.backgroundColor || "transparent",
      }}
    >
      <div
        className={`prose-invert max-w-none ${settings.fullWidth ? "mx-auto max-w-4xl" : ""}`}
        style={{ color: "#d1d5db" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
