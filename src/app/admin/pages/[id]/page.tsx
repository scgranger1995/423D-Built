"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  GripVertical,
  Type,
  LayoutTemplate,
  Columns,
  MessageSquareQuote,
  BarChart3,
  HelpCircle,
  Grid3X3,
  Phone,
  ShoppingBag,
  Code,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";

// ============================================
// Visual Page Editor - Block-based editing
// ============================================

// --- Types ---

interface PageData {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlockData {
  id: string;
  pageId: string;
  type: string;
  sortOrder: number;
  content: string; // JSON string
  settings: string; // JSON string
}

type BlockType =
  | "hero"
  | "text"
  | "image"
  | "gallery"
  | "cards"
  | "cta"
  | "contact_form"
  | "product_grid"
  | "faq"
  | "testimonials"
  | "stats"
  | "custom_html";

interface BlockTypeOption {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ElementType;
  defaultContent: Record<string, unknown>;
}

// --- Block Type Definitions ---

const BLOCK_TYPES: BlockTypeOption[] = [
  {
    type: "hero",
    label: "Hero Section",
    description: "Large heading with CTA and background image",
    icon: LayoutTemplate,
    defaultContent: {
      heading: "",
      subheading: "",
      tagline: "",
      ctaText: "",
      ctaLink: "",
      backgroundImage: "",
    },
  },
  {
    type: "text",
    label: "Text Section",
    description: "Heading with body text",
    icon: Type,
    defaultContent: { heading: "", body: "" },
  },
  {
    type: "image",
    label: "Image",
    description: "Single image with alt text and caption",
    icon: ImageIcon,
    defaultContent: { url: "", alt: "", caption: "" },
  },
  {
    type: "gallery",
    label: "Image Gallery",
    description: "Multiple images in a grid",
    icon: Grid3X3,
    defaultContent: { images: [] },
  },
  {
    type: "cards",
    label: "Cards Grid",
    description: "Grid of cards with icons, titles, and descriptions",
    icon: Columns,
    defaultContent: { title: "", cards: [] },
  },
  {
    type: "cta",
    label: "Call to Action",
    description: "Heading, description, and button",
    icon: Sparkles,
    defaultContent: {
      heading: "",
      description: "",
      buttonText: "",
      buttonLink: "",
    },
  },
  {
    type: "contact_form",
    label: "Contact Form",
    description: "Embedded contact form",
    icon: Phone,
    defaultContent: { enabled: true },
  },
  {
    type: "product_grid",
    label: "Product Grid",
    description: "Display products by category",
    icon: ShoppingBag,
    defaultContent: { category: "ALL", count: 6 },
  },
  {
    type: "faq",
    label: "FAQ",
    description: "Frequently asked questions accordion",
    icon: HelpCircle,
    defaultContent: { items: [] },
  },
  {
    type: "testimonials",
    label: "Testimonials",
    description: "Customer quotes and reviews",
    icon: MessageSquareQuote,
    defaultContent: { items: [] },
  },
  {
    type: "stats",
    label: "Stats Counter",
    description: "Number stats with labels",
    icon: BarChart3,
    defaultContent: { items: [] },
  },
  {
    type: "custom_html",
    label: "Custom HTML",
    description: "Raw HTML content",
    icon: Code,
    defaultContent: { html: "" },
  },
];

// --- Helpers ---

function safeParseJSON(str: string, fallback: Record<string, unknown> = {}): Record<string, unknown> {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function getBlockLabel(blockType: string): string {
  return BLOCK_TYPES.find((bt) => bt.type === blockType)?.label || blockType;
}

function getBlockIcon(blockType: string): React.ElementType {
  return BLOCK_TYPES.find((bt) => bt.type === blockType)?.icon || Type;
}

// ============================================
// Image Upload Component
// ============================================

function ImageUploadField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.url);
    } catch {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {value && (
          <div className="relative w-32 h-24 bg-[#222] rounded-lg overflow-hidden group">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#1a1a1a] border border-[#333] text-gray-300 rounded-lg hover:border-[#D4881C] hover:text-white transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Upload size={12} />
            )}
            Upload Image
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#1a1a1a] border border-[#333] text-gray-300 rounded-lg hover:border-[#D4881C] hover:text-white transition-colors"
          >
            <LinkIcon size={12} />
            Paste URL
          </button>
        </div>
        {showUrlInput && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-1.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
            />
            <button
              type="button"
              onClick={() => {
                if (urlValue.trim()) {
                  onChange(urlValue.trim());
                  setUrlValue("");
                  setShowUrlInput(false);
                }
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-black hover:opacity-90"
              style={{ backgroundColor: "#D4881C" }}
            >
              Set
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}

// ============================================
// Block Content Editors
// ============================================

function HeroBlockEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Heading</label>
        <input
          type="text"
          value={(content.heading as string) || ""}
          onChange={(e) => onChange({ ...content, heading: e.target.value })}
          className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
          placeholder="Main headline..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Subheading</label>
        <input
          type="text"
          value={(content.subheading as string) || ""}
          onChange={(e) => onChange({ ...content, subheading: e.target.value })}
          className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
          placeholder="Supporting headline..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Tagline</label>
        <textarea
          value={(content.tagline as string) || ""}
          onChange={(e) => onChange({ ...content, tagline: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] resize-y"
          placeholder="Descriptive tagline text..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">CTA Text</label>
          <input
            type="text"
            value={(content.ctaText as string) || ""}
            onChange={(e) => onChange({ ...content, ctaText: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
            placeholder="Get Started"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">CTA Link</label>
          <input
            type="text"
            value={(content.ctaLink as string) || ""}
            onChange={(e) => onChange({ ...content, ctaLink: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
            placeholder="/contact"
          />
        </div>
      </div>
      <ImageUploadField
        label="Background Image"
        value={(content.backgroundImage as string) || ""}
        onChange={(url) => onChange({ ...content, backgroundImage: url })}
      />
    </div>
  );
}

function TextBlockEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Heading <span className="text-gray-500">(optional)</span>
        </label>
        <input
          type="text"
          value={(content.heading as string) || ""}
          onChange={(e) => onChange({ ...content, heading: e.target.value })}
          className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
          placeholder="Section heading..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Body</label>
        <textarea
          value={(content.body as string) || ""}
          onChange={(e) => onChange({ ...content, body: e.target.value })}
          rows={8}
          className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] resize-y"
          placeholder="Write your content here..."
        />
      </div>
    </div>
  );
}

function ImageBlockEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      <ImageUploadField
        label="Image"
        value={(content.url as string) || ""}
        onChange={(url) => onChange({ ...content, url })}
      />
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Alt Text</label>
        <input
          type="text"
          value={(content.alt as string) || ""}
          onChange={(e) => onChange({ ...content, alt: e.target.value })}
          className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
          placeholder="Describe the image for accessibility..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Caption <span className="text-gray-500">(optional)</span>
        </label>
        <input
          type="text"
          value={(content.caption as string) || ""}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
          placeholder="Image caption..."
        />
      </div>
    </div>
  );
}

function GalleryBlockEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const images = (content.images as Array<{ url: string; alt: string; caption: string }>) || [];

  const addImage = () => {
    onChange({
      ...content,
      images: [...images, { url: "", alt: "", caption: "" }],
    });
  };

  const updateImage = (index: number, field: string, value: string) => {
    const updated = images.map((img, i) =>
      i === index ? { ...img, [field]: value } : img
    );
    onChange({ ...content, images: updated });
  };

  const removeImage = (index: number) => {
    onChange({ ...content, images: images.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {images.map((img, i) => (
        <div key={i} className="p-4 bg-[#0a0a0a] border border-[#333] rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Image {i + 1}</span>
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <ImageUploadField
            value={img.url}
            onChange={(url) => updateImage(i, "url", url)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={img.alt}
              onChange={(e) => updateImage(i, "alt", e.target.value)}
              placeholder="Alt text"
              className="px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
            />
            <input
              type="text"
              value={img.caption}
              onChange={(e) => updateImage(i, "caption", e.target.value)}
              placeholder="Caption (optional)"
              className="px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addImage}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-[#1a1a1a] border border-[#333] text-gray-300 rounded-lg hover:border-[#D4881C] hover:text-white transition-colors"
      >
        <Plus size={12} />
        Add Image
      </button>
    </div>
  );
}

function CardsBlockEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const cards = (content.cards as Array<{ icon: string; title: string; description: string }>) || [];

  const addCard = () => {
    onChange({
      ...content,
      cards: [...cards, { icon: "", title: "", description: "" }],
    });
  };

  const updateCard = (index: number, field: string, value: string) => {
    const updated = cards.map((card, i) =>
      i === index ? { ...card, [field]: value } : card
    );
    onChange({ ...content, cards: updated });
  };

  const removeCard = (index: number) => {
    onChange({ ...content, cards: cards.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Section Title</label>
        <input
          type="text"
          value={(content.title as string) || ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
          placeholder="Section title..."
        />
      </div>
      {cards.map((card, i) => (
        <div key={i} className="p-4 bg-[#0a0a0a] border border-[#333] rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Card {i + 1}</span>
            <button
              type="button"
              onClick={() => removeCard(i)}
              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                Icon (lucide name)
              </label>
              <input
                type="text"
                value={card.icon}
                onChange={(e) => updateCard(i, "icon", e.target.value)}
                placeholder="e.g. Printer, Star, Shield"
                className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Title</label>
              <input
                type="text"
                value={card.title}
                onChange={(e) => updateCard(i, "title", e.target.value)}
                placeholder="Card title..."
                className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Description</label>
            <textarea
              value={card.description}
              onChange={(e) => updateCard(i, "description", e.target.value)}
              rows={2}
              placeholder="Card description..."
              className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] resize-y"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addCard}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-[#1a1a1a] border border-[#333] text-gray-300 rounded-lg hover:border-[#D4881C] hover:text-white transition-colors"
      >
        <Plus size={12} />
        Add Card
      </button>
    </div>
  );
}

function CTABlockEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Heading</label>
        <input
          type="text"
          value={(content.heading as string) || ""}
          onChange={(e) => onChange({ ...content, heading: e.target.value })}
          className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
          placeholder="Call to action heading..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          value={(content.description as string) || ""}
          onChange={(e) => onChange({ ...content, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] resize-y"
          placeholder="Supporting description text..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Button Text</label>
          <input
            type="text"
            value={(content.buttonText as string) || ""}
            onChange={(e) => onChange({ ...content, buttonText: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
            placeholder="Learn More"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Button Link</label>
          <input
            type="text"
            value={(content.buttonLink as string) || ""}
            onChange={(e) => onChange({ ...content, buttonLink: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
            placeholder="/shop"
          />
        </div>
      </div>
    </div>
  );
}

function ContactFormBlockEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const enabled = content.enabled !== false;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        This block renders the built-in contact form on the page.
      </p>
      <button
        type="button"
        onClick={() => onChange({ ...content, enabled: !enabled })}
        className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-[#333] rounded-lg hover:border-[#444] transition-colors w-full"
      >
        <span className="text-sm text-gray-300 flex-1 text-left">Show Contact Form</span>
        {enabled ? (
          <ToggleRight size={24} style={{ color: "#D4881C" }} />
        ) : (
          <ToggleLeft size={24} className="text-gray-500" />
        )}
      </button>
    </div>
  );
}

function ProductGridBlockEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const CATEGORIES = [
    { value: "ALL", label: "All" },
    { value: "PRINTING_3D", label: "3D Printing" },
    { value: "LASER_ENGRAVE", label: "Laser Engraving" },
    { value: "DESIGN", label: "Design" },
    { value: "OTHER", label: "Other" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Category Filter</label>
          <select
            value={(content.category as string) || "ALL"}
            onChange={(e) => onChange({ ...content, category: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C] cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Number of Items
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={(content.count as number) || 6}
            onChange={(e) =>
              onChange({ ...content, count: parseInt(e.target.value) || 6 })
            }
            className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-[#D4881C]"
          />
        </div>
      </div>
    </div>
  );
}

function FAQBlockEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const items = (content.items as Array<{ question: string; answer: string }>) || [];

  const addItem = () => {
    onChange({
      ...content,
      items: [...items, { question: "", answer: "" }],
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, items: updated });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="p-4 bg-[#0a0a0a] border border-[#333] rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Q&A {i + 1}</span>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Question</label>
            <input
              type="text"
              value={item.question}
              onChange={(e) => updateItem(i, "question", e.target.value)}
              placeholder="What is...?"
              className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Answer</label>
            <textarea
              value={item.answer}
              onChange={(e) => updateItem(i, "answer", e.target.value)}
              rows={3}
              placeholder="The answer is..."
              className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] resize-y"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-[#1a1a1a] border border-[#333] text-gray-300 rounded-lg hover:border-[#D4881C] hover:text-white transition-colors"
      >
        <Plus size={12} />
        Add Question
      </button>
    </div>
  );
}

function TestimonialsBlockEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  // Normalize: seed data uses "testimonials" array with "text"/"location" fields
  // Editor standardizes to "items" array with "quote"/"role" fields
  const rawItems = (content.items || content.testimonials) as Array<Record<string, string>> | undefined;
  const items: Array<{ name: string; role: string; quote: string }> = (rawItems || []).map((t) => ({
    name: t.name || "",
    role: t.role || t.location || "",
    quote: t.quote || t.text || "",
  }));

  const addItem = () => {
    onChange({
      ...content,
      testimonials: undefined,
      items: [...items, { name: "", role: "", quote: "" }],
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, testimonials: undefined, items: updated });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, testimonials: undefined, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {content.heading !== undefined && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Section Heading</label>
          <input
            type="text"
            value={(content.heading as string) || ""}
            onChange={(e) => onChange({ ...content, heading: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
            placeholder="What Our Customers Say"
          />
        </div>
      )}
      {items.map((item, i) => (
        <div key={i} className="p-4 bg-[#0a0a0a] border border-[#333] rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Testimonial {i + 1}</span>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Name</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(i, "name", e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                Role / Location
              </label>
              <input
                type="text"
                value={item.role}
                onChange={(e) => updateItem(i, "role", e.target.value)}
                placeholder="Johnson City, TN"
                className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Quote</label>
            <textarea
              value={item.quote}
              onChange={(e) => updateItem(i, "quote", e.target.value)}
              rows={3}
              placeholder="What they said..."
              className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] resize-y"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-[#1a1a1a] border border-[#333] text-gray-300 rounded-lg hover:border-[#D4881C] hover:text-white transition-colors"
      >
        <Plus size={12} />
        Add Testimonial
      </button>
    </div>
  );
}

function StatsBlockEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  // Normalize: seed data uses "stats" array, editor standardizes to "items"
  const rawItems = (content.items || content.stats) as Array<{ value: string | number; label: string; suffix: string }> | undefined;
  const items: Array<{ value: string; label: string; suffix: string }> = (rawItems || []).map((s) => ({
    value: String(s.value ?? ""),
    label: s.label || "",
    suffix: s.suffix || "",
  }));

  const addItem = () => {
    onChange({
      ...content,
      stats: undefined,
      items: [...items, { value: "", label: "", suffix: "" }],
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, stats: undefined, items: updated });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, stats: undefined, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="p-4 bg-[#0a0a0a] border border-[#333] rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400">Stat {i + 1}</span>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                Number / Value
              </label>
              <input
                type="text"
                value={item.value}
                onChange={(e) => updateItem(i, "value", e.target.value)}
                placeholder="500"
                className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Label</label>
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(i, "label", e.target.value)}
                placeholder="Projects Completed"
                className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                Suffix
              </label>
              <input
                type="text"
                value={item.suffix}
                onChange={(e) => updateItem(i, "suffix", e.target.value)}
                placeholder="+, %, K"
                className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-[#1a1a1a] border border-[#333] text-gray-300 rounded-lg hover:border-[#D4881C] hover:text-white transition-colors"
      >
        <Plus size={12} />
        Add Stat
      </button>
    </div>
  );
}

function CustomHTMLBlockEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">HTML Content</label>
        <textarea
          value={(content.html as string) || ""}
          onChange={(e) => onChange({ ...content, html: e.target.value })}
          rows={12}
          className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] resize-y font-mono"
          placeholder="<div>Your custom HTML...</div>"
          spellCheck={false}
        />
      </div>
      <p className="text-xs text-gray-500">
        Enter raw HTML. Be careful with scripts and ensure proper tag closure.
      </p>
    </div>
  );
}

// --- Block Editor Dispatcher ---

function BlockContentEditor({
  blockType,
  content,
  onChange,
}: {
  blockType: string;
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  switch (blockType) {
    case "hero":
      return <HeroBlockEditor content={content} onChange={onChange} />;
    case "text":
      return <TextBlockEditor content={content} onChange={onChange} />;
    case "image":
      return <ImageBlockEditor content={content} onChange={onChange} />;
    case "gallery":
      return <GalleryBlockEditor content={content} onChange={onChange} />;
    case "cards":
      return <CardsBlockEditor content={content} onChange={onChange} />;
    case "cta":
      return <CTABlockEditor content={content} onChange={onChange} />;
    case "contact_form":
      return <ContactFormBlockEditor content={content} onChange={onChange} />;
    case "product_grid":
      return <ProductGridBlockEditor content={content} onChange={onChange} />;
    case "faq":
      return <FAQBlockEditor content={content} onChange={onChange} />;
    case "testimonials":
      return <TestimonialsBlockEditor content={content} onChange={onChange} />;
    case "stats":
      return <StatsBlockEditor content={content} onChange={onChange} />;
    case "custom_html":
      return <CustomHTMLBlockEditor content={content} onChange={onChange} />;
    default:
      return (
        <p className="text-sm text-gray-500">
          Unknown block type: {blockType}
        </p>
      );
  }
}

// ============================================
// Block Type Picker Modal
// ============================================

function BlockTypePicker({
  onSelect,
  onClose,
}: {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#111] border border-[#333] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
          <h3
            className="text-lg font-bold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Add Block
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Block Types Grid */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BLOCK_TYPES.map((bt) => {
              const Icon = bt.icon;
              return (
                <button
                  key={bt.type}
                  onClick={() => onSelect(bt.type)}
                  className="flex items-start gap-3 p-4 bg-[#0a0a0a] border border-[#333] rounded-xl text-left hover:border-[#D4881C] hover:bg-[#1a1a1a] transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#1a1a1a] group-hover:bg-[#D4881C]/10 transition-colors"
                  >
                    <Icon
                      size={18}
                      className="text-gray-400 group-hover:text-[#D4881C] transition-colors"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{bt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{bt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Add Block Button (between blocks)
// ============================================

function AddBlockButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex items-center justify-center py-2 group">
      <div className="flex-1 h-px bg-[#222] group-hover:bg-[#D4881C]/30 transition-colors" />
      <button
        type="button"
        onClick={onClick}
        className="mx-3 p-1.5 rounded-full border border-[#333] text-gray-500 hover:text-[#D4881C] hover:border-[#D4881C] hover:bg-[#D4881C]/10 transition-all"
        title="Add block"
      >
        <Plus size={14} />
      </button>
      <div className="flex-1 h-px bg-[#222] group-hover:bg-[#D4881C]/30 transition-colors" />
    </div>
  );
}

// ============================================
// Single Block Card
// ============================================

function BlockCard({
  block,
  content,
  isFirst,
  isLast,
  isExpanded,
  onToggle,
  onMoveUp,
  onMoveDown,
  onDelete,
  onContentChange,
}: {
  block: BlockData;
  content: Record<string, unknown>;
  isFirst: boolean;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onContentChange: (c: Record<string, unknown>) => void;
}) {
  const Icon = getBlockIcon(block.type);

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
      {/* Block Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#1a1a1a] transition-colors select-none"
        onClick={onToggle}
      >
        <GripVertical size={16} className="text-gray-600 flex-shrink-0" />
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "rgba(212, 136, 28, 0.1)" }}
        >
          <Icon size={14} style={{ color: "#D4881C" }} />
        </div>
        <span className="text-sm font-medium text-white flex-1">
          {getBlockLabel(block.type)}
        </span>

        {/* Move / Delete controls */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-[#222] rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-500 disabled:hover:bg-transparent"
            title="Move up"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-[#222] rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-500 disabled:hover:bg-transparent"
            title="Move down"
          >
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
            title="Delete block"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <ChevronRight
          size={16}
          className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
      </div>

      {/* Block Content (expanded) */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-[#222]">
          <BlockContentEditor
            blockType={block.type}
            content={content}
            onChange={onContentChange}
          />
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Page Editor Component
// ============================================

export default function PageEditorPage() {
  const params = useParams();
  const pageId = params.id as string;

  // Page data
  const [page, setPage] = useState<PageData | null>(null);
  const [pageTitle, setPageTitle] = useState("");

  // Blocks
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [blockContents, setBlockContents] = useState<Record<string, Record<string, unknown>>>({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number>(-1); // -1 means append

  // --- Data Fetching ---

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch page info
      const pageRes = await fetch(`/api/admin/pages?id=${pageId}`);
      if (!pageRes.ok) throw new Error("Failed to fetch page");
      const pageJson = await pageRes.json();
      const pageData = pageJson.page || pageJson;
      setPage(pageData);
      setPageTitle(pageData.title || "");

      // Fetch blocks
      const blocksRes = await fetch(`/api/admin/pages/blocks?pageId=${pageId}`);
      if (!blocksRes.ok) throw new Error("Failed to fetch blocks");
      const blocksData = await blocksRes.json();
      const fetchedBlocks: BlockData[] = blocksData.blocks || [];

      // Sort by sortOrder
      fetchedBlocks.sort((a, b) => a.sortOrder - b.sortOrder);
      setBlocks(fetchedBlocks);

      // Parse block contents
      const contents: Record<string, Record<string, unknown>> = {};
      for (const block of fetchedBlocks) {
        contents[block.id] = safeParseJSON(block.content);
      }
      setBlockContents(contents);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load page");
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    if (pageId) fetchPageData();
  }, [pageId, fetchPageData]);

  // --- Block Operations ---

  const toggleExpanded = (blockId: string) => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });
  };

  const updateBlockContent = (blockId: string, content: Record<string, unknown>) => {
    setBlockContents((prev) => ({ ...prev, [blockId]: content }));
    setHasChanges(true);
  };

  const handleAddBlock = async (blockType: BlockType) => {
    setShowBlockPicker(false);

    const blockDef = BLOCK_TYPES.find((bt) => bt.type === blockType);
    if (!blockDef) return;

    // Calculate sort order
    let newSortOrder: number;
    if (insertAtIndex >= 0 && insertAtIndex < blocks.length) {
      // Insert between blocks
      const currentSort = blocks[insertAtIndex].sortOrder;
      const nextSort = insertAtIndex + 1 < blocks.length ? blocks[insertAtIndex + 1].sortOrder : currentSort + 100;
      newSortOrder = Math.floor((currentSort + nextSort) / 2);
    } else {
      // Append at end
      newSortOrder = blocks.length > 0 ? blocks[blocks.length - 1].sortOrder + 100 : 100;
    }

    try {
      const res = await fetch("/api/admin/pages/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId,
          type: blockType,
          sortOrder: newSortOrder,
          content: JSON.stringify(blockDef.defaultContent),
          settings: JSON.stringify({}),
        }),
      });

      if (!res.ok) throw new Error("Failed to add block");
      const newBlockRes = await res.json();
      const newBlock = newBlockRes.block || newBlockRes;

      // Insert into local state
      const updatedBlocks = [...blocks, newBlock].sort(
        (a, b) => a.sortOrder - b.sortOrder
      );
      setBlocks(updatedBlocks);
      setBlockContents((prev) => ({
        ...prev,
        [newBlock.id]: { ...blockDef.defaultContent },
      }));

      // Auto-expand the new block
      setExpandedBlocks((prev) => new Set([...prev, newBlock.id]));
      setInsertAtIndex(-1);
    } catch {
      setError("Failed to add block");
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm("Delete this block? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/pages/blocks?id=${blockId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete block");

      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      setBlockContents((prev) => {
        const next = { ...prev };
        delete next[blockId];
        return next;
      });
      setExpandedBlocks((prev) => {
        const next = new Set(prev);
        next.delete(blockId);
        return next;
      });
    } catch {
      setError("Failed to delete block");
    }
  };

  const handleMoveBlock = async (blockId: string, direction: "up" | "down") => {
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index < 0) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    // Swap sort orders
    const updated = [...blocks];
    const tempSort = updated[index].sortOrder;
    updated[index] = { ...updated[index], sortOrder: updated[targetIndex].sortOrder };
    updated[targetIndex] = { ...updated[targetIndex], sortOrder: tempSort };
    updated.sort((a, b) => a.sortOrder - b.sortOrder);
    setBlocks(updated);
    setHasChanges(true);
  };

  // --- Save ---

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Update page title if changed
      if (page && pageTitle !== page.title) {
        const pageRes = await fetch(`/api/admin/pages?id=${pageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: pageTitle }),
        });
        if (!pageRes.ok) throw new Error("Failed to update page title");
      }

      // Save all blocks with updated content and sort orders
      for (const block of blocks) {
        const content = blockContents[block.id] || {};
        const res = await fetch(`/api/admin/pages/blocks?id=${block.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sortOrder: block.sortOrder,
            content: JSON.stringify(content),
            settings: block.settings,
          }),
        });
        if (!res.ok) throw new Error(`Failed to save block ${block.id}`);
      }

      // Also reorder blocks
      const reorderPayload = blocks.map((b) => ({
        id: b.id,
        sortOrder: b.sortOrder,
      }));
      await fetch("/api/admin/pages/blocks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: reorderPayload }),
      });

      setSuccess("Page saved successfully!");
      setHasChanges(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  // --- Toggle Published ---

  const handleTogglePublished = async () => {
    if (!page) return;
    try {
      const res = await fetch(`/api/admin/pages?id=${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !page.published }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setPage((prev) => (prev ? { ...prev, published: !prev.published } : null));
    } catch {
      setError("Failed to update publish status");
    }
  };

  // --- Loading State ---

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto animate-spin text-gray-500" />
          <p className="text-sm text-gray-500 mt-3">Loading page editor...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto text-red-400 mb-3" />
          <p className="text-sm text-gray-400">Page not found</p>
          <Link
            href="/admin/pages"
            className="mt-3 inline-block text-sm hover:underline"
            style={{ color: "#D4881C" }}
          >
            Back to Pages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 -mx-6 -mt-6 px-6 py-4 bg-[#0a0a0a] border-b border-[#222] mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link
              href="/admin/pages"
              className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors flex-shrink-0"
              title="Back to Pages"
            >
              <ArrowLeft size={18} />
            </Link>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => {
                setPageTitle(e.target.value);
                setHasChanges(true);
              }}
              className="text-xl font-bold bg-transparent border-none text-white focus:outline-none flex-1 min-w-0 placeholder-gray-500"
              style={{ fontFamily: "'Playfair Display', serif" }}
              placeholder="Page Title"
            />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Unsaved changes indicator */}
            {hasChanges && (
              <span className="text-xs text-yellow-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                Unsaved changes
              </span>
            )}

            {/* Published toggle */}
            <button
              type="button"
              onClick={handleTogglePublished}
              className="flex items-center gap-2 px-3 py-2 bg-[#111] border border-[#333] rounded-lg hover:border-[#444] transition-colors"
              title={page.published ? "Click to unpublish" : "Click to publish"}
            >
              {page.published ? (
                <>
                  <Eye size={14} style={{ color: "#D4881C" }} />
                  <span className="text-xs font-medium text-green-400">Published</span>
                  <ToggleRight size={18} style={{ color: "#D4881C" }} />
                </>
              ) : (
                <>
                  <EyeOff size={14} className="text-gray-500" />
                  <span className="text-xs font-medium text-gray-400">Draft</span>
                  <ToggleLeft size={18} className="text-gray-500" />
                </>
              )}
            </button>

            {/* Preview link */}
            {page.published && (
              <Link
                href={page.slug === "home" ? "/" : `/${page.slug}`}
                target="_blank"
                className="p-2 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors"
                title="Preview page"
              >
                <Eye size={16} />
              </Link>
            )}

            {/* Save button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-black rounded-lg transition-colors disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: "#D4881C" }}
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save
            </button>
          </div>
        </div>

        {/* Slug display */}
        <div className="mt-2 ml-12">
          <span className="text-xs text-gray-500 font-mono">/{page.slug}</span>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2 mb-4">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError("")} className="ml-auto">
            <X size={14} />
          </button>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 flex items-center gap-2 mb-4">
          <Check size={16} />
          {success}
        </div>
      )}

      {/* Blocks List */}
      <div className="space-y-0">
        {blocks.length === 0 ? (
          <div className="text-center py-16 bg-[#111] border border-[#222] rounded-xl">
            <LayoutTemplate size={40} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 mb-2">No blocks yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Start building your page by adding blocks
            </p>
            <button
              type="button"
              onClick={() => {
                setInsertAtIndex(-1);
                setShowBlockPicker(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-black rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: "#D4881C" }}
            >
              <Plus size={16} />
              Add First Block
            </button>
          </div>
        ) : (
          <>
            {/* Add block button at top */}
            <AddBlockButton
              onClick={() => {
                setInsertAtIndex(-1);
                // We want to insert before the first block
                // Use a sortOrder less than the first block
                setInsertAtIndex(-1);
                setShowBlockPicker(true);
              }}
            />

            {blocks.map((block, index) => (
              <React.Fragment key={block.id}>
                <BlockCard
                  block={block}
                  content={blockContents[block.id] || {}}
                  isFirst={index === 0}
                  isLast={index === blocks.length - 1}
                  isExpanded={expandedBlocks.has(block.id)}
                  onToggle={() => toggleExpanded(block.id)}
                  onMoveUp={() => handleMoveBlock(block.id, "up")}
                  onMoveDown={() => handleMoveBlock(block.id, "down")}
                  onDelete={() => handleDeleteBlock(block.id)}
                  onContentChange={(c) => updateBlockContent(block.id, c)}
                />
                {/* Add block button between blocks and at the end */}
                <AddBlockButton
                  onClick={() => {
                    setInsertAtIndex(index);
                    setShowBlockPicker(true);
                  }}
                />
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      {/* Block Type Picker Modal */}
      {showBlockPicker && (
        <BlockTypePicker
          onSelect={handleAddBlock}
          onClose={() => {
            setShowBlockPicker(false);
            setInsertAtIndex(-1);
          }}
        />
      )}
    </div>
  );
}
