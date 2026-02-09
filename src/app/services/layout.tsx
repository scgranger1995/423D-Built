import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "3D printing, laser engraving, and design services offered by 423D Built. PLA, PETG, ABS, ASA printing, custom engraving on wood, acrylic, leather, and more.",
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
