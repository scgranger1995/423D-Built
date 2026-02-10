"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { BlockSettings } from "./BlockRenderer";

interface StatItem {
  value?: string | number;
  label?: string;
  suffix?: string;
}

interface StatsContent {
  items?: StatItem[];
  stats?: StatItem[];
}

function AnimatedCounter({
  target,
  suffix,
  isInView,
}: {
  target: number;
  suffix: string;
  isInView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000; // ms
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setCount(current);

      if (step >= steps) {
        clearInterval(timer);
        setCount(target);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target, isInView]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsBlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as StatsContent;
  const items = Array.isArray(c.items)
    ? c.items
    : Array.isArray(c.stats)
    ? c.stats
    : [];
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  if (items.length === 0) return null;

  const colsMap: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };
  const mdCols = colsMap[Math.min(items.length, 4)] || "md:grid-cols-4";

  return (
    <div
      ref={ref}
      className={`py-20 px-6 ${settings.fullWidth ? "" : "mx-auto max-w-7xl"}`}
      style={{
        backgroundColor: settings.backgroundColor || "transparent",
      }}
    >
      <div
        className={`grid grid-cols-2 gap-8 ${mdCols} ${
          settings.fullWidth ? "mx-auto max-w-7xl" : ""
        }`}
      >
        {items.map((item, index) => {
          const numericValue =
            typeof item.value === "number"
              ? item.value
              : parseInt(String(item.value || "0").replace(/[^0-9]/g, ""), 10) || 0;
          const suffix = item.suffix || "";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={
                isInView
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.8 }
              }
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className="text-center"
            >
              <div
                className="mb-2 text-4xl font-bold md:text-5xl"
                style={{ color: "#D4881C", fontFamily: "var(--font-heading)" }}
              >
                <AnimatedCounter
                  target={numericValue}
                  suffix={suffix}
                  isInView={isInView}
                />
              </div>
              {item.label && (
                <p
                  className="text-sm font-medium uppercase tracking-wider"
                  style={{ color: "#9ca3af" }}
                >
                  {item.label}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
