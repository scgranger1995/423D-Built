import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "@/styles/globals.css";
import { CartProvider } from "@/hooks/useCart";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/* ------------------------------------------------------------------ */
/*  Google Fonts                                                       */
/* ------------------------------------------------------------------ */

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://423dbuilt.com"
  ),
  title: {
    default: "423D Built | 3D Printing & Laser Engraving | Bristol, TN",
    template: "%s | 423D Built",
  },
  description:
    "Professional 3D printing and laser engraving services in Bristol, Tennessee. Custom designs, prototyping, personalized gifts, and more. Handcrafted in the Heart of Appalachia.",
  keywords: [
    "3D printing",
    "laser engraving",
    "custom manufacturing",
    "Bristol TN",
    "Tennessee",
    "custom 3D prints",
    "prototyping",
    "personalized gifts",
    "laser cutting",
    "CAD design",
    "Tri-Cities",
    "Appalachia",
    "423D Built",
  ],
  authors: [{ name: "423D Built" }],
  creator: "423D Built",
  openGraph: {
    title: "423D Built | 3D Printing & Laser Engraving | Bristol, TN",
    description:
      "Professional 3D printing and laser engraving services in Bristol, Tennessee. Custom designs, prototyping, and personalized creations.",
    url: "/",
    siteName: "423D Built",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "423D Built | 3D Printing & Laser Engraving",
    description:
      "Professional 3D printing and laser engraving services in Bristol, Tennessee.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/* ------------------------------------------------------------------ */
/*  Root Layout                                                        */
/* ------------------------------------------------------------------ */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable} scroll-smooth`}>
      <body
        className="min-h-screen flex flex-col antialiased"
        style={{ backgroundColor: "#111111", color: "#F5F5F5" }}
      >
        <CartProvider>
          <Header />
          {/* Push main content below the fixed header */}
          <main className="flex-1 pt-[68px]">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
