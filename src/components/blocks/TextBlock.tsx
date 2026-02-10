"use client";

import type { BlockSettings } from "./BlockRenderer";

interface TextContent {
  heading?: string;
  body?: string;
}

function renderBody(text: string) {
  // Split by double newlines for paragraphs, single newlines become <br>
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((paragraph, i) => {
    const lines = paragraph.split("\n");
    return (
      <p key={i} className="mb-4 last:mb-0" style={{ color: "#d1d5db" }}>
        {lines.map((line, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {line}
          </span>
        ))}
      </p>
    );
  });
}

export function TextBlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as TextContent;
  const heading = c.heading || "";
  const body = c.body || "";

  return (
    <div
      className={`py-20 px-6 ${
        settings.fullWidth ? "" : "mx-auto max-w-4xl"
      }`}
      style={{
        backgroundColor: settings.backgroundColor || "transparent",
      }}
    >
      <div className={settings.fullWidth ? "mx-auto max-w-4xl" : ""}>
        {heading && (
          <h2
            className="mb-8 text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {heading}
          </h2>
        )}

        {body && (
          <div className="text-base leading-relaxed md:text-lg">
            {renderBody(body)}
          </div>
        )}
      </div>
    </div>
  );
}
