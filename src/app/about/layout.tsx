import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about 423D Built, a small-batch 3D printing and laser engraving studio in Bristol, Tennessee. Our story, mission, and commitment to quality craftsmanship.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
