"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, AlertCircle, MapPin, Phone, Mail, Clock } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { BlockSettings } from "./BlockRenderer";

interface ContactInfo {
  icon?: string;
  label?: string;
  value?: string;
  subvalue?: string;
  href?: string;
}

interface SubjectOption {
  value?: string;
  label?: string;
}

interface ContactFormContent {
  heading?: string;
  subjects?: SubjectOption[];
  contactInfo?: ContactInfo[];
}

interface ContactFormSettings extends BlockSettings {
  layout?: string;
}

const inputBaseStyle: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  border: "1px solid #2a2a2a",
  color: "#fff",
  outline: "none",
};

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "#D4881C";
  e.currentTarget.style.boxShadow = "0 0 0 1px #D4881C";
}

function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "#2a2a2a";
  e.currentTarget.style.boxShadow = "none";
}

function getIcon(name: string): React.ComponentType<{ className?: string; style?: React.CSSProperties }> | null {
  if (!name) return null;
  const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    MapPin, Phone, Mail, Clock,
  };
  if (iconMap[name]) return iconMap[name];

  const pascalCase = name
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>;
  return icons[pascalCase] || null;
}

const defaultSubjects: SubjectOption[] = [
  { value: "general", label: "General Inquiry" },
  { value: "quote", label: "Request a Quote" },
  { value: "3d-printing", label: "3D Printing Question" },
  { value: "laser-engraving", label: "Laser Engraving Question" },
  { value: "order", label: "Order Status" },
  { value: "other", label: "Other" },
];

export function ContactFormBlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as ContactFormContent;
  const s = settings as unknown as ContactFormSettings;
  const heading = c.heading || "Send Us a Message";
  const subjects = Array.isArray(c.subjects) && c.subjects.length > 0 ? c.subjects : defaultSubjects;
  const contactInfo = Array.isArray(c.contactInfo) ? c.contactInfo : [];
  const hasSidebar = s.layout === "form-with-sidebar" && contactInfo.length > 0;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const serviceTypeMap: Record<string, string> = {
        general: "CONSULTATION",
        quote: "CONSULTATION",
        "3d-printing": "PRINTING_3D",
        "laser-engraving": "LASER_ENGRAVING",
        order: "CONSULTATION",
        other: "CONSULTATION",
      };

      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone || undefined,
          serviceType: serviceTypeMap[formData.subject] || "CONSULTATION",
          description: formData.message,
          quantity: 1,
          timeline: "FLEXIBLE",
          referralSource: "page_contact_form",
        }),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const formElement = (
    <div
      className="rounded-2xl p-8 md:p-10"
      style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
    >
      <h2
        className="mb-6 text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {heading}
      </h2>

      {status === "success" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12 text-center"
        >
          <CheckCircle
            className="mx-auto mb-4 h-16 w-16"
            style={{ color: "rgb(74,222,128)" }}
          />
          <h3 className="mb-2 text-2xl font-bold text-white">Message Sent!</h3>
          <p style={{ color: "#9ca3af" }}>
            Thank you for reaching out. We will get back to you within 24 hours.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-6 rounded-lg px-6 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: "rgba(212,136,28,0.1)",
              color: "#D4881C",
              border: "1px solid rgba(212,136,28,0.3)",
            }}
          >
            Send Another Message
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Name <span style={{ color: "#D4881C" }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                className="w-full rounded-lg px-4 py-3 text-sm placeholder-gray-600"
                style={inputBaseStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Email <span style={{ color: "#D4881C" }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full rounded-lg px-4 py-3 text-sm placeholder-gray-600"
                style={inputBaseStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(423) 555-1234"
                className="w-full rounded-lg px-4 py-3 text-sm placeholder-gray-600"
                style={inputBaseStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Subject <span style={{ color: "#D4881C" }}>*</span>
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full rounded-lg px-4 py-3 text-sm"
                style={{
                  ...inputBaseStyle,
                  color: formData.subject ? "#fff" : "#4b5563",
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="">Select a subject</option>
                {subjects.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white">
              Message <span style={{ color: "#D4881C" }}>*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Tell us about your project or question..."
              className="w-full resize-none rounded-lg px-4 py-3 text-sm placeholder-gray-600"
              style={inputBaseStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg p-3"
              style={{
                backgroundColor: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              <AlertCircle className="h-5 w-5" style={{ color: "rgb(248,113,113)" }} />
              <p className="text-sm" style={{ color: "rgb(248,113,113)" }}>
                Something went wrong. Please try again or email us directly.
              </p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-lg font-semibold transition-all duration-300 disabled:opacity-50"
            style={{
              backgroundColor: "#D4881C",
              color: "#000",
              boxShadow: "0 0 20px rgba(212,136,28,0.3)",
            }}
            onMouseEnter={(e) => {
              if (status !== "sending") {
                e.currentTarget.style.backgroundColor = "#E8A83E";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#D4881C";
            }}
          >
            {status === "sending" ? (
              <>
                <div
                  className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: "#000", borderTopColor: "transparent" }}
                />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Send Message
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );

  if (!hasSidebar) {
    return (
      <div
        className={`py-20 px-6 ${settings.fullWidth ? "" : "mx-auto max-w-3xl"}`}
        style={{ backgroundColor: settings.backgroundColor || "transparent" }}
      >
        <div className={settings.fullWidth ? "mx-auto max-w-3xl" : ""}>
          {formElement}
        </div>
      </div>
    );
  }

  // Form with sidebar layout
  return (
    <div
      className={`py-20 px-6 ${settings.fullWidth ? "" : "mx-auto max-w-6xl"}`}
      style={{ backgroundColor: settings.backgroundColor || "transparent" }}
    >
      <div className={`grid grid-cols-1 gap-8 lg:grid-cols-3 ${settings.fullWidth ? "mx-auto max-w-6xl" : ""}`}>
        <div className="lg:col-span-2">
          {formElement}
        </div>
        <div className="space-y-6">
          {contactInfo.map((info, idx) => {
            const IconComponent = getIcon(info.icon || "");
            const content = info.href ? (
              <a href={info.href} className="hover:underline" style={{ color: "#d1d5db" }}>
                {info.value}
              </a>
            ) : (
              <span style={{ color: "#d1d5db" }}>{info.value}</span>
            );

            return (
              <div
                key={idx}
                className="rounded-xl p-5"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
              >
                <div className="flex items-start gap-4">
                  {IconComponent && (
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: "rgba(212,136,28,0.1)" }}
                    >
                      <IconComponent className="h-5 w-5" style={{ color: "#D4881C" }} />
                    </div>
                  )}
                  <div>
                    {info.label && (
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider" style={{ color: "#D4881C" }}>
                        {info.label}
                      </p>
                    )}
                    <p className="text-sm font-medium">{content}</p>
                    {info.subvalue && (
                      <p className="mt-0.5 text-xs" style={{ color: "#6b7280" }}>
                        {info.subvalue}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
