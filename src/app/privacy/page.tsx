"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Shield, Mail } from "lucide-react";

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
   Section Component
   ========================================================== */
function PolicySection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatedSection>
      <div id={id} className="scroll-mt-24 mb-12">
        <div className="flex items-baseline gap-3 mb-4">
          <span
            className="text-sm font-bold px-2.5 py-1 rounded-md flex-shrink-0"
            style={{ backgroundColor: "rgba(212,136,28,0.1)", color: "#D4881C" }}
          >
            {number}
          </span>
          <h2
            className="text-2xl md:text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {title}
          </h2>
        </div>
        <div
          className="space-y-4 text-sm leading-relaxed pl-0 md:pl-12"
          style={{ color: "#d1d5db" }}
        >
          {children}
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ==========================================================
   PRIVACY POLICY PAGE
   ========================================================== */
export default function PrivacyPolicyPage() {
  const lastUpdated = "February 9, 2025";

  const sections = [
    { id: "information-we-collect", title: "Information We Collect" },
    { id: "how-we-use-information", title: "How We Use Your Information" },
    { id: "payment-processing", title: "Payment Processing" },
    { id: "file-uploads", title: "File Uploads" },
    { id: "cookies", title: "Cookies and Tracking Technologies" },
    { id: "data-sharing", title: "Data Sharing and Third Parties" },
    { id: "data-retention", title: "Data Retention" },
    { id: "data-security", title: "Data Security" },
    { id: "your-rights", title: "Your Rights" },
    { id: "childrens-privacy", title: "Children's Privacy" },
    { id: "changes", title: "Changes to This Policy" },
    { id: "contact", title: "Contact Us" },
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

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "rgba(212,136,28,0.1)" }}
            >
              <Shield className="w-8 h-8" style={{ color: "#D4881C" }} />
            </div>
            <p
              className="uppercase tracking-[0.3em] text-sm font-medium mb-4"
              style={{ color: "#D4881C" }}
            >
              Your Privacy Matters
            </p>
            <h1
              className="text-5xl md:text-7xl font-bold gold-gradient-text mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Privacy Policy
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#9ca3af" }}>
              423D Built is committed to protecting your personal information.
              This policy explains how we collect, use, and safeguard your data.
            </p>
            <p className="text-sm mt-4" style={{ color: "#6b7280" }}>
              Last updated: {lastUpdated}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ====================================================
          TABLE OF CONTENTS
          ==================================================== */}
      <section className="py-12 px-6" style={{ backgroundColor: "#111" }}>
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div
              className="rounded-2xl p-8"
              style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
            >
              <h2
                className="text-xl font-bold text-white mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Table of Contents
              </h2>
              <nav>
                <ol className="grid md:grid-cols-2 gap-2">
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="flex items-center gap-2 text-sm py-1 transition-colors hover:underline"
                        style={{ color: "#9ca3af" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#D4881C";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#9ca3af";
                        }}
                      >
                        <span style={{ color: "#D4881C" }}>{index + 1}.</span>
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ====================================================
          POLICY CONTENT
          ==================================================== */}
      <section className="py-12 pb-24 px-6" style={{ backgroundColor: "#111" }}>
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <AnimatedSection>
            <div className="mb-12">
              <p className="leading-relaxed" style={{ color: "#d1d5db" }}>
                423D Built (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website{" "}
                <span style={{ color: "#D4881C" }}>423dbuilt.com</span> and provides 3D printing,
                laser engraving, and related manufacturing services. This Privacy Policy describes
                how we collect, use, disclose, and protect the personal information of visitors to
                our website and customers who use our services. By accessing our website or using
                our services, you agree to the practices described in this policy.
              </p>
            </div>
          </AnimatedSection>

          {/* Section 1 */}
          <PolicySection id="information-we-collect" number="01" title="Information We Collect">
            <p>We collect the following types of personal information when you interact with our website and services:</p>

            <h3 className="text-white font-semibold text-base mt-6 mb-2">Information You Provide Directly</h3>
            <ul className="list-none space-y-2">
              {[
                "Name (first and last) when you place an order, request a quote, or create an account.",
                "Email address for order confirmations, shipping updates, and communication about your projects.",
                "Phone number if you provide it for project communication or order-related inquiries.",
                "Shipping and billing address when you purchase products for delivery.",
                "Project details and messages you send through our contact form, quote request form, or inquiry system.",
                "Files you upload, including 3D model files (STL, OBJ, 3MF, etc.) and reference images submitted for quotes or custom work.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: "#D4881C" }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h3 className="text-white font-semibold text-base mt-6 mb-2">Information Collected Automatically</h3>
            <ul className="list-none space-y-2">
              {[
                "Device information such as browser type, operating system, and screen resolution.",
                "IP address and approximate geographic location.",
                "Pages visited, time spent on pages, and navigation patterns on our website.",
                "Referring website or search terms that led you to our site.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: "#D4881C" }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </PolicySection>

          {/* Section 2 */}
          <PolicySection id="how-we-use-information" number="02" title="How We Use Your Information">
            <p>We use your personal information for the following purposes:</p>
            <ul className="list-none space-y-2">
              {[
                "To process and fulfill your orders, including printing, engraving, packaging, and shipping.",
                "To communicate with you about your orders, quotes, custom projects, and inquiries.",
                "To send order confirmations, shipping notifications, and delivery updates.",
                "To provide customer support and respond to your questions or concerns.",
                "To process payments securely through our payment processor.",
                "To improve our website, products, and services based on usage patterns and feedback.",
                "To comply with legal obligations, resolve disputes, and enforce our agreements.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: "#D4881C" }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              We do not use your personal information for automated decision-making or profiling.
            </p>
          </PolicySection>

          {/* Section 3 */}
          <PolicySection id="payment-processing" number="03" title="Payment Processing">
            <p>
              We use <strong className="text-white">Stripe</strong> as our third-party payment processor.
              When you make a purchase, your payment information (credit card number, expiration date,
              and CVV) is transmitted directly to Stripe through their secure, PCI-compliant platform.
            </p>
            <p>
              <strong className="text-white">We do not store, process, or have access to your full
              credit card details.</strong> Stripe may retain certain transaction information in
              accordance with their own privacy policy, which you can review at{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline transition-colors"
                style={{ color: "#D4881C" }}
              >
                stripe.com/privacy
              </a>.
            </p>
            <p>
              We receive only a confirmation of payment success or failure, along with a truncated
              card reference (e.g., the last four digits) for order identification purposes.
            </p>
          </PolicySection>

          {/* Section 4 */}
          <PolicySection id="file-uploads" number="04" title="File Uploads">
            <p>
              When you submit a quote request or custom project inquiry, you may upload files such
              as 3D model files (STL, OBJ, 3MF, and similar formats) and reference images. These
              files are stored securely and are used solely for the purpose of evaluating,
              quoting, and fulfilling your requested project.
            </p>
            <p>
              We do not share your uploaded files with third parties, use them for marketing purposes,
              or claim any ownership rights over your designs. Uploaded files associated with
              completed or declined projects may be retained for a reasonable period to facilitate
              reorders or follow-up inquiries, after which they may be deleted. You may request
              deletion of your uploaded files at any time by contacting us.
            </p>
          </PolicySection>

          {/* Section 5 */}
          <PolicySection id="cookies" number="05" title="Cookies and Tracking Technologies">
            <p>Our website uses the following cookies and similar technologies:</p>

            <h3 className="text-white font-semibold text-base mt-6 mb-2">Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function properly. They include session
              cookies used for authentication (keeping you logged in) and shopping cart functionality.
              These cookies cannot be disabled without impairing the core functionality of the site.
            </p>

            <h3 className="text-white font-semibold text-base mt-6 mb-2">Analytics Cookies</h3>
            <p>
              We may use Google Analytics or similar analytics services to understand how visitors
              interact with our website. These tools collect information such as pages visited,
              time spent on the site, and general geographic location. This data is aggregated and
              anonymized where possible. You can opt out of Google Analytics by installing the{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="underline transition-colors"
                style={{ color: "#D4881C" }}
              >
                Google Analytics Opt-out Browser Add-on
              </a>.
            </p>

            <p className="mt-4">
              Most web browsers allow you to control cookies through their settings. Please note
              that disabling certain cookies may affect the functionality of our website.
            </p>
          </PolicySection>

          {/* Section 6 */}
          <PolicySection id="data-sharing" number="06" title="Data Sharing and Third Parties">
            <p>
              <strong className="text-white">We do not sell, rent, or trade your personal information
              to third parties for their marketing purposes.</strong>
            </p>
            <p>We may share your information only in the following limited circumstances:</p>
            <ul className="list-none space-y-2">
              {[
                "Payment Processing: With Stripe to process your payments securely.",
                "Shipping Carriers: With shipping carriers (e.g., USPS, UPS, FedEx) to deliver your orders. This includes your name, shipping address, and phone number if required for delivery.",
                "Analytics Providers: With analytics services (e.g., Google Analytics) in aggregated or anonymized form to help us understand website usage.",
                "Legal Requirements: If required by law, subpoena, court order, or government request, or to protect our rights, property, or safety, or the rights, property, or safety of others.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: "#D4881C" }}
                  />
                  <span>
                    <strong className="text-white">{item.split(":")[0]}:</strong>
                    {item.substring(item.indexOf(":") + 1)}
                  </span>
                </li>
              ))}
            </ul>
          </PolicySection>

          {/* Section 7 */}
          <PolicySection id="data-retention" number="07" title="Data Retention">
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes
              described in this policy, including:
            </p>
            <ul className="list-none space-y-2">
              {[
                "Order and transaction records are retained for at least seven (7) years to comply with tax and accounting obligations.",
                "Account information is retained as long as your account remains active. You may request account deletion at any time.",
                "Quote and inquiry records are retained for up to two (2) years to facilitate follow-up orders and customer service.",
                "Uploaded files associated with completed projects may be retained for up to one (1) year unless you request earlier deletion.",
                "Analytics data is retained in accordance with our analytics provider's data retention settings.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: "#D4881C" }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </PolicySection>

          {/* Section 8 */}
          <PolicySection id="data-security" number="08" title="Data Security">
            <p>
              We take reasonable measures to protect your personal information from unauthorized
              access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-none space-y-2">
              {[
                "Encryption of data in transit using SSL/TLS (HTTPS) across our entire website.",
                "Secure, encrypted payment processing through Stripe's PCI DSS-compliant infrastructure.",
                "Access controls limiting who within our organization can access personal data.",
                "Regular review of our data collection, storage, and processing practices.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: "#D4881C" }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              While we strive to protect your personal information, no method of transmission over
              the Internet or method of electronic storage is 100% secure. We cannot guarantee
              absolute security.
            </p>
          </PolicySection>

          {/* Section 9 */}
          <PolicySection id="your-rights" number="09" title="Your Rights">
            <p>
              Depending on your location, you may have certain rights regarding your personal
              information, including:
            </p>
            <ul className="list-none space-y-2">
              {[
                "The right to access the personal information we hold about you.",
                "The right to request correction of inaccurate or incomplete personal information.",
                "The right to request deletion of your personal information, subject to certain legal exceptions.",
                "The right to opt out of marketing communications at any time.",
                "The right to request a copy of your personal data in a portable format.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: "#D4881C" }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              To exercise any of these rights, please contact us using the information provided
              in the Contact Us section below. We will respond to your request within a
              reasonable timeframe, and no later than required by applicable law.
            </p>
          </PolicySection>

          {/* Section 10 */}
          <PolicySection id="childrens-privacy" number="10" title="Children's Privacy">
            <p>
              Our website and services are not directed to individuals under the age of 13. We do
              not knowingly collect personal information from children under 13. If we become aware
              that we have inadvertently collected personal information from a child under 13, we
              will take steps to delete that information promptly. If you believe that a child under
              13 has provided us with personal information, please contact us immediately.
            </p>
          </PolicySection>

          {/* Section 11 */}
          <PolicySection id="changes" number="11" title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our
              practices, technologies, legal requirements, or other factors. When we make material
              changes, we will update the &quot;Last updated&quot; date at the top of this page. We
              encourage you to review this policy periodically to stay informed about how we are
              protecting your information.
            </p>
            <p>
              Your continued use of our website and services after any changes to this policy
              constitutes your acceptance of the updated terms.
            </p>
          </PolicySection>

          {/* Section 12 */}
          <PolicySection id="contact" number="12" title="Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our
              data practices, please contact us:
            </p>
            <div
              className="rounded-2xl p-6 mt-4"
              style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
            >
              <p className="text-white font-semibold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                423D Built
              </p>
              <p>Bristol, Tennessee 37620</p>
              <div className="flex items-center gap-2 mt-3">
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: "#D4881C" }} />
                <Link
                  href="/contact"
                  className="underline transition-colors"
                  style={{ color: "#D4881C" }}
                >
                  Contact Us Online
                </Link>
              </div>
            </div>
          </PolicySection>

          {/* Related Links */}
          <AnimatedSection>
            <div
              className="rounded-2xl p-8 mt-8 text-center"
              style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
            >
              <p className="text-sm mb-3" style={{ color: "#9ca3af" }}>
                See also our
              </p>
              <Link
                href="/terms"
                className="inline-flex items-center gap-2 font-semibold text-lg transition-colors underline"
                style={{ color: "#D4881C" }}
              >
                Terms of Service
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
