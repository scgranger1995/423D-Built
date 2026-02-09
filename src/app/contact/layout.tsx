import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with 423D Built in Bristol, Tennessee. Reach out for questions about 3D printing, laser engraving, custom orders, or project consultations.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
