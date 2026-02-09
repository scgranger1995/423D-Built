import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for 423D Built. Learn how we collect, use, and protect your personal information when you use our 3D printing and laser engraving services in Bristol, Tennessee.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
