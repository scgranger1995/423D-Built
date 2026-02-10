"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import * as LucideIcons from "lucide-react";
import type { BlockSettings } from "./BlockRenderer";

interface CardItem {
  icon?: string;
  title?: string;
  description?: string;
}

interface CardsContent {
  title?: string;
  cards?: CardItem[];
}

function getIcon(name: string): React.ComponentType<{ className?: string }> | null {
  if (!name) return null;
  // Normalize: "shopping-cart" => "ShoppingCart", "ShoppingCart" => "ShoppingCart"
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

export function CardsBlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as CardsContent;
  const title = c.title || "";
  const cards = Array.isArray(c.cards) ? c.cards : [];
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  if (cards.length === 0) return null;

  return (
    <div
      ref={ref}
      className={`py-20 px-6 ${
        settings.fullWidth ? "" : "mx-auto max-w-7xl"
      }`}
      style={{
        backgroundColor: settings.backgroundColor || "transparent",
      }}
    >
      <div className={settings.fullWidth ? "mx-auto max-w-7xl" : ""}>
        {title && (
          <h2
            className="mb-12 text-center text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {title}
          </h2>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => {
            const IconComponent = getIcon(card.icon || "");

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 30 }
                }
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="group rounded-xl p-6 transition-all duration-300"
                style={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(212,136,28,0.4)";
                  e.currentTarget.style.boxShadow =
                    "0 0 20px rgba(212,136,28,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a2a2a";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {IconComponent && (
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-300"
                    style={{ backgroundColor: "rgba(212,136,28,0.1)" }}
                  >
                    <IconComponent className="h-6 w-6 text-gold" />
                  </div>
                )}

                {card.title && (
                  <h3
                    className="mb-2 text-xl font-bold text-white"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {card.title}
                  </h3>
                )}

                {card.description && (
                  <p className="text-sm leading-relaxed" style={{ color: "#9ca3af" }}>
                    {card.description}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
