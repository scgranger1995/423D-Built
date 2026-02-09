"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Printer,
  Zap,
  PenTool,
  Star,
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  MapPin,
  Smile,
  Droplets,
  Shield,
  Sun,
  Thermometer,
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
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ==========================================================
   Animated Counter
   ========================================================== */
function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

/* ==========================================================
   Mountain SVG Background
   ========================================================== */
function MountainSVG() {
  return (
    <svg
      viewBox="0 0 1440 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute bottom-0 left-0 w-full"
      preserveAspectRatio="none"
    >
      {/* Far mountains */}
      <path
        d="M0 400 L0 280 L120 200 L240 260 L360 180 L480 240 L600 160 L720 220 L840 140 L960 200 L1080 120 L1200 190 L1320 150 L1440 210 L1440 400 Z"
        fill="#1a1a1a"
        opacity="0.6"
      />
      {/* Mid mountains - gold tint */}
      <path
        d="M0 400 L0 320 L180 240 L300 290 L420 220 L540 270 L660 200 L780 260 L900 190 L1020 250 L1140 180 L1260 230 L1380 200 L1440 240 L1440 400 Z"
        fill="#B06E0F"
        opacity="0.15"
      />
      {/* Near mountains */}
      <path
        d="M0 400 L0 340 L100 300 L200 330 L320 280 L440 320 L560 270 L680 310 L800 260 L920 300 L1040 270 L1160 310 L1280 280 L1440 320 L1440 400 Z"
        fill="#1a1a1a"
        opacity="0.9"
      />
    </svg>
  );
}

/* ==========================================================
   Tennessee Tri-Star SVG
   ========================================================== */
function TriStar({ className = "", size = 60 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3" />
      <polygon points="35,30 37,36 43,36 38,40 40,46 35,42 30,46 32,40 27,36 33,36" />
      <polygon points="65,30 67,36 73,36 68,40 70,46 65,42 60,46 62,40 57,36 63,36" />
      <polygon points="50,55 52,61 58,61 53,65 55,71 50,67 45,71 47,65 42,61 48,61" />
    </svg>
  );
}

/* ==========================================================
   Floating Geometric Shapes
   ========================================================== */
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Hexagon */}
      <motion.div
        className="absolute top-[15%] left-[10%] w-16 h-16 border-2 rotate-45"
        style={{ borderColor: "rgba(212,136,28,0.2)" }}
        animate={{
          y: [0, -20, 0],
          rotate: [45, 90, 45],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Circle */}
      <motion.div
        className="absolute top-[25%] right-[15%] w-20 h-20 rounded-full border-2"
        style={{ borderColor: "rgba(232,168,62,0.15)" }}
        animate={{
          y: [0, 15, 0],
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Triangle */}
      <motion.div
        className="absolute top-[40%] left-[20%]"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 180, 360],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40">
          <polygon
            points="20,4 36,36 4,36"
            fill="none"
            stroke="#D4881C"
            strokeWidth="1.5"
            opacity="0.3"
          />
        </svg>
      </motion.div>
      {/* Diamond */}
      <motion.div
        className="absolute bottom-[35%] right-[10%] w-12 h-12 border-2 rotate-45"
        style={{ borderColor: "rgba(176,110,15,0.2)" }}
        animate={{
          y: [0, 20, 0],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Small circle */}
      <motion.div
        className="absolute top-[60%] left-[5%] w-8 h-8 rounded-full border"
        style={{
          backgroundColor: "rgba(212,136,28,0.05)",
          borderColor: "rgba(212,136,28,0.1)",
        }}
        animate={{
          y: [0, -10, 0],
          x: [0, 5, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* 3D Cube wireframe */}
      <motion.div
        className="absolute top-[20%] left-[45%]"
        animate={{
          rotateY: [0, 360],
          rotateX: [0, 360],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ perspective: "200px" }}
      >
        <div
          className="w-14 h-14 border-2 relative"
          style={{
            borderColor: "rgba(212,136,28,0.2)",
            transformStyle: "preserve-3d",
          }}
        />
      </motion.div>
    </div>
  );
}

/* ==========================================================
   HOMEPAGE COMPONENT
   ========================================================== */
export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [testimonialIndex, setTestimonialIndex] = useState(0);

  /* ---------- Data ---------- */
  const services = [
    {
      icon: Printer,
      title: "3D Printing",
      description:
        "From rapid prototypes to custom parts, we bring your digital designs into the physical world with precision FDM printing in PLA, PETG, ABS, and ASA.",
      href: "/services#3d-printing",
    },
    {
      icon: Zap,
      title: "Laser Engraving",
      description:
        "Precision laser engraving and cutting on wood, acrylic, leather, glass, and more. Perfect for personalization, signage, and custom gifts.",
      href: "/services#laser-engraving",
    },
    {
      icon: PenTool,
      title: "Design Services",
      description:
        "Need a 3D model or design file? Our team handles CAD modeling, file repair, design consultation, and reverse engineering.",
      href: "/services#design-services",
    },
  ];

  const featuredProducts = [
    {
      name: "Custom Phone Stand",
      price: 24.99,
      image: "/images/logo.jpg",
      category: "3D Print",
    },
    {
      name: "Engraved Cutting Board",
      price: 49.99,
      image: "/images/logo.jpg",
      category: "Laser Engraved",
    },
    {
      name: "Mountain Keychain Set",
      price: 14.99,
      image: "/images/logo.jpg",
      category: "3D Print",
    },
    {
      name: "Custom Pet Portrait",
      price: 34.99,
      image: "/images/logo.jpg",
      category: "Laser Engraved",
    },
  ];

  const materials = [
    {
      name: "PLA",
      nickname: "The Everyday Hero",
      icon: Droplets,
      color: "from-green-500/20 to-green-700/10",
      border: "border-green-500/30",
      description:
        "Easy to print, eco-friendly, and great for prototypes and decorative items. Excellent surface finish with a wide range of colors available.",
      pros: ["Eco-friendly & biodegradable", "Great surface finish", "Easy to print", "Wide color range"],
      cons: ["Not heat resistant", "Not UV resistant", "Brittle under stress"],
      bestFor: "Prototypes, decorative items, display models, figurines",
    },
    {
      name: "PETG",
      nickname: "The All-Rounder",
      icon: Shield,
      color: "from-blue-500/20 to-blue-700/10",
      border: "border-blue-500/30",
      description:
        "Strong, flexible, and chemical resistant. Great for functional parts and outdoor use. Food-safe options available for kitchen applications.",
      pros: ["Strong & flexible", "Chemical resistant", "Food-safe options", "Good layer adhesion"],
      cons: ["Can string during printing", "Slightly harder to print than PLA"],
      bestFor: "Functional parts, outdoor use, food containers, mechanical components",
    },
    {
      name: "ABS",
      nickname: "The Tough One",
      icon: Thermometer,
      color: "from-red-500/20 to-red-700/10",
      border: "border-red-500/30",
      description:
        "Heat resistant, durable, and impact resistant. The go-to material for automotive parts, enclosures, and functional prototypes that need to withstand stress.",
      pros: ["Heat resistant", "Impact resistant", "Durable", "Smooth finish with acetone"],
      cons: ["Requires ventilation", "Warps without enclosure", "Not eco-friendly"],
      bestFor: "Automotive parts, enclosures, functional prototypes, tool handles",
    },
    {
      name: "ASA",
      nickname: "The Outdoor Champion",
      icon: Sun,
      color: "from-yellow-500/20 to-yellow-700/10",
      border: "border-yellow-500/30",
      description:
        "UV resistant and weatherproof, making it excellent for outdoor applications. Superior to ABS for anything exposed to sunlight. Maintains color and strength outdoors.",
      pros: ["UV resistant", "Weatherproof", "Color stable outdoors", "Excellent durability"],
      cons: ["Requires ventilation", "Higher print temperature", "More expensive"],
      bestFor: "Outdoor fixtures, garden items, automotive exterior, signage",
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      location: "Johnson City, TN",
      text: "423D Built brought my product prototype to life in just 3 days. The quality was outstanding and the communication was excellent throughout the process.",
      rating: 5,
    },
    {
      name: "Mike R.",
      location: "Bristol, VA",
      text: "Had custom engraved gifts made for my entire family. Everyone loved them! The attention to detail on the wood engraving was incredible.",
      rating: 5,
    },
    {
      name: "Jennifer L.",
      location: "Kingsport, TN",
      text: "As a small business owner, finding a reliable local 3D printing service was a game changer. 423D Built consistently delivers quality parts on time.",
      rating: 5,
    },
  ];

  const stats = [
    { value: 500, suffix: "+", label: "Projects Completed", icon: CheckCircle },
    { value: 100, suffix: "%", label: "Satisfaction", icon: Smile },
    { value: 24, suffix: "hr", label: "Quote Response", icon: Clock },
    { value: 423, suffix: "", label: "Bristol, TN Proud", icon: MapPin },
  ];

  /* ---------- Auto-rotate testimonials ---------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="relative overflow-hidden">
      {/* ====================================================
          HERO SECTION
          ==================================================== */}
      <section
        ref={heroRef}
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "calc(100vh - 68px)", backgroundColor: "#000" }}
      >
        {/* Parallax mountain background */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <MountainSVG />
        </motion.div>

        {/* Floating geometric shapes */}
        <FloatingShapes />

        {/* Radial glow behind text */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(212,136,28,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Hero Content */}
        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          style={{ opacity: heroOpacity }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 flex justify-center"
          >
            <div
              className="relative w-28 h-28 rounded-full overflow-hidden"
              style={{
                border: "2px solid rgba(212,136,28,0.4)",
                boxShadow: "0 0 30px rgba(212,136,28,0.2)",
              }}
            >
              <Image
                src="/images/logo.jpg"
                alt="423D Built Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-4 tracking-tight gold-gradient-text-animated"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            423D Built
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-xl md:text-3xl font-light mb-3 tracking-widest uppercase"
            style={{ color: "#E8A83E" }}
          >
            3D Print &amp; Design
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="text-base md:text-lg mb-10"
            style={{ color: "#9ca3af" }}
          >
            Handcrafted in Bristol, Tennessee &mdash; Heart of Appalachia
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/quote"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-lg transition-all duration-300 text-lg"
              style={{
                backgroundColor: "#D4881C",
                color: "#000",
                boxShadow: "0 0 20px rgba(212,136,28,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#E8A83E";
                e.currentTarget.style.boxShadow = "0 0 30px rgba(212,136,28,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#D4881C";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(212,136,28,0.3)";
              }}
            >
              Get a Free Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-lg transition-all duration-300 text-lg"
              style={{
                border: "2px solid #D4881C",
                color: "#D4881C",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(212,136,28,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Browse Shop
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div
            className="w-6 h-10 rounded-full flex items-start justify-center p-1"
            style={{ border: "2px solid rgba(212,136,28,0.4)" }}
          >
            <motion.div
              className="w-1.5 h-3 rounded-full"
              style={{ backgroundColor: "#D4881C" }}
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ====================================================
          SERVICES OVERVIEW SECTION
          ==================================================== */}
      <AnimatedSection className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4 gold-gradient-text"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              What We Do
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#9ca3af" }}>
              From concept to creation, we offer a full suite of manufacturing services
              right here in the Tri-Cities region.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Link href={service.href}>
                  <motion.div
                    className="group relative rounded-2xl p-8 h-full cursor-pointer overflow-hidden"
                    style={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                    }}
                    whileHover={{
                      y: -8,
                      boxShadow: "0 20px 40px rgba(212,136,28,0.15)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Glow effect on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(212,136,28,0.05) 0%, transparent 100%)",
                      }}
                    />

                    <div className="relative z-10">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-opacity-20 transition-colors duration-300"
                        style={{ backgroundColor: "rgba(212,136,28,0.1)" }}
                      >
                        <service.icon className="w-8 h-8" style={{ color: "#D4881C" }} />
                      </div>
                      <h3
                        className="text-2xl font-bold text-white mb-3"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {service.title}
                      </h3>
                      <p className="leading-relaxed mb-4" style={{ color: "#9ca3af" }}>
                        {service.description}
                      </p>
                      <span
                        className="inline-flex items-center gap-2 font-medium group-hover:gap-3 transition-all duration-300"
                        style={{ color: "#D4881C" }}
                      >
                        Learn More <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ====================================================
          FEATURED PRODUCTS SECTION
          ==================================================== */}
      <AnimatedSection className="py-24 px-6 relative">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "#000" }}
        />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4 gold-gradient-text"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Shop Our Creations
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#9ca3af" }}>
              Browse our collection of handcrafted 3D printed and laser engraved products,
              all made right here in Bristol, Tennessee.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div
                  className="group rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                  }}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: "#0f0f0f" }}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className="px-3 py-1 text-xs font-semibold rounded-full"
                        style={{ backgroundColor: "rgba(212,136,28,0.9)", color: "#000" }}
                      >
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold mb-4" style={{ color: "#D4881C" }}>
                      ${product.price.toFixed(2)}
                    </p>
                    <button
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300"
                      style={{
                        backgroundColor: "rgba(212,136,28,0.1)",
                        border: "1px solid rgba(212,136,28,0.3)",
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
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-lg font-medium transition-colors"
              style={{ color: "#D4881C" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#E8A83E"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#D4881C"; }}
            >
              View All Products <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* ====================================================
          MATERIALS SECTION
          ==================================================== */}
      <AnimatedSection className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4 gold-gradient-text"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Our Materials
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#9ca3af" }}>
              We work with a range of high-quality 3D printing filaments, each chosen for
              specific strengths. Let us help you pick the perfect material for your project.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {materials.map((material, index) => (
              <motion.div
                key={material.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div
                  className={`group rounded-2xl p-6 h-full ${material.border}`}
                  style={{ backgroundColor: "#1a1a1a" }}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 10px 30px rgba(212,136,28,0.1)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${material.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <material.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3
                        className="text-2xl font-bold text-white"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {material.name}
                      </h3>
                      <p className="text-sm font-medium italic" style={{ color: "#D4881C" }}>
                        {material.nickname}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-4" style={{ color: "#9ca3af" }}>
                    {material.description}
                  </p>

                  {/* Pros */}
                  <div className="mb-3">
                    <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: "#6b7280" }}>
                      Strengths
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {material.pros.map((pro) => (
                        <span
                          key={pro}
                          className="px-2.5 py-1 text-xs rounded-full"
                          style={{
                            backgroundColor: "rgba(34,197,94,0.1)",
                            color: "rgb(74,222,128)",
                            border: "1px solid rgba(34,197,94,0.2)",
                          }}
                        >
                          {pro}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cons */}
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: "#6b7280" }}>
                      Limitations
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {material.cons.map((con) => (
                        <span
                          key={con}
                          className="px-2.5 py-1 text-xs rounded-full"
                          style={{
                            backgroundColor: "rgba(239,68,68,0.1)",
                            color: "rgb(248,113,113)",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          {con}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Best For */}
                  <div className="pt-3" style={{ borderTop: "1px solid #2a2a2a" }}>
                    <p className="text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: "#6b7280" }}>
                      Best For
                    </p>
                    <p className="text-sm" style={{ color: "#E8A83E" }}>
                      {material.bestFor}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ====================================================
          TESTIMONIALS SECTION
          ==================================================== */}
      <AnimatedSection className="py-24 px-6 relative">
        <div className="absolute inset-0" style={{ backgroundColor: "#000" }} />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4 gold-gradient-text"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              What Our Customers Say
            </h2>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl p-8 md:p-12 text-center"
                style={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                }}
              >
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: testimonials[testimonialIndex].rating }).map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-6 h-6"
                        style={{ color: "#D4881C", fill: "#D4881C" }}
                      />
                    )
                  )}
                </div>

                {/* Quote */}
                <p className="text-lg md:text-xl leading-relaxed mb-8 italic" style={{ color: "#d1d5db" }}>
                  &ldquo;{testimonials[testimonialIndex].text}&rdquo;
                </p>

                {/* Author */}
                <div>
                  <p className="text-white font-semibold text-lg">
                    {testimonials[testimonialIndex].name}
                  </p>
                  <p className="text-sm" style={{ color: "#D4881C" }}>
                    {testimonials[testimonialIndex].location}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() =>
                  setTestimonialIndex(
                    (prev) => (prev - 1 + testimonials.length) % testimonials.length
                  )
                }
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ border: "1px solid rgba(212,136,28,0.3)", color: "#D4881C" }}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className="h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === testimonialIndex ? "32px" : "10px",
                      backgroundColor: i === testimonialIndex ? "#D4881C" : "#4b5563",
                    }}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() =>
                  setTestimonialIndex((prev) => (prev + 1) % testimonials.length)
                }
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ border: "1px solid rgba(212,136,28,0.3)", color: "#D4881C" }}
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ====================================================
          STATS SECTION
          ==================================================== */}
      <AnimatedSection className="py-20 px-6 relative">
        <div
          className="absolute inset-0"
          style={{ borderTop: "1px solid #2a2a2a", borderBottom: "1px solid #2a2a2a" }}
        />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: "#D4881C" }} />
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm" style={{ color: "#9ca3af" }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ====================================================
          CTA BANNER SECTION
          ==================================================== */}
      <AnimatedSection className="py-24 px-6 relative overflow-hidden">
        {/* Gold gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #B06E0F 0%, #D4881C 40%, #E8A83E 100%)",
            opacity: 0.92,
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <TriStar className="mx-auto mb-6 opacity-30" size={50} />
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-heading)", color: "#000" }}
          >
            Ready to Bring Your Ideas to Life?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: "rgba(0,0,0,0.7)" }}>
            Whether it is a custom prototype, personalized gift, or production run,
            we are here to make it happen. Get your free quote today.
          </p>
          <Link
            href="/quote"
            className="inline-flex items-center gap-2 px-10 py-4 font-bold rounded-lg transition-all duration-300 shadow-xl text-lg"
            style={{ backgroundColor: "#000", color: "#D4881C" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#111"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#000"; }}
          >
            Request a Quote
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </AnimatedSection>
    </div>
  );
}
