"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  Heart,
  Users,
  Lightbulb,
  Award,
  MapPin,
  Printer,
  Zap,
  ArrowRight,
  Mountain,
  Star,
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
   Tennessee Tri-Star SVG
   ========================================================== */
function TriStar({ className = "", size = 60 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="48" stroke="#D4881C" strokeWidth="2" />
      <circle cx="50" cy="50" r="42" stroke="#D4881C" strokeWidth="1" opacity="0.3" />
      <g fill="#D4881C">
        <polygon points="50,18 53,27 62,27 55,33 57,42 50,37 43,42 45,33 38,27 47,27" />
        <polygon points="32,52 35,61 44,61 37,67 39,76 32,71 25,76 27,67 20,61 29,61" />
        <polygon points="68,52 71,61 80,61 73,67 75,76 68,71 61,76 63,67 56,61 65,61" />
      </g>
    </svg>
  );
}

/* ==========================================================
   ABOUT PAGE COMPONENT
   ========================================================== */
export default function AboutPage() {
  const values = [
    {
      icon: Award,
      title: "Quality Craftsmanship",
      description:
        "Every piece we create meets our exacting standards. We take pride in producing work that is not just functional, but beautiful. From layer adhesion to surface finish, quality is never an afterthought.",
    },
    {
      icon: Heart,
      title: "Customer First",
      description:
        "Your vision is our mission. We listen, collaborate, and iterate to make sure the final product exceeds your expectations. No project is too small, and no question is too basic.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "We are always exploring new materials, techniques, and technologies to push the boundaries of what is possible. If there is a better way to bring your idea to life, we will find it.",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "We are proud to be part of the Bristol and Tri-Cities community. From supporting local businesses to mentoring aspiring makers, we believe in lifting up the people around us.",
    },
  ];

  const equipment = [
    {
      category: "3D Printers",
      icon: Printer,
      items: [
        "FDM 3D Printer - 256x256x256mm build volume",
        "Enclosed build chamber for ABS/ASA",
        "Multi-material capability",
        "Auto bed leveling and filament runout detection",
      ],
    },
    {
      category: "Laser Equipment",
      icon: Zap,
      items: [
        "Diode Laser Engraver - 400x400mm work area",
        "High-precision stepper motors",
        "Air assist for clean cuts",
        "Rotary attachment for cylindrical objects",
      ],
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* ====================================================
          HERO SECTION
          ==================================================== */}
      <section className="relative pt-16 pb-24 overflow-hidden" style={{ backgroundColor: "#000" }}>
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
              Our Story
            </p>
            <h1
              className="text-5xl md:text-7xl font-bold gold-gradient-text mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              About 423D Built
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#9ca3af" }}>
              Bringing ideas to life through precision 3D printing and laser engraving,
              right here in the heart of Appalachia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ====================================================
          STORY SECTION
          ==================================================== */}
      <section className="py-24 px-6" style={{ backgroundColor: "#111" }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Image / Logo area */}
              <div className="flex justify-center">
                <motion.div
                  className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden"
                  style={{
                    border: "3px solid rgba(212,136,28,0.3)",
                    boxShadow: "0 0 60px rgba(212,136,28,0.15)",
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src="/images/logo.jpg"
                    alt="423D Built - Bristol, Tennessee"
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </div>

              {/* Story text */}
              <div>
                <h2
                  className="text-3xl md:text-4xl font-bold text-white mb-6"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Born in the Mountains,{" "}
                  <span style={{ color: "#D4881C" }}>Built for Tomorrow</span>
                </h2>
                <div className="space-y-4" style={{ color: "#d1d5db" }}>
                  <p className="leading-relaxed">
                    Based in Bristol, Tennessee, nestled in the beautiful Appalachian Mountains,
                    423D Built was founded with a simple mission: to make advanced manufacturing
                    accessible to everyone. We believe that great ideas deserve great execution,
                    whether it comes from a Fortune 500 company or a garage inventor.
                  </p>
                  <p className="leading-relaxed" style={{ color: "#9ca3af" }}>
                    The &quot;423&quot; in our name is a nod to our area code and the community
                    we are proud to call home. Here in the Tri-Cities region of Tennessee, there
                    is a rich tradition of craftsmanship, resourcefulness, and pride in
                    handmade work. We carry that tradition forward with modern tools.
                  </p>
                  <p className="leading-relaxed" style={{ color: "#9ca3af" }}>
                    From prototyping the next big product idea to creating personalized gifts
                    that carry real meaning, we put care and attention into every single piece
                    that leaves our workshop. Every layer printed and every line engraved
                    represents our commitment to quality.
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-8">
                  <MapPin className="w-5 h-5" style={{ color: "#D4881C" }} />
                  <span className="text-sm" style={{ color: "#9ca3af" }}>
                    Bristol, Tennessee 37620 &mdash; Heart of Appalachia
                  </span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ====================================================
          VALUES SECTION
          ==================================================== */}
      <section className="py-24 px-6" style={{ backgroundColor: "#000" }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-5xl font-bold gold-gradient-text mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Our Values
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: "#9ca3af" }}>
                These principles guide everything we do, from the materials we choose
                to how we treat every customer.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-2xl p-8 group transition-colors"
                  style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(212,136,28,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: "rgba(212,136,28,0.1)" }}
                  >
                    <value.icon className="w-7 h-7" style={{ color: "#D4881C" }} />
                  </div>
                  <h3
                    className="text-xl font-bold text-white mb-3"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {value.title}
                  </h3>
                  <p className="leading-relaxed text-sm" style={{ color: "#9ca3af" }}>
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ====================================================
          EQUIPMENT SECTION
          ==================================================== */}
      <section className="py-24 px-6" style={{ backgroundColor: "#111" }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-5xl font-bold gold-gradient-text mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Our Equipment
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: "#9ca3af" }}>
                We invest in reliable, high-quality equipment to ensure consistent results
                on every project.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {equipment.map((group, index) => (
                <motion.div
                  key={group.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="rounded-2xl p-8"
                  style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "rgba(212,136,28,0.1)" }}
                    >
                      <group.icon className="w-6 h-6" style={{ color: "#D4881C" }} />
                    </div>
                    <h3
                      className="text-2xl font-bold text-white"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {group.category}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: "#D4881C" }}
                        />
                        <span className="text-sm" style={{ color: "#d1d5db" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ====================================================
          LOCATION / MAP SECTION
          ==================================================== */}
      <section className="py-24 px-6" style={{ backgroundColor: "#000" }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <MapPin className="w-10 h-10 mx-auto mb-4" style={{ color: "#D4881C" }} />
              <h2
                className="text-4xl md:text-5xl font-bold gold-gradient-text mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Serving the Tri-Cities and Beyond
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: "#9ca3af" }}>
                Located in Bristol, Tennessee, we proudly serve the Tri-Cities area
                including Johnson City, Kingsport, and the surrounding Appalachian region.
                We also ship nationwide.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Map placeholder */}
              <div
                className="rounded-2xl overflow-hidden aspect-video lg:aspect-auto lg:min-h-[400px] relative"
                style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
              >
                {/* Google Maps embed placeholder */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Mountain className="w-16 h-16 mb-4" style={{ color: "rgba(212,136,28,0.3)" }} />
                  <p className="text-white font-semibold mb-1">Bristol, Tennessee</p>
                  <p className="text-sm" style={{ color: "#6b7280" }}>
                    Google Maps embed will appear here
                  </p>
                  <p className="text-xs mt-4 px-4 text-center" style={{ color: "#4b5563" }}>
                    Replace this with:{" "}
                    <code
                      className="px-2 py-1 rounded text-xs"
                      style={{ backgroundColor: "#2a2a2a", color: "#D4881C" }}
                    >
                      &lt;iframe src=&quot;https://maps.google.com/...&quot;&gt;
                    </code>
                  </p>
                </div>
              </div>

              {/* Location info */}
              <div className="space-y-6">
                <div
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                >
                  <h3
                    className="text-xl font-bold text-white mb-4"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Our Location
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#D4881C" }} />
                      <div>
                        <p className="text-white font-medium">Bristol, Tennessee 37620</p>
                        <p className="text-sm" style={{ color: "#6b7280" }}>
                          Serving the greater Tri-Cities area
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
                >
                  <h3
                    className="text-xl font-bold text-white mb-4"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Service Area
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Bristol, TN/VA",
                      "Johnson City, TN",
                      "Kingsport, TN",
                      "Abingdon, VA",
                      "Elizabethton, TN",
                      "Jonesborough, TN",
                      "Erwin, TN",
                      "Nationwide Shipping",
                    ].map((area) => (
                      <div key={area} className="flex items-center gap-2">
                        <Star className="w-3 h-3 flex-shrink-0" style={{ color: "#D4881C" }} />
                        <span className="text-sm" style={{ color: "#d1d5db" }}>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ====================================================
          TENNESSEE PRIDE SECTION
          ==================================================== */}
      <section
        className="py-24 px-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #B06E0F 0%, #D4881C 40%, #E8A83E 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <TriStar className="mx-auto mb-6" size={80} />
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-heading)", color: "#000" }}
          >
            Tennessee Proud
          </h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto" style={{ color: "rgba(0,0,0,0.7)" }}>
            The three stars of Tennessee represent the three grand divisions of our
            beautiful state. Here in the mountains of East Tennessee, we carry forward
            the Appalachian tradition of craftsmanship, ingenuity, and community.
            Every piece we create is infused with Tennessee pride.
          </p>
          <p
            className="text-xl font-semibold italic"
            style={{ fontFamily: "var(--font-heading)", color: "#000" }}
          >
            &quot;Handcrafted in the Heart of Appalachia&quot;
          </p>

          <div className="mt-10">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 px-10 py-4 font-bold rounded-lg transition-all duration-300 shadow-xl text-lg"
              style={{ backgroundColor: "#000", color: "#D4881C" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#111"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#000"; }}
            >
              Work With Us
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
