import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "View our portfolio of 3D printed and laser engraved projects. Custom topographic maps, engraved signs, prototypes, and creative builds from 423D Built.",
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
