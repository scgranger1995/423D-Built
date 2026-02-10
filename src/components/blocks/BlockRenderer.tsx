"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { HeroBlock } from "./HeroBlock";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { GalleryBlock } from "./GalleryBlock";
import { CardsBlock } from "./CardsBlock";
import { CTABlock } from "./CTABlock";
import { ContactFormBlock } from "./ContactFormBlock";
import { ProductGridBlock } from "./ProductGridBlock";
import { FAQBlock } from "./FAQBlock";
import { TestimonialsBlock } from "./TestimonialsBlock";
import { StatsBlock } from "./StatsBlock";
import { CustomHTMLBlock } from "./CustomHTMLBlock";

// ============================================
// Types
// ============================================

export interface PageBlock {
  id: string;
  type: string;
  content: string; // JSON string
  settings: string; // JSON string
  sortOrder: number;
}

export interface BlockSettings {
  backgroundColor?: string;
  padding?: string;
  fullWidth?: boolean;
}

// ============================================
// Block Registry
// ============================================

const BLOCK_COMPONENTS: Record<
  string,
  React.ComponentType<{ content: Record<string, unknown>; settings: BlockSettings }>
> = {
  hero: HeroBlock,
  text: TextBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  cards: CardsBlock,
  cta: CTABlock,
  contact_form: ContactFormBlock,
  product_grid: ProductGridBlock,
  faq: FAQBlock,
  testimonials: TestimonialsBlock,
  stats: StatsBlock,
  custom_html: CustomHTMLBlock,
};

// ============================================
// Animated Section Wrapper
// ============================================

function AnimatedBlockWrapper({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: BlockSettings;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const style: React.CSSProperties = {};
  if (settings.backgroundColor) {
    style.backgroundColor = settings.backgroundColor;
  }
  if (settings.padding) {
    style.padding = settings.padding;
  }

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      style={style}
    >
      {children}
    </motion.section>
  );
}

// ============================================
// Block Renderer
// ============================================

export function BlockRenderer({ blocks }: { blocks: PageBlock[] }) {
  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {sorted.map((block) => {
        const Component = BLOCK_COMPONENTS[block.type];
        if (!Component) {
          return null;
        }

        let content: Record<string, unknown> = {};
        let settings: BlockSettings = {};

        try {
          content = JSON.parse(block.content || "{}");
        } catch {
          content = {};
        }

        try {
          settings = JSON.parse(block.settings || "{}");
        } catch {
          settings = {};
        }

        // Hero blocks handle their own animation
        if (block.type === "hero") {
          return (
            <Component key={block.id} content={content} settings={settings} />
          );
        }

        return (
          <AnimatedBlockWrapper key={block.id} settings={settings}>
            <Component content={content} settings={settings} />
          </AnimatedBlockWrapper>
        );
      })}
    </>
  );
}
