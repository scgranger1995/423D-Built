"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { BlockSettings } from "./BlockRenderer";

interface FAQItem {
  question?: string;
  answer?: string;
}

interface FAQContent {
  items?: FAQItem[];
}

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: "#1a1a1a",
        border: `1px solid ${isOpen ? "rgba(212,136,28,0.3)" : "#2a2a2a"}`,
      }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors"
      >
        <span className="pr-4 text-lg font-semibold text-white">
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-5 w-5" style={{ color: "#D4881C" }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div
              className="border-t px-6 pb-5 pt-4"
              style={{ borderColor: "#2a2a2a" }}
            >
              <p className="leading-relaxed" style={{ color: "#d1d5db" }}>
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQBlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as FAQContent;
  const items = Array.isArray(c.items) ? c.items : [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <div
      className={`py-20 px-6 ${settings.fullWidth ? "" : "mx-auto max-w-3xl"}`}
      style={{
        backgroundColor: settings.backgroundColor || "transparent",
      }}
    >
      <div className={`space-y-4 ${settings.fullWidth ? "mx-auto max-w-3xl" : ""}`}>
        {items.map((item, index) => (
          <FAQAccordionItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
          />
        ))}
      </div>
    </div>
  );
}
