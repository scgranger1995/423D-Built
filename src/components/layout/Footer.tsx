"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Instagram, Facebook, Clock } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Tennessee Tri-Star SVG                                             */
/* ------------------------------------------------------------------ */

function TriStar({ className = "", size = 40 }: { className?: string; size?: number }) {
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
      <circle cx="50" cy="50" r="48" stroke="#D4881C" strokeWidth="2" fill="none" />
      <circle cx="50" cy="50" r="42" stroke="#D4881C" strokeWidth="1" fill="none" opacity="0.3" />
      {/* Three stars arranged in a triangle */}
      <g fill="#D4881C">
        {/* Top star */}
        <polygon points="50,18 53,27 62,27 55,33 57,42 50,37 43,42 45,33 38,27 47,27" />
        {/* Bottom-left star */}
        <polygon points="32,52 35,61 44,61 37,67 39,76 32,71 25,76 27,67 20,61 29,61" />
        {/* Bottom-right star */}
        <polygon points="68,52 71,61 80,61 73,67 75,76 68,71 61,76 63,67 56,61 65,61" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  TikTok icon (not in lucide-react)                                  */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/quote", label: "Get a Quote" },
];

const SERVICES = [
  { href: "/services#3d-printing", label: "3D Printing" },
  { href: "/services#laser-engraving", label: "Laser Engraving" },
  { href: "/services#custom-design", label: "Custom Design" },
  { href: "/services#prototyping", label: "Prototyping" },
  { href: "/services#bulk-orders", label: "Bulk Orders" },
];


/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

// Defaults used when DB has no content yet
const DEFAULTS = {
  contact_address: "Bristol, TN 37620",
  contact_phone: "",
  contact_email: "info@423dbuilt.com",
  contact_hours_weekday: "Mon - Fri: 9 AM - 6 PM",
  contact_hours_weekend: "Sat: 10 AM - 4 PM",
  contact_social_facebook: "https://facebook.com/423dbuilt",
  contact_social_instagram: "https://instagram.com/423dbuilt",
  contact_social_tiktok: "https://tiktok.com/@423dbuilt",
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [content, setContent] = useState<Record<string, string>>(DEFAULTS);

  useEffect(() => {
    fetch("/api/content?section=contact")
      .then((res) => res.json())
      .then((data) => {
        if (data.content && Object.keys(data.content).length > 0) {
          setContent((prev) => ({ ...prev, ...data.content }));
        }
      })
      .catch(() => {
        // Keep defaults on error
      });
  }, []);

  const address = content.contact_address || DEFAULTS.contact_address;
  const phone = content.contact_phone || DEFAULTS.contact_phone;
  const email = content.contact_email || DEFAULTS.contact_email;
  const hoursWeekday = content.contact_hours_weekday || DEFAULTS.contact_hours_weekday;
  const hoursWeekend = content.contact_hours_weekend || DEFAULTS.contact_hours_weekend;
  const socialFacebook = content.contact_social_facebook || DEFAULTS.contact_social_facebook;
  const socialInstagram = content.contact_social_instagram || DEFAULTS.contact_social_instagram;
  const socialTiktok = content.contact_social_tiktok || DEFAULTS.contact_social_tiktok;

  const socials = [
    { href: socialInstagram, label: "Instagram", Icon: Instagram },
    { href: socialFacebook, label: "Facebook", Icon: Facebook },
    { href: socialTiktok, label: "TikTok", Icon: TikTokIcon },
  ];

  // Format phone for tel: link
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneHref = `tel:+1${phoneDigits}`;

  return (
    <footer
      style={{
        backgroundColor: "#0a0a0a",
        borderTop: "1px solid rgba(212,136,28,0.15)",
      }}
    >
      {/* Gold accent line at top */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #D4881C 50%, transparent 100%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* ---- 4-column grid ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Column 1: About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="relative h-12 w-12 overflow-hidden rounded-full flex-shrink-0"
                style={{ border: "2px solid #D4881C" }}
              >
                <Image
                  src="/images/logo.jpg"
                  alt="423D Built Logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <span
                className="text-xl font-bold"
                style={{ color: "#D4881C", fontFamily: "var(--font-heading)" }}
              >
                423D Built
              </span>
            </div>

            <p className="text-sm leading-relaxed text-gray-400 mb-5">
              Bringing your ideas to life through precision 3D printing and
              laser engraving. We serve clients across Bristol, Tennessee and the
              greater Tri-Cities area with quality craftsmanship and
              Appalachian pride.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: "rgba(212,136,28,0.1)",
                    color: "#D4881C",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#D4881C";
                    e.currentTarget.style.color = "#000000";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(212,136,28,0.1)";
                    e.currentTarget.style.color = "#D4881C";
                  }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "#D4881C" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors duration-200 hover:text-[#E8A83E]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "#D4881C" }}
            >
              Services
            </h4>
            <ul className="space-y-2.5">
              {SERVICES.map((svc) => (
                <li key={svc.href}>
                  <Link
                    href={svc.href}
                    className="text-sm text-gray-400 transition-colors duration-200 hover:text-[#E8A83E]"
                  >
                    {svc.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "#D4881C" }}
            >
              Contact Us
            </h4>
            <ul className="space-y-3.5">
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin
                    size={16}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: "#D4881C" }}
                  />
                  <span className="text-sm text-gray-400">
                    {address}
                  </span>
                </li>
              )}
              {phone && (
                <li>
                  <a
                    href={phoneHref}
                    className="flex items-center gap-3 text-sm text-gray-400 transition-colors duration-200 hover:text-[#E8A83E]"
                  >
                    <Phone size={16} className="flex-shrink-0" style={{ color: "#D4881C" }} />
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 text-sm text-gray-400 transition-colors duration-200 hover:text-[#E8A83E]"
                  >
                    <Mail size={16} className="flex-shrink-0" style={{ color: "#D4881C" }} />
                    {email}
                  </a>
                </li>
              )}
              {(hoursWeekday || hoursWeekend) && (
                <li className="flex items-start gap-3">
                  <Clock
                    size={16}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: "#D4881C" }}
                  />
                  <div className="text-sm text-gray-400">
                    {hoursWeekday && <p>{hoursWeekday}</p>}
                    {hoursWeekend && <p>{hoursWeekend}</p>}
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ---- Divider with tri-star ---- */}
        <div className="flex items-center gap-4 mt-14 mb-8">
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(212,136,28,0.3) 100%)",
            }}
          />
          <TriStar size={36} />
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(212,136,28,0.3) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* ---- Bottom bar ---- */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-xs text-gray-500">
            &copy; {currentYear} 423D Built. All rights reserved.
          </p>

          <p
            className="text-xs italic"
            style={{ color: "rgba(212,136,28,0.6)", fontFamily: "var(--font-heading)" }}
          >
            Handcrafted in the Heart of Appalachia
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/privacy" className="transition-colors duration-200 hover:text-gray-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors duration-200 hover:text-gray-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
