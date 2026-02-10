"use client";

import Image from "next/image";
import * as LucideIcons from "lucide-react";
import type { BlockSettings } from "./BlockRenderer";

interface EquipmentGroup {
  category?: string;
  icon?: string;
  items?: string[];
}

interface TextContent {
  heading?: string;
  headingHighlight?: string;
  subheading?: string;
  body?: string;
  paragraphs?: string[];
  showImage?: boolean;
  image?: string;
  imageAlt?: string;
  location?: string;
  showMap?: boolean;
  mapEmbedUrl?: string;
  equipmentGroups?: EquipmentGroup[];
}

interface TextSettings extends BlockSettings {
  layout?: string;
}

function getIcon(name: string): React.ComponentType<{ className?: string }> | null {
  if (!name) return null;
  const pascalCase = name
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >;
  return icons[pascalCase] || null;
}

function renderBody(text: string) {
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

function renderHeading(heading: string, highlight?: string) {
  if (!highlight || !heading.includes(highlight)) {
    return heading;
  }
  const parts = heading.split(highlight);
  return (
    <>
      {parts[0]}
      <span style={{ color: "#D4881C" }}>{highlight}</span>
      {parts[1]}
    </>
  );
}

export function TextBlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as TextContent;
  const s = settings as unknown as TextSettings;
  const heading = c.heading || "";
  const headingHighlight = c.headingHighlight || "";
  const subheading = c.subheading || "";
  const body = c.body || "";
  const paragraphs = Array.isArray(c.paragraphs) ? c.paragraphs : [];
  const showImage = c.showImage || false;
  const image = c.image || "";
  const imageAlt = c.imageAlt || "";
  const location = c.location || "";
  const showMap = c.showMap || false;
  const mapEmbedUrl = c.mapEmbedUrl || "";
  const equipmentGroups = Array.isArray(c.equipmentGroups) ? c.equipmentGroups : [];

  // Map layout
  if (s.layout === "map" && showMap && mapEmbedUrl) {
    return (
      <div
        className={`py-20 px-6 ${settings.fullWidth ? "" : "mx-auto max-w-6xl"}`}
        style={{ backgroundColor: settings.backgroundColor || "transparent" }}
      >
        <div className={settings.fullWidth ? "mx-auto max-w-6xl" : ""}>
          {heading && (
            <h2
              className="mb-4 text-center text-3xl font-bold text-white md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="mx-auto mb-8 max-w-2xl text-center text-lg" style={{ color: "#9ca3af" }}>
              {subheading}
            </p>
          )}
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid #2a2a2a" }}>
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            />
          </div>
        </div>
      </div>
    );
  }

  // Equipment grid layout
  if (s.layout === "equipment-grid" && equipmentGroups.length > 0) {
    return (
      <div
        className={`py-20 px-6 ${settings.fullWidth ? "" : "mx-auto max-w-6xl"}`}
        style={{ backgroundColor: settings.backgroundColor || "transparent" }}
      >
        <div className={settings.fullWidth ? "mx-auto max-w-6xl" : ""}>
          {heading && (
            <h2
              className="mb-4 text-center text-3xl font-bold text-white md:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="mx-auto mb-12 max-w-2xl text-center text-lg" style={{ color: "#9ca3af" }}>
              {subheading}
            </p>
          )}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {equipmentGroups.map((group, idx) => {
              const IconComponent = getIcon(group.icon || "");
              return (
                <div
                  key={idx}
                  className="rounded-xl p-6"
                  style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    {IconComponent && (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: "rgba(212,136,28,0.1)" }}
                      >
                        <IconComponent className="h-5 w-5 text-gold" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                      {group.category}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {(group.items || []).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#d1d5db" }}>
                        <span style={{ color: "#D4881C" }} className="mt-1">&#8226;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Image-left layout
  if (s.layout === "image-left" && showImage && image) {
    return (
      <div
        className={`py-20 px-6 ${settings.fullWidth ? "" : "mx-auto max-w-6xl"}`}
        style={{ backgroundColor: settings.backgroundColor || "transparent" }}
      >
        <div className={`grid grid-cols-1 gap-12 md:grid-cols-2 ${settings.fullWidth ? "mx-auto max-w-6xl" : ""}`}>
          <div className="relative aspect-square overflow-hidden rounded-xl" style={{ border: "1px solid #2a2a2a" }}>
            <Image src={image} alt={imageAlt || heading} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="flex flex-col justify-center">
            {heading && (
              <h2
                className="mb-6 text-3xl font-bold text-white md:text-4xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {renderHeading(heading, headingHighlight)}
              </h2>
            )}
            {paragraphs.length > 0 ? (
              <div className="space-y-4">
                {paragraphs.map((p, i) => (
                  <p key={i} className="text-base leading-relaxed" style={{ color: "#d1d5db" }}>
                    {p}
                  </p>
                ))}
              </div>
            ) : body ? (
              <div className="text-base leading-relaxed md:text-lg">{renderBody(body)}</div>
            ) : null}
            {location && (
              <p className="mt-6 text-sm font-medium" style={{ color: "#D4881C" }}>
                {location}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default layout
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
            className="mb-4 text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {renderHeading(heading, headingHighlight)}
          </h2>
        )}

        {subheading && (
          <p className="mb-8 text-lg" style={{ color: "#9ca3af" }}>
            {subheading}
          </p>
        )}

        {!subheading && heading && <div className="mb-8" />}

        {paragraphs.length > 0 ? (
          <div className="space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-base leading-relaxed md:text-lg" style={{ color: "#d1d5db" }}>
                {p}
              </p>
            ))}
          </div>
        ) : body ? (
          <div className="text-base leading-relaxed md:text-lg">
            {renderBody(body)}
          </div>
        ) : null}

        {location && (
          <p className="mt-6 text-sm font-medium" style={{ color: "#D4881C" }}>
            {location}
          </p>
        )}
      </div>
    </div>
  );
}
