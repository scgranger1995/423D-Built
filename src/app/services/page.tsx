"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Printer,
  Zap,
  PenTool,
  ArrowRight,
  ChevronDown,
  Layers,
  Ruler,
  Settings,
  Box,
  Paintbrush,
  FileText,
  Wrench,
  Eye,
  Scissors,
  TreePine,
  Gem,
  ShieldCheck,
  Droplets,
  Shield,
  Sun,
  Thermometer,
  Check,
  X,
  HelpCircle,
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
   FAQ Accordion Item
   ========================================================== */
function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2a2a2a" }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left transition-colors"
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(26,26,26,0.5)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <span className="text-white font-medium pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: "#D4881C" }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5 leading-relaxed" style={{ color: "#9ca3af" }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================
   Mountain SVG Divider
   ========================================================== */
function MountainDivider() {
  return (
    <svg
      viewBox="0 0 1440 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      preserveAspectRatio="none"
    >
      <path
        d="M0 120 L0 80 L120 40 L240 70 L360 30 L480 60 L600 20 L720 50 L840 10 L960 45 L1080 15 L1200 50 L1320 25 L1440 55 L1440 120 Z"
        fill="#111111"
      />
    </svg>
  );
}

/* ==========================================================
   SERVICES PAGE COMPONENT
   ========================================================== */
export default function ServicesPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  /* ---------- Data ---------- */
  const materials = [
    {
      name: "PLA",
      nickname: "The Everyday Hero",
      icon: Droplets,
      color: "rgba(34,197,94,0.1)",
      borderColor: "rgba(34,197,94,0.3)",
      description:
        "Easy to print, eco-friendly, great for prototypes, decorative items. Good surface finish.",
      heatResist: "Low (60C)",
      uvResist: false,
      strength: "Moderate",
      flexibility: "Low",
      ecoFriendly: true,
      foodSafe: false,
      bestFor: "Prototypes, display models, figurines, decorative items",
    },
    {
      name: "PETG",
      nickname: "The All-Rounder",
      icon: Shield,
      color: "rgba(59,130,246,0.1)",
      borderColor: "rgba(59,130,246,0.3)",
      description:
        "Strong, flexible, chemical resistant. Great for functional parts, outdoor use. Food-safe options available.",
      heatResist: "Medium (80C)",
      uvResist: false,
      strength: "High",
      flexibility: "Medium",
      ecoFriendly: false,
      foodSafe: true,
      bestFor: "Functional parts, outdoor use, food containers, mechanical components",
    },
    {
      name: "ABS",
      nickname: "The Tough One",
      icon: Thermometer,
      color: "rgba(239,68,68,0.1)",
      borderColor: "rgba(239,68,68,0.3)",
      description:
        "Heat resistant, durable, impact resistant. Great for automotive parts, enclosures, functional prototypes. Requires ventilation.",
      heatResist: "High (100C)",
      uvResist: false,
      strength: "High",
      flexibility: "Medium",
      ecoFriendly: false,
      foodSafe: false,
      bestFor: "Automotive parts, enclosures, functional prototypes, tool handles",
    },
    {
      name: "ASA",
      nickname: "The Outdoor Champion",
      icon: Sun,
      color: "rgba(234,179,8,0.1)",
      borderColor: "rgba(234,179,8,0.3)",
      description:
        "UV resistant, weatherproof, excellent for outdoor applications. Superior to ABS for sunlight exposure.",
      heatResist: "High (100C)",
      uvResist: true,
      strength: "High",
      flexibility: "Medium",
      ecoFriendly: false,
      foodSafe: false,
      bestFor: "Outdoor fixtures, garden items, automotive exterior, signage",
    },
  ];

  const laserMaterials = [
    { name: "Wood", icon: TreePine, description: "Engrave and cut plywood, hardwood, MDF, bamboo, and cork" },
    { name: "Acrylic", icon: Gem, description: "Crystal-clear edge cuts and detailed engraving on cast acrylic" },
    { name: "Leather", icon: ShieldCheck, description: "Custom wallets, belts, keychains, and other leather goods" },
    { name: "Glass", icon: Box, description: "Detailed frosted engravings on glassware, mirrors, and awards" },
    { name: "Metal", icon: Settings, description: "Anodized aluminum marking and coated metal engraving" },
    { name: "Fabric", icon: Scissors, description: "Precision cutting of felt, denim, and synthetic fabrics" },
  ];

  const designServices = [
    {
      icon: Box,
      title: "3D Modeling / CAD",
      description:
        "We create detailed 3D models from sketches, photos, or descriptions. Whether you need a product design, mechanical part, or artistic piece, our team delivers production-ready CAD files.",
    },
    {
      icon: Wrench,
      title: "File Preparation & Repair",
      description:
        "Got a 3D file that will not print correctly? We fix non-manifold geometry, repair mesh errors, optimize wall thickness, and ensure your files are print-ready.",
    },
    {
      icon: Eye,
      title: "Design Consultation",
      description:
        "Not sure where to start? We offer free consultations to discuss your project, recommend materials, and help you understand what is possible with 3D printing and laser engraving.",
    },
    {
      icon: Layers,
      title: "Reverse Engineering",
      description:
        "Need to recreate an existing part? We can measure, scan, and model existing objects to create accurate digital replicas for reproduction or modification.",
    },
  ];

  const faqs = [
    {
      question: "How long does a typical 3D print take?",
      answer:
        "Print times vary based on size, complexity, and quality settings. Small items may take 1-3 hours, while larger or more detailed prints can take 12-48 hours. We will provide an estimated timeline with your quote.",
    },
    {
      question: "What file formats do you accept?",
      answer:
        "For 3D printing, we accept STL, OBJ, 3MF, and STEP files. For laser engraving, we work with SVG, DXF, AI, PDF, and high-resolution PNG/JPG images. If you have a different format, contact us and we will work with you.",
    },
    {
      question: "How much does 3D printing cost?",
      answer:
        "Pricing depends on material, size, complexity, and quantity. We offer competitive pricing starting at $10 for small items. Request a free quote with your design for an exact price.",
    },
    {
      question: "What is the maximum size you can print?",
      answer:
        "Our current build volume allows for parts up to 256mm x 256mm x 256mm (approximately 10 x 10 x 10 inches). For larger items, we can split the design into multiple parts that assemble together.",
    },
    {
      question: "Can you match a specific color?",
      answer:
        "We stock a wide range of filament colors across all our materials. For specific color matching, we can source custom colors or apply post-processing finishes like painting or dyeing.",
    },
    {
      question: "What is the difference between laser engraving and laser cutting?",
      answer:
        "Laser engraving removes a thin layer of material to create a design on the surface, while laser cutting goes all the way through the material. We offer both services and can combine them in a single project.",
    },
    {
      question: "Do you offer bulk or production runs?",
      answer:
        "Yes! We offer volume discounts for production runs. Whether you need 10 or 1000 parts, we can scale to meet your needs. Contact us for bulk pricing.",
    },
    {
      question: "How do I get started?",
      answer:
        "Simply request a free quote through our website. Upload your design files (or describe what you need), select your service type and material, and we will get back to you within 24 hours with a detailed quote.",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* ====================================================
          HERO SECTION
          ==================================================== */}
      <section className="relative pt-16 pb-20 overflow-hidden" style={{ backgroundColor: "#000" }}>
        {/* Background pattern */}
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
              What We Offer
            </p>
            <h1
              className="text-5xl md:text-7xl font-bold gold-gradient-text mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Our Services
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#9ca3af" }}>
              From rapid prototyping to custom gifts, we bring your ideas to life with
              precision 3D printing, laser engraving, and professional design services.
            </p>
          </motion.div>

          {/* Quick nav */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mt-10"
          >
            {[
              { href: "#3d-printing", icon: Printer, label: "3D Printing" },
              { href: "#laser-engraving", icon: Zap, label: "Laser Engraving" },
              { href: "#design-services", icon: PenTool, label: "Design Services" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm transition-all"
                style={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  color: "#d1d5db",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(212,136,28,0.5)";
                  e.currentTarget.style.color = "#D4881C";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a2a2a";
                  e.currentTarget.style.color = "#d1d5db";
                }}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </a>
            ))}
          </motion.div>
        </div>

        <MountainDivider />
      </section>

      {/* ====================================================
          3D PRINTING SECTION
          ==================================================== */}
      <section id="3d-printing" className="py-24 px-6 scroll-mt-20" style={{ backgroundColor: "#111" }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(212,136,28,0.1)" }}
              >
                <Printer className="w-7 h-7" style={{ color: "#D4881C" }} />
              </div>
              <div>
                <h2
                  className="text-4xl md:text-5xl font-bold text-white"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  3D Printing Services
                </h2>
                <p className="text-sm mt-1" style={{ color: "#D4881C" }}>
                  Fused Deposition Modeling (FDM)
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              {/* Description */}
              <div>
                <p className="leading-relaxed mb-6" style={{ color: "#d1d5db" }}>
                  Our FDM (Fused Deposition Modeling) 3D printing service transforms your
                  digital designs into physical objects layer by layer. Using high-quality
                  thermoplastic filaments, we build parts from the ground up with precision
                  and repeatability.
                </p>
                <p className="leading-relaxed mb-6" style={{ color: "#9ca3af" }}>
                  Whether you need a single prototype to test a concept, custom replacement
                  parts, personalized gifts, or a small production run, our 3D printing
                  services deliver consistent quality with quick turnaround times.
                </p>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Ruler, label: "Build Volume", value: "256 x 256 x 256mm" },
                    { icon: Layers, label: "Layer Height", value: "0.08 - 0.32mm" },
                    { icon: Settings, label: "Nozzle Size", value: "0.4mm standard" },
                    { icon: FileText, label: "File Formats", value: "STL, OBJ, 3MF" },
                  ].map((spec) => (
                    <div
                      key={spec.label}
                      className="rounded-xl p-4"
                      style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                    >
                      <spec.icon className="w-5 h-5 mb-2" style={{ color: "#D4881C" }} />
                      <p className="text-xs uppercase tracking-wider" style={{ color: "#6b7280" }}>
                        {spec.label}
                      </p>
                      <p className="text-white font-semibold">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process illustration */}
              <div
                className="rounded-2xl p-8"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
              >
                <h3
                  className="text-xl font-bold text-white mb-6"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  How FDM Printing Works
                </h3>
                <div className="space-y-6">
                  {[
                    { step: "01", title: "Design", desc: "You provide a 3D model file (or we create one for you). We review it for printability." },
                    { step: "02", title: "Slice", desc: "Your model is sliced into thin horizontal layers and converted into printer instructions." },
                    { step: "03", title: "Print", desc: "Heated filament is extruded through a nozzle, building your part layer by layer from the bottom up." },
                    { step: "04", title: "Finish", desc: "Support material is removed, surfaces are cleaned, and any post-processing is applied." },
                    { step: "05", title: "Deliver", desc: "Your finished part is quality-checked and shipped or available for local pickup in Bristol, TN." },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: "rgba(212,136,28,0.1)",
                          border: "1px solid rgba(212,136,28,0.3)",
                        }}
                      >
                        <span className="text-sm font-bold" style={{ color: "#D4881C" }}>{item.step}</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{item.title}</p>
                        <p className="text-sm" style={{ color: "#9ca3af" }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Material Selection */}
          <AnimatedSection delay={0.2}>
            <h3
              className="text-3xl font-bold text-white mb-8"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Material Selection
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {materials.map((mat, index) => (
                <motion.div
                  key={mat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: mat.color,
                    border: `1px solid ${mat.borderColor}`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <mat.icon className="w-6 h-6" style={{ color: "#D4881C" }} />
                    <div>
                      <h4 className="text-xl font-bold text-white">{mat.name}</h4>
                      <p className="text-sm italic" style={{ color: "#D4881C" }}>{mat.nickname}</p>
                    </div>
                  </div>
                  <p className="text-sm mb-4" style={{ color: "#9ca3af" }}>{mat.description}</p>
                  <div className="pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <p className="text-xs mb-1 font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
                      Best For
                    </p>
                    <p className="text-sm" style={{ color: "#E8A83E" }}>{mat.bestFor}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Material Comparison Table */}
            <div
              className="rounded-2xl overflow-hidden mb-8"
              style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
            >
              <div className="p-6" style={{ borderBottom: "1px solid #2a2a2a" }}>
                <h4
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Material Comparison
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                      <th className="text-left p-4 font-medium" style={{ color: "#6b7280" }}>Property</th>
                      {materials.map((m) => (
                        <th key={m.name} className="p-4 text-center font-bold" style={{ color: "#D4881C" }}>
                          {m.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Heat Resistance", key: "heatResist" as const },
                      { label: "Strength", key: "strength" as const },
                      { label: "Flexibility", key: "flexibility" as const },
                    ].map((row) => (
                      <tr key={row.label} style={{ borderBottom: "1px solid rgba(42,42,42,0.5)" }}>
                        <td className="p-4" style={{ color: "#9ca3af" }}>{row.label}</td>
                        {materials.map((m) => (
                          <td key={m.name} className="p-4 text-center text-white">
                            {m[row.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {[
                      { label: "UV Resistance", key: "uvResist" as const },
                      { label: "Eco-Friendly", key: "ecoFriendly" as const },
                      { label: "Food Safe Options", key: "foodSafe" as const },
                    ].map((row) => (
                      <tr key={row.label} style={{ borderBottom: "1px solid rgba(42,42,42,0.5)" }}>
                        <td className="p-4" style={{ color: "#9ca3af" }}>{row.label}</td>
                        {materials.map((m) => (
                          <td key={m.name} className="p-4 text-center">
                            {m[row.key] ? (
                              <Check className="w-5 h-5 mx-auto" style={{ color: "rgb(74,222,128)" }} />
                            ) : (
                              <X className="w-5 h-5 mx-auto" style={{ color: "rgb(248,113,113)" }} />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-lg transition-all duration-300 text-lg"
                style={{
                  backgroundColor: "#D4881C",
                  color: "#000",
                  boxShadow: "0 0 20px rgba(212,136,28,0.3)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E8A83E"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#D4881C"; }}
              >
                Request 3D Printing Service
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ====================================================
          LASER ENGRAVING SECTION
          ==================================================== */}
      <section id="laser-engraving" className="py-24 px-6 scroll-mt-20" style={{ backgroundColor: "#000" }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(212,136,28,0.1)" }}
              >
                <Zap className="w-7 h-7" style={{ color: "#D4881C" }} />
              </div>
              <div>
                <h2
                  className="text-4xl md:text-5xl font-bold text-white"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Laser Engraving Services
                </h2>
                <p className="text-sm mt-1" style={{ color: "#D4881C" }}>
                  Precision Engraving &amp; Cutting
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              {/* Description */}
              <div>
                <p className="leading-relaxed mb-6" style={{ color: "#d1d5db" }}>
                  Our laser engraving and cutting services offer incredible precision and
                  detail. Using focused laser technology, we can engrave text, logos,
                  artwork, and photographs onto a wide variety of materials with stunning
                  clarity and permanence.
                </p>
                <p className="leading-relaxed mb-6" style={{ color: "#9ca3af" }}>
                  Perfect for personalized gifts, custom signage, industrial marking,
                  awards, and creative projects. Whether you need a single piece or a
                  production run, our laser services deliver consistent, professional results.
                </p>

                {/* Engraving vs Cutting */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="rounded-xl p-5"
                    style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  >
                    <Paintbrush className="w-5 h-5 mb-3" style={{ color: "#D4881C" }} />
                    <h4 className="text-white font-semibold mb-2">Engraving</h4>
                    <p className="text-sm" style={{ color: "#9ca3af" }}>
                      Removes a thin layer of material surface to create permanent marks,
                      text, and images. Depth is controllable.
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-5"
                    style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  >
                    <Scissors className="w-5 h-5 mb-3" style={{ color: "#D4881C" }} />
                    <h4 className="text-white font-semibold mb-2">Cutting</h4>
                    <p className="text-sm" style={{ color: "#9ca3af" }}>
                      Cuts completely through material to create shapes, letters, and
                      intricate designs. Clean edges with no charring.
                    </p>
                  </div>
                </div>

                {/* Max work area */}
                <div
                  className="mt-4 rounded-xl p-5"
                  style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                >
                  <Ruler className="w-5 h-5 mb-2" style={{ color: "#D4881C" }} />
                  <p className="text-xs uppercase tracking-wider" style={{ color: "#6b7280" }}>Max Work Area</p>
                  <p className="text-white font-semibold text-lg">400 x 400mm (15.7 x 15.7 inches)</p>
                </div>
              </div>

              {/* Materials grid */}
              <div>
                <h3
                  className="text-xl font-bold text-white mb-6"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Supported Materials
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {laserMaterials.map((mat, index) => (
                    <motion.div
                      key={mat.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className="rounded-xl p-4 transition-colors"
                      style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(212,136,28,0.3)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
                    >
                      <mat.icon className="w-6 h-6 mb-2" style={{ color: "#D4881C" }} />
                      <h4 className="text-white font-semibold text-sm mb-1">{mat.name}</h4>
                      <p className="text-xs" style={{ color: "#6b7280" }}>{mat.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Application Gallery Placeholders */}
            <div className="mb-12">
              <h3
                className="text-2xl font-bold text-white mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Application Gallery
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Custom Signs", "Personalized Gifts", "Industrial Marking", "Awards & Trophies"].map(
                  (item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="relative aspect-square rounded-xl overflow-hidden group"
                      style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: "rgba(212,136,28,0.1)",
                            border: "1px solid rgba(212,136,28,0.2)",
                          }}
                        >
                          <Zap className="w-7 h-7" style={{ color: "rgba(212,136,28,0.4)" }} />
                        </div>
                      </div>
                      <p className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium text-center">
                        {item}
                      </p>
                    </motion.div>
                  )
                )}
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-lg transition-all duration-300 text-lg"
                style={{
                  backgroundColor: "#D4881C",
                  color: "#000",
                  boxShadow: "0 0 20px rgba(212,136,28,0.3)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E8A83E"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#D4881C"; }}
              >
                Request Laser Engraving Service
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ====================================================
          DESIGN SERVICES SECTION
          ==================================================== */}
      <section id="design-services" className="py-24 px-6 scroll-mt-20" style={{ backgroundColor: "#111" }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(212,136,28,0.1)" }}
              >
                <PenTool className="w-7 h-7" style={{ color: "#D4881C" }} />
              </div>
              <div>
                <h2
                  className="text-4xl md:text-5xl font-bold text-white"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Design Services
                </h2>
                <p className="text-sm mt-1" style={{ color: "#D4881C" }}>
                  3D Modeling, CAD &amp; Consultation
                </p>
              </div>
            </div>

            <p className="leading-relaxed mb-12 max-w-3xl" style={{ color: "#d1d5db" }}>
              Do not have a 3D model or design file? No problem. Our design team can take
              your idea from concept to a print-ready file. We specialize in creating
              functional parts, artistic models, and production-ready designs optimized for
              3D printing and laser engraving.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {designServices.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-2xl p-6 group transition-colors"
                  style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(212,136,28,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(212,136,28,0.1)" }}
                  >
                    <service.icon className="w-6 h-6" style={{ color: "#D4881C" }} />
                  </div>
                  <h3
                    className="text-xl font-bold text-white mb-3"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {service.title}
                  </h3>
                  <p className="leading-relaxed text-sm" style={{ color: "#9ca3af" }}>
                    {service.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-lg transition-all duration-300 text-lg"
                style={{
                  backgroundColor: "#D4881C",
                  color: "#000",
                  boxShadow: "0 0 20px rgba(212,136,28,0.3)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E8A83E"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#D4881C"; }}
              >
                Request Design Service
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ====================================================
          FAQ SECTION
          ==================================================== */}
      <section className="py-24 px-6" style={{ backgroundColor: "#000" }}>
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <HelpCircle className="w-10 h-10 mx-auto mb-4" style={{ color: "#D4881C" }} />
              <h2
                className="text-4xl font-bold gold-gradient-text mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Frequently Asked Questions
              </h2>
              <p style={{ color: "#9ca3af" }}>
                Got questions? We have answers. If you do not find what you are looking for,
                feel free to{" "}
                <Link
                  href="/contact"
                  className="underline"
                  style={{ color: "#D4881C" }}
                >
                  contact us
                </Link>.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <FAQItem
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFAQ === index}
                    onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ====================================================
          BOTTOM CTA
          ==================================================== */}
      <section
        className="py-20 px-6 relative"
        style={{
          background: "linear-gradient(135deg, #B06E0F 0%, #D4881C 40%, #E8A83E 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--font-heading)", color: "#000" }}
          >
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-lg" style={{ color: "rgba(0,0,0,0.7)" }}>
            Tell us about your project and get a free quote within 24 hours.
          </p>
          <Link
            href="/quote"
            className="inline-flex items-center gap-2 px-10 py-4 font-bold rounded-lg transition-all duration-300 shadow-xl text-lg"
            style={{ backgroundColor: "#000", color: "#D4881C" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#111"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#000"; }}
          >
            Request a Free Quote
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
