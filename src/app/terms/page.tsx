"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { FileText, Mail } from "lucide-react";

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
function TermsSection({
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
   TERMS OF SERVICE PAGE
   ========================================================== */
export default function TermsOfServicePage() {
  const lastUpdated = "February 9, 2025";

  const sections = [
    { id: "acceptance", title: "Acceptance of Terms" },
    { id: "services", title: "Description of Services" },
    { id: "orders-and-pricing", title: "Orders and Pricing" },
    { id: "custom-orders", title: "Custom Orders and Quotes" },
    { id: "intellectual-property", title: "Intellectual Property" },
    { id: "file-uploads", title: "File Uploads and Designs" },
    { id: "payment", title: "Payment Terms" },
    { id: "shipping", title: "Shipping and Delivery" },
    { id: "returns-refunds", title: "Returns and Refunds" },
    { id: "limitation-of-liability", title: "Limitation of Liability" },
    { id: "disclaimer-of-warranties", title: "Disclaimer of Warranties" },
    { id: "indemnification", title: "Indemnification" },
    { id: "governing-law", title: "Governing Law" },
    { id: "changes", title: "Changes to These Terms" },
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
              <FileText className="w-8 h-8" style={{ color: "#D4881C" }} />
            </div>
            <p
              className="uppercase tracking-[0.3em] text-sm font-medium mb-4"
              style={{ color: "#D4881C" }}
            >
              Legal Agreement
            </p>
            <h1
              className="text-5xl md:text-7xl font-bold gold-gradient-text mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Terms of Service
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#9ca3af" }}>
              Please read these terms carefully before using our website or placing an order.
              By using our services, you agree to be bound by these terms.
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
          TERMS CONTENT
          ==================================================== */}
      <section className="py-12 pb-24 px-6" style={{ backgroundColor: "#111" }}>
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <AnimatedSection>
            <div className="mb-12">
              <p className="leading-relaxed" style={{ color: "#d1d5db" }}>
                These Terms of Service (&quot;Terms&quot;) govern your access to and use of the
                website, products, and services provided by 423D Built (&quot;we,&quot;
                &quot;us,&quot; or &quot;our&quot;), a 3D printing and laser engraving business
                located in Bristol, Tennessee. By placing an order, submitting a quote request,
                or otherwise using our website at{" "}
                <span style={{ color: "#D4881C" }}>423dbuilt.com</span>, you agree to be bound
                by these Terms. If you do not agree with any part of these Terms, you should
                not use our website or services.
              </p>
            </div>
          </AnimatedSection>

          {/* Section 1 */}
          <TermsSection id="acceptance" number="01" title="Acceptance of Terms">
            <p>
              By accessing or using our website, placing an order, requesting a quote, uploading
              files, or otherwise engaging with our services, you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service and our{" "}
              <Link href="/privacy" className="underline" style={{ color: "#D4881C" }}>
                Privacy Policy
              </Link>
              , which is incorporated herein by reference.
            </p>
            <p>
              You represent that you are at least 18 years of age or the age of majority in your
              jurisdiction, and that you have the legal authority to enter into these Terms. If you
              are placing an order on behalf of a business or organization, you represent that you
              have the authority to bind that entity to these Terms.
            </p>
          </TermsSection>

          {/* Section 2 */}
          <TermsSection id="services" number="02" title="Description of Services">
            <p>423D Built provides the following products and services:</p>
            <ul className="list-none space-y-2">
              {[
                "3D Printing: We produce physical objects from digital 3D models using various materials including PLA, PETG, ABS, ASA, TPU, and other filament-based materials through Fused Deposition Modeling (FDM) technology.",
                "Laser Engraving: We engrave designs, text, logos, and images onto a variety of materials including wood, acrylic, leather, glass, coated metals, and other compatible substrates.",
                "Custom Design and Manufacturing: We accept custom orders based on your specifications, reference images, or 3D model files. Custom projects are quoted individually based on complexity, materials, and time required.",
                "Ready-Made Products: We sell pre-designed 3D printed items and laser engraved products through our online shop.",
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
            <p className="mt-4">
              We reserve the right to refuse any order or service request at our sole discretion,
              including but not limited to requests that we deem impractical, unsafe, or in
              violation of applicable law.
            </p>
          </TermsSection>

          {/* Section 3 */}
          <TermsSection id="orders-and-pricing" number="03" title="Orders and Pricing">
            <p>
              All prices listed on our website are in United States Dollars (USD) and are subject
              to change without prior notice. Prices do not include shipping, handling, or
              applicable taxes unless otherwise stated.
            </p>
            <p>
              By placing an order through our website, you are making an offer to purchase the
              selected products or services. We reserve the right to accept or decline any order.
              An order is not considered accepted until we send you an order confirmation.
            </p>
            <p>
              We make every effort to ensure that product descriptions, images, and pricing on
              our website are accurate. However, due to the nature of 3D printing and laser
              engraving, slight variations in color, texture, dimensions, and finish may occur
              between the product displayed on screen and the final physical product. Such
              variations are inherent to the manufacturing process and do not constitute a defect.
            </p>
            <p>
              In the event of a pricing error, we reserve the right to cancel any orders placed
              at the incorrect price and will notify you promptly, offering you the option to
              proceed at the correct price or receive a full refund.
            </p>
          </TermsSection>

          {/* Section 4 */}
          <TermsSection id="custom-orders" number="04" title="Custom Orders and Quotes">
            <p>
              Custom orders are initiated through our quote request system or direct inquiry. The
              custom order process typically works as follows:
            </p>
            <ol className="list-none space-y-3 mt-4">
              {[
                "You submit a quote request with project details, specifications, and any relevant files or reference images.",
                "We review your request and provide a quote including estimated pricing, materials, timeline, and any relevant notes.",
                "Upon your approval of the quote, we will request payment (in full or a deposit, depending on the project) before beginning production.",
                "We manufacture your item and provide updates as needed. Once complete, we ship the finished product or arrange for pickup.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="text-sm font-bold flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(212,136,28,0.1)", color: "#D4881C" }}
                  >
                    {i + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4">
              Quotes are valid for thirty (30) days from the date of issuance unless otherwise
              stated. Custom order timelines are estimates and may vary depending on project
              complexity, material availability, and current workload. We will communicate any
              significant delays as promptly as possible.
            </p>
          </TermsSection>

          {/* Section 5 */}
          <TermsSection id="intellectual-property" number="05" title="Intellectual Property">
            <h3 className="text-white font-semibold text-base mt-2 mb-2">Our Intellectual Property</h3>
            <p>
              All content on our website, including but not limited to text, graphics, logos,
              images, product designs, and software, is the property of 423D Built or its
              licensors and is protected by United States and international copyright, trademark,
              and other intellectual property laws. You may not reproduce, distribute, modify, or
              create derivative works of our content without our prior written consent.
            </p>

            <h3 className="text-white font-semibold text-base mt-6 mb-2">Your Intellectual Property</h3>
            <p>
              You retain all ownership rights to any designs, 3D models, images, or other
              intellectual property that you submit to us for custom manufacturing. By submitting
              files or designs to us, you grant us a limited, non-exclusive license to use those
              materials solely for the purpose of fulfilling your order. We will not use your
              designs for any other purpose without your explicit written permission.
            </p>

            <h3 className="text-white font-semibold text-base mt-6 mb-2">Your Representations</h3>
            <p>
              By submitting any design, file, image, or other content to us for production, you
              represent and warrant that:
            </p>
            <ul className="list-none space-y-2 mt-2">
              {[
                "You own the rights to the design or have obtained all necessary permissions, licenses, or authorizations from the rights holder to have it manufactured.",
                "The design does not infringe upon any copyright, trademark, patent, trade secret, or other intellectual property right of any third party.",
                "The design does not contain any content that is unlawful, defamatory, obscene, or otherwise objectionable.",
                "The manufactured product will not be used for any illegal purpose.",
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
              We reserve the right to refuse any order if we reasonably believe that the design
              infringes upon the intellectual property rights of a third party or violates
              applicable law. You agree to indemnify and hold us harmless from any claims arising
              from intellectual property infringement related to designs you submit.
            </p>
          </TermsSection>

          {/* Section 6 */}
          <TermsSection id="file-uploads" number="06" title="File Uploads and Designs">
            <p>
              When submitting files for custom manufacturing (3D model files, reference images,
              vector files, etc.), you are responsible for ensuring that:
            </p>
            <ul className="list-none space-y-2">
              {[
                "Files are in a compatible format as specified on our website or in communication with our team.",
                "3D model files are manifold (watertight), properly scaled, and suitable for the intended manufacturing process.",
                "Reference images and design specifications are clear and sufficiently detailed.",
                "Files do not contain malicious code, viruses, or other harmful content.",
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
              We will make reasonable efforts to identify and communicate any issues with
              submitted files before production begins. However, we are not responsible for
              defects in the final product that result from errors or deficiencies in the files
              you provide. If we need to modify your files to make them manufacturable, we will
              seek your approval before proceeding.
            </p>
          </TermsSection>

          {/* Section 7 */}
          <TermsSection id="payment" number="07" title="Payment Terms">
            <p>
              We accept payment through Square, which supports major credit cards, debit cards,
              and other payment methods as available through the Square platform. All payments
              are processed securely through Square&apos;s PCI DSS-compliant infrastructure.
            </p>
            <p>
              For standard shop purchases, full payment is required at the time of checkout.
              For custom orders, payment terms will be specified in the quote and may include:
            </p>
            <ul className="list-none space-y-2">
              {[
                "Full payment upfront before production begins.",
                "A deposit (typically 50%) before production, with the remaining balance due before shipping.",
                "Other arrangements as mutually agreed upon for larger or ongoing projects.",
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
              All sales are in United States Dollars (USD). You are responsible for any applicable
              sales tax, which will be calculated and displayed at checkout where required by law.
            </p>
          </TermsSection>

          {/* Section 8 */}
          <TermsSection id="shipping" number="08" title="Shipping and Delivery">
            <p>
              We currently ship to addresses within the United States. Shipping rates are
              calculated at checkout based on package dimensions, weight, and destination.
            </p>
            <p>
              <strong className="text-white">Processing Time:</strong> Orders are typically
              processed and shipped within 3 to 7 business days. Custom orders may require
              additional production time as specified in the quote. We will provide tracking
              information once your order has shipped.
            </p>
            <p>
              <strong className="text-white">Shipping Carriers:</strong> We ship via USPS, UPS,
              or FedEx depending on the size, weight, and destination of the package. The choice
              of carrier is at our discretion unless a specific carrier is requested and agreed
              upon.
            </p>
            <p>
              <strong className="text-white">Risk of Loss:</strong> Title and risk of loss for
              all products pass to you upon delivery to the shipping carrier. While we take great
              care in packaging, we are not responsible for damage or loss that occurs during
              transit. We recommend purchasing shipping insurance for high-value orders. If your
              package arrives damaged, please contact us within 48 hours with photographs of the
              damage so we can assist with a carrier claim.
            </p>
            <p>
              <strong className="text-white">Delivery Estimates:</strong> Delivery timeframes
              provided by carriers are estimates and not guarantees. We are not responsible for
              delays caused by carrier issues, weather, customs, or other factors beyond our
              control.
            </p>
          </TermsSection>

          {/* Section 9 */}
          <TermsSection id="returns-refunds" number="09" title="Returns and Refunds">
            <h3 className="text-white font-semibold text-base mt-2 mb-2">Ready-Made Products</h3>
            <p>
              For ready-made products purchased from our online shop, you may request a return
              within fourteen (14) days of delivery if the product is unused, in its original
              condition, and in its original packaging. To initiate a return, please contact us
              with your order number and reason for return. Return shipping costs are the
              responsibility of the customer unless the return is due to a defect or error on our
              part.
            </p>

            <h3 className="text-white font-semibold text-base mt-6 mb-2">Custom Orders</h3>
            <p>
              Due to the personalized and made-to-order nature of custom products,{" "}
              <strong className="text-white">
                custom orders are generally non-refundable and non-returnable.
              </strong>{" "}
              This includes any item manufactured to your specific design, dimensions, color,
              material choice, or personalization.
            </p>
            <p>
              However, if a custom order arrives with a manufacturing defect (e.g., significant
              structural failure, wrong material used, or substantial deviation from the approved
              specifications), please contact us within seven (7) days of delivery with
              photographs of the issue. We will evaluate the claim and, at our discretion, offer
              one of the following remedies:
            </p>
            <ul className="list-none space-y-2">
              {[
                "Remanufacture and reship the item at no additional cost.",
                "Issue a partial or full refund.",
                "Provide a store credit for the order amount.",
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

            <h3 className="text-white font-semibold text-base mt-6 mb-2">Refund Processing</h3>
            <p>
              Approved refunds will be processed to the original payment method within 7 to 10
              business days. Depending on your bank or credit card company, it may take an
              additional billing cycle for the refund to appear on your statement.
            </p>

            <h3 className="text-white font-semibold text-base mt-6 mb-2">Cancellations</h3>
            <p>
              Orders may be cancelled for a full refund if production has not yet begun. Once
              production has started, cancellation may not be possible, or may be subject to a
              restocking or materials fee. Please contact us as soon as possible if you need to
              cancel an order.
            </p>
          </TermsSection>

          {/* Section 10 */}
          <TermsSection id="limitation-of-liability" number="10" title="Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, 423D Built, its owners,
              employees, and agents shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, including but not limited to loss of profits,
              data, business opportunities, or goodwill, arising out of or in connection with
              your use of our website or services, regardless of the theory of liability.
            </p>
            <p>
              Our total aggregate liability for any claims arising out of or related to these
              Terms or your use of our services shall not exceed the total amount you paid to us
              for the specific product or service giving rise to the claim.
            </p>
            <p>
              We are not liable for any damages resulting from:
            </p>
            <ul className="list-none space-y-2">
              {[
                "Use of our products in a manner not intended or recommended.",
                "Modifications you make to our products after delivery.",
                "Failure of 3D printed or laser engraved items due to use in conditions beyond the material's specifications (e.g., excessive heat, moisture, UV exposure, or mechanical stress).",
                "Any personal injury or property damage arising from the use or misuse of our products.",
                "Errors, deficiencies, or inaccuracies in files, designs, or specifications you provide.",
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
          </TermsSection>

          {/* Section 11 */}
          <TermsSection id="disclaimer-of-warranties" number="11" title="Disclaimer of Warranties">
            <p>
              Our website and services are provided on an &quot;as is&quot; and &quot;as
              available&quot; basis. To the fullest extent permitted by law, we disclaim all
              warranties, express or implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>
            <p>
              We do not warrant that our website will be uninterrupted, error-free, or free of
              viruses or other harmful components. We do not warrant that our products will meet
              your specific requirements beyond the specifications agreed upon at the time of
              order.
            </p>
            <p>
              3D printed and laser engraved products are manufactured items with inherent
              material characteristics. While we strive for the highest quality, minor
              imperfections such as slight layer lines, color variations, or engraving depth
              differences are normal characteristics of the manufacturing processes and do not
              constitute defects.
            </p>
          </TermsSection>

          {/* Section 12 */}
          <TermsSection id="indemnification" number="12" title="Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless 423D Built, its owners,
              employees, and agents from and against any and all claims, damages, losses,
              liabilities, costs, and expenses (including reasonable attorney&apos;s fees) arising
              out of or related to:
            </p>
            <ul className="list-none space-y-2">
              {[
                "Your violation of these Terms.",
                "Your use or misuse of our products or services.",
                "Any design, file, or content you submit to us that infringes upon the intellectual property rights or other rights of a third party.",
                "Any violation of applicable law or regulation in connection with your use of our services.",
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
          </TermsSection>

          {/* Section 13 */}
          <TermsSection id="governing-law" number="13" title="Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              State of Tennessee, United States of America, without regard to its conflict of law
              provisions. Any disputes arising from or relating to these Terms or your use of
              our services shall be subject to the exclusive jurisdiction of the state and
              federal courts located in Sullivan County, Tennessee.
            </p>
            <p>
              If any provision of these Terms is found to be invalid or unenforceable by a court
              of competent jurisdiction, the remaining provisions shall remain in full force and
              effect. Our failure to enforce any right or provision of these Terms shall not
              constitute a waiver of that right or provision.
            </p>
          </TermsSection>

          {/* Section 14 */}
          <TermsSection id="changes" number="14" title="Changes to These Terms">
            <p>
              We reserve the right to modify or update these Terms of Service at any time at our
              sole discretion. When we make material changes, we will update the &quot;Last
              updated&quot; date at the top of this page. Changes are effective immediately upon
              posting to our website.
            </p>
            <p>
              Your continued use of our website or services after any modifications to these
              Terms constitutes your acceptance of the updated Terms. We encourage you to review
              these Terms periodically.
            </p>
          </TermsSection>

          {/* Section 15 */}
          <TermsSection id="contact" number="15" title="Contact Us">
            <p>
              If you have any questions about these Terms of Service or need to reach us regarding
              an order, return, or any other matter, please contact us:
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
          </TermsSection>

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
                href="/privacy"
                className="inline-flex items-center gap-2 font-semibold text-lg transition-colors underline"
                style={{ color: "#D4881C" }}
              >
                Privacy Policy
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
