import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Request a free quote for your 3D printing, laser engraving, or custom design project. Fast turnaround from 423D Built in Bristol, TN.",
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
