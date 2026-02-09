import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for 423D Built. Read the terms and conditions governing the use of our 3D printing and laser engraving services in Bristol, Tennessee.",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
