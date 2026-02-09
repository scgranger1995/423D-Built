import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our collection of handcrafted 3D printed and laser engraved products. Custom phone stands, engraved cutting boards, keychains, and more from Bristol, TN.",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
