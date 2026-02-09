"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Instagram,
  Facebook,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

/* ==========================================================
   Animated Section Wrapper
   ========================================================== */
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ==========================================================
   TikTok icon
   ========================================================== */
function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.72a8.19 8.19 0 0 0 4.76 1.52V6.79a4.84 4.84 0 0 1-1-.1z" />
    </svg>
  );
}

/* ==========================================================
   CONTACT PAGE COMPONENT
   ========================================================== */
export default function ContactPage() {
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
      // Map form subject values to valid API serviceType enum values
      const serviceTypeMap: Record<string, string> = {
        "general": "CONSULTATION",
        "quote": "CONSULTATION",
        "3d-printing": "PRINTING_3D",
        "laser-engraving": "LASER_ENGRAVING",
        "order": "CONSULTATION",
        "other": "CONSULTATION",
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
          referralSource: "contact_form",
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

  const contactInfo = [
    {
      icon: MapPin,
      label: "Address",
      value: "Bristol, Tennessee 37620",
      subvalue: "Heart of Appalachia",
      href: null,
    },
    {
      icon: Phone,
      label: "Phone",
      value: "(423) 555-1234",
      subvalue: null,
      href: "tel:+14235551234",
    },
    {
      icon: Mail,
      label: "Email",
      value: "info@423dbuilt.com",
      subvalue: null,
      href: "mailto:info@423dbuilt.com",
    },
    {
      icon: Clock,
      label: "Business Hours",
      value: "Mon - Fri: 9 AM - 6 PM",
      subvalue: "Sat: 10 AM - 4 PM",
      href: null,
    },
  ];

  const socials = [
    { href: "https://instagram.com/423dbuilt", label: "Instagram", icon: Instagram },
    { href: "https://facebook.com/423dbuilt", label: "Facebook", icon: Facebook },
    { href: "https://tiktok.com/@423dbuilt", label: "TikTok", icon: TikTokIcon },
  ];

  const inputBaseStyle: React.CSSProperties = {
    backgroundColor: "#1a1a1a",
    border: "1px solid #2a2a2a",
    color: "#fff",
    outline: "none",
  };

  return (
    <div className="relative overflow-hidden">
      {/* ====================================================
          HERO SECTION
          ==================================================== */}
      <section className="relative pt-16 pb-20 overflow-hidden" style={{ backgroundColor: "#000" }}>
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at top, rgba(212,136,28,0.06) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p
              className="uppercase tracking-[0.3em] text-sm font-medium mb-4"
              style={{ color: "#D4881C" }}
            >
              Get In Touch
            </p>
            <h1
              className="text-5xl md:text-7xl font-bold gold-gradient-text mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Contact Us
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#9ca3af" }}>
              Have a question or ready to start a project? We would love to hear from you.
              Reach out through the form below or any of our contact channels.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ====================================================
          CONTACT FORM + INFO SECTION
          ==================================================== */}
      <section className="py-24 px-6" style={{ backgroundColor: "#111" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form - 2 columns wide */}
            <AnimatedSection className="lg:col-span-2">
              <div
                className="rounded-2xl p-8 md:p-10"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
              >
                <h2
                  className="text-2xl font-bold text-white mb-6"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Send Us a Message
                </h2>

                {status === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "rgb(74,222,128)" }} />
                    <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                    <p style={{ color: "#9ca3af" }}>
                      Thank you for reaching out. We will get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="mt-6 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
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
                    <div className="grid md:grid-cols-2 gap-5">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-1.5">
                          Name <span style={{ color: "#D4881C" }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Your full name"
                          className="w-full px-4 py-3 rounded-lg text-sm placeholder-gray-600 focus:ring-1"
                          style={{
                            ...inputBaseStyle,
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#D4881C";
                            e.currentTarget.style.boxShadow = "0 0 0 1px #D4881C";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#2a2a2a";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-1.5">
                          Email <span style={{ color: "#D4881C" }}>*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 rounded-lg text-sm placeholder-gray-600"
                          style={inputBaseStyle}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#D4881C";
                            e.currentTarget.style.boxShadow = "0 0 0 1px #D4881C";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#2a2a2a";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-1.5">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(423) 555-1234"
                          className="w-full px-4 py-3 rounded-lg text-sm placeholder-gray-600"
                          style={inputBaseStyle}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#D4881C";
                            e.currentTarget.style.boxShadow = "0 0 0 1px #D4881C";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#2a2a2a";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-1.5">
                          Subject <span style={{ color: "#D4881C" }}>*</span>
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-lg text-sm"
                          style={{
                            ...inputBaseStyle,
                            color: formData.subject ? "#fff" : "#4b5563",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#D4881C";
                            e.currentTarget.style.boxShadow = "0 0 0 1px #D4881C";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#2a2a2a";
                            e.currentTarget.style.boxShadow = "none";
                          }}
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
                      <label className="block text-sm font-medium text-white mb-1.5">
                        Message <span style={{ color: "#D4881C" }}>*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Tell us about your project or question..."
                        className="w-full px-4 py-3 rounded-lg text-sm placeholder-gray-600 resize-none"
                        style={inputBaseStyle}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#D4881C";
                          e.currentTarget.style.boxShadow = "0 0 0 1px #D4881C";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#2a2a2a";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    {/* Error message */}
                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 rounded-lg"
                        style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
                      >
                        <AlertCircle className="w-5 h-5" style={{ color: "rgb(248,113,113)" }} />
                        <p className="text-sm" style={{ color: "rgb(248,113,113)" }}>
                          Something went wrong. Please try again or email us directly.
                        </p>
                      </motion.div>
                    )}

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="inline-flex items-center gap-2 px-8 py-3.5 font-semibold rounded-lg transition-all duration-300 text-lg disabled:opacity-50"
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
                            className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: "#000", borderTopColor: "transparent" }}
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </AnimatedSection>

            {/* Contact Info Sidebar */}
            <AnimatedSection delay={0.2}>
              <div className="space-y-6">
                {/* Contact details */}
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="rounded-xl p-5"
                    style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(212,136,28,0.1)" }}
                      >
                        <item.icon className="w-5 h-5" style={{ color: "#D4881C" }} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: "#6b7280" }}>
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-white font-medium transition-colors"
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#D4881C"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "#fff"; }}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-white font-medium">{item.value}</p>
                        )}
                        {item.subvalue && (
                          <p className="text-sm" style={{ color: "#6b7280" }}>{item.subvalue}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Social Media */}
                <div
                  className="rounded-xl p-5"
                  style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                >
                  <p className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: "#6b7280" }}>
                    Follow Us
                  </p>
                  <div className="flex items-center gap-3">
                    {socials.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200"
                        style={{
                          backgroundColor: "rgba(212,136,28,0.1)",
                          color: "#D4881C",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#D4881C";
                          e.currentTarget.style.color = "#000";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(212,136,28,0.1)";
                          e.currentTarget.style.color = "#D4881C";
                        }}
                      >
                        <social.icon size={20} />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Quick Quote CTA */}
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(212,136,28,0.15) 0%, rgba(176,110,15,0.1) 100%)",
                    border: "1px solid rgba(212,136,28,0.3)",
                  }}
                >
                  <h3
                    className="text-lg font-bold text-white mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Need a Quote?
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "#9ca3af" }}>
                    Use our detailed quote form for project-specific inquiries with file upload.
                  </p>
                  <Link
                    href="/quote"
                    className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: "#D4881C" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#E8A83E"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#D4881C"; }}
                  >
                    Go to Quote Form <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ====================================================
          MAP SECTION
          ==================================================== */}
      <section className="py-24 px-6" style={{ backgroundColor: "#000" }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2
                className="text-3xl font-bold gold-gradient-text mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Find Us
              </h2>
              <p style={{ color: "#9ca3af" }}>
                Located in Bristol, Tennessee &mdash; on the state line between Tennessee and Virginia.
              </p>
            </div>

            <div
              className="rounded-2xl overflow-hidden aspect-[16/7] relative"
              style={{ border: "1px solid #2a2a2a" }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d51329.96853285122!2d-82.2231!3d36.5951!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x885a7907e50c2481%3A0x594bfcfad5588285!2sBristol%2C%20TN!5e0!3m2!1sen!2sus!4v1700000000000"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(0.9)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="423D Built - Bristol, Tennessee"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
