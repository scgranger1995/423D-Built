"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import type { BlockSettings } from "./BlockRenderer";

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

export function ContactFormBlock({
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
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

  return (
    <div
      className={`py-20 px-6 ${settings.fullWidth ? "" : "mx-auto max-w-3xl"}`}
      style={{
        backgroundColor: settings.backgroundColor || "transparent",
      }}
    >
      <div
        className={`rounded-2xl p-8 md:p-10 ${settings.fullWidth ? "mx-auto max-w-3xl" : ""}`}
        style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
      >
        <h2
          className="mb-6 text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Send Us a Message
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
              {/* Name */}
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

              {/* Email */}
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
              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">
                  Phone
                </label>
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

              {/* Subject */}
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
                  <option value="general">General Inquiry</option>
                  <option value="quote">Request a Quote</option>
                  <option value="3d-printing">3D Printing Question</option>
                  <option value="laser-engraving">Laser Engraving Question</option>
                  <option value="order">Order Status</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Message */}
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

            {/* Error message */}
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

            {/* Submit */}
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
    </div>
  );
}
