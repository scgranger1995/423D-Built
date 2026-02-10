"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Save,
  Loader2,
  AlertCircle,
  Check,
  Upload,
  X,
  Type,
  Home,
  Users,
  Wrench,
  Phone,
  Image as ImageIcon,
} from "lucide-react";

// ============================================
// Admin Content Page - Site Content Editor
// ============================================

interface ContentItem {
  key: string;
  value: string;
  type: "TEXT" | "HTML" | "IMAGE" | "JSON";
  section: string;
}

interface ContentSection {
  id: string;
  label: string;
  icon: React.ElementType;
  fields: {
    key: string;
    label: string;
    type: "text" | "textarea" | "image" | "html";
    placeholder?: string;
    rows?: number;
  }[];
}

const SECTIONS: ContentSection[] = [
  {
    id: "hero",
    label: "Hero Section",
    icon: Home,
    fields: [
      {
        key: "hero_heading",
        label: "Main Heading",
        type: "text",
        placeholder: "Crafted in Three Dimensions",
      },
      {
        key: "hero_subheading",
        label: "Subheading",
        type: "text",
        placeholder: "Premium 3D Printing & Laser Engraving",
      },
      {
        key: "hero_tagline",
        label: "Tagline",
        type: "textarea",
        placeholder: "From concept to creation, we bring your ideas to life...",
        rows: 2,
      },
      {
        key: "hero_cta_text",
        label: "CTA Button Text",
        type: "text",
        placeholder: "Shop Now",
      },
      {
        key: "hero_image",
        label: "Hero Background Image",
        type: "image",
      },
    ],
  },
  {
    id: "about",
    label: "About Section",
    icon: Users,
    fields: [
      {
        key: "about_story",
        label: "Company Story",
        type: "textarea",
        placeholder: "Tell the story of 423D Built...",
        rows: 6,
      },
      {
        key: "about_mission",
        label: "Mission Statement",
        type: "textarea",
        placeholder: "Our mission is to...",
        rows: 3,
      },
      {
        key: "about_values",
        label: "Core Values",
        type: "textarea",
        placeholder: "Quality, Innovation, Community...",
        rows: 3,
      },
      {
        key: "about_image",
        label: "About Image",
        type: "image",
      },
    ],
  },
  {
    id: "services",
    label: "Services Section",
    icon: Wrench,
    fields: [
      {
        key: "services_heading",
        label: "Section Heading",
        type: "text",
        placeholder: "Our Services",
      },
      {
        key: "services_3d_title",
        label: "3D Printing Title",
        type: "text",
        placeholder: "3D Printing",
      },
      {
        key: "services_3d_description",
        label: "3D Printing Description",
        type: "textarea",
        placeholder: "Custom 3D printing services...",
        rows: 3,
      },
      {
        key: "services_laser_title",
        label: "Laser Engraving Title",
        type: "text",
        placeholder: "Laser Engraving",
      },
      {
        key: "services_laser_description",
        label: "Laser Engraving Description",
        type: "textarea",
        placeholder: "Precision laser engraving...",
        rows: 3,
      },
      {
        key: "services_design_title",
        label: "Design Services Title",
        type: "text",
        placeholder: "Custom Design",
      },
      {
        key: "services_design_description",
        label: "Design Services Description",
        type: "textarea",
        placeholder: "Professional design services...",
        rows: 3,
      },
    ],
  },
  {
    id: "contact",
    label: "Contact Info",
    icon: Phone,
    fields: [
      {
        key: "contact_address",
        label: "Business Address",
        type: "text",
        placeholder: "Bristol, TN 37620",
      },
      {
        key: "contact_phone",
        label: "Phone Number",
        type: "text",
        placeholder: "(423) 555-0123",
      },
      {
        key: "contact_email",
        label: "Contact Email",
        type: "text",
        placeholder: "hello@423dbuilt.com",
      },
      {
        key: "contact_hours_weekday",
        label: "Weekday Hours",
        type: "text",
        placeholder: "Mon-Fri: 9:00 AM - 6:00 PM",
      },
      {
        key: "contact_hours_weekend",
        label: "Weekend Hours",
        type: "text",
        placeholder: "Sat: 10:00 AM - 4:00 PM, Sun: Closed",
      },
      {
        key: "contact_social_facebook",
        label: "Facebook URL",
        type: "text",
        placeholder: "https://facebook.com/423dbuilt",
      },
      {
        key: "contact_social_instagram",
        label: "Instagram URL",
        type: "text",
        placeholder: "https://instagram.com/423dbuilt",
      },
      {
        key: "contact_social_tiktok",
        label: "TikTok URL",
        type: "text",
        placeholder: "https://tiktok.com/@423dbuilt",
      },
    ],
  },
];

export default function AdminContentPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Fetch content
  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content");
      if (!res.ok) throw new Error("Failed to fetch content");
      const data = await res.json();

      // Convert array to key-value map
      const contentMap: Record<string, string> = {};
      if (Array.isArray(data.items)) {
        data.items.forEach((item: ContentItem) => {
          contentMap[item.key] = item.value;
        });
      }
      setContent(contentMap);
    } catch {
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Update field value
  const handleFieldChange = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    setDirtyFields((prev) => new Set(prev).add(key));
  };

  // Handle image upload
  const handleImageUpload = async (
    key: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(key);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      handleFieldChange(key, data.url);
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(null);
    }
  };

  // Save section
  const handleSaveSection = async (sectionId: string) => {
    const section = SECTIONS.find((s) => s.id === sectionId);
    if (!section) return;

    setSavingSection(sectionId);
    setError("");
    setSuccess("");

    try {
      const updates = section.fields
        .filter((field) => dirtyFields.has(field.key) || content[field.key])
        .map((field) => ({
          key: field.key,
          value: content[field.key] || "",
          type: field.type === "image" ? "IMAGE" : field.type === "html" ? "HTML" : "TEXT",
          section: sectionId,
        }));

      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updates }),
      });

      if (!res.ok) throw new Error("Failed to save content");

      // Clear dirty fields for this section
      setDirtyFields((prev) => {
        const next = new Set(prev);
        section.fields.forEach((f) => next.delete(f.key));
        return next;
      });

      setSuccess(`${section.label} saved successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingSection(null);
    }
  };

  // Check if section has changes
  const sectionHasChanges = (sectionId: string) => {
    const section = SECTIONS.find((s) => s.id === sectionId);
    if (!section) return false;
    return section.fields.some((f) => dirtyFields.has(f.key));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-500" />
        <span className="ml-3 text-gray-500">Loading content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Site Content
        </h1>
        <p className="text-gray-400 mt-1">
          Edit the text and images displayed on your storefront
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError("")} className="ml-auto">
            <X size={14} />
          </button>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 flex items-center gap-2">
          <Check size={16} />
          {success}
        </div>
      )}

      {/* Content Sections */}
      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const hasChanges = sectionHasChanges(section.id);
          const isSaving = savingSection === section.id;

          return (
            <div
              key={section.id}
              className="bg-[#111] border border-[#222] rounded-xl overflow-hidden"
            >
              {/* Section Header */}
              <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(212,136,28,0.15)" }}
                  >
                    <Icon size={16} style={{ color: "#D4881C" }} />
                  </div>
                  <h2 className="text-lg font-semibold">{section.label}</h2>
                  {hasChanges && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                      Unsaved
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleSaveSection(section.id)}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black rounded-lg transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "#D4881C" }}
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save {section.label}
                </button>
              </div>

              {/* Section Fields */}
              <div className="p-6 space-y-4">
                {section.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      <span className="flex items-center gap-2">
                        {field.type === "image" ? (
                          <ImageIcon size={12} className="text-gray-500" />
                        ) : (
                          <Type size={12} className="text-gray-500" />
                        )}
                        {field.label}
                      </span>
                    </label>

                    {field.type === "image" ? (
                      <div className="flex items-start gap-4">
                        {content[field.key] && (
                          <div className="w-24 h-24 bg-[#222] rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={content[field.key]}
                              alt={field.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={content[field.key] || ""}
                            onChange={(e) =>
                              handleFieldChange(field.key, e.target.value)
                            }
                            placeholder="Image URL or upload..."
                            className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] mb-2"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              fileInputRefs.current[field.key]?.click()
                            }
                            disabled={uploading === field.key}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-[#333] rounded-lg text-gray-400 hover:bg-[#1a1a1a] transition-colors"
                          >
                            {uploading === field.key ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Upload size={12} />
                            )}
                            Upload Image
                          </button>
                          <input
                            ref={(el) => {
                              fileInputRefs.current[field.key] = el;
                            }}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(field.key, e)}
                            className="hidden"
                          />
                        </div>
                      </div>
                    ) : field.type === "textarea" || field.type === "html" ? (
                      <textarea
                        value={content[field.key] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.key, e.target.value)
                        }
                        rows={field.rows || 3}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C] resize-y"
                      />
                    ) : (
                      <input
                        type="text"
                        value={content[field.key] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.key, e.target.value)
                        }
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-[#333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4881C]"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
