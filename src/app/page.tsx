import { prisma } from "@/lib/prisma";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import Link from "next/link";

export default async function HomePage() {
  const page = await prisma.page.findUnique({
    where: { slug: "home" },
    include: {
      blocks: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!page) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#000" }}>
        <div className="text-center px-6">
          <h1
            className="text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            423D Built
          </h1>
          <p style={{ color: "#9ca3af" }} className="mb-6">
            This page hasn&apos;t been configured yet. Run the database seed or create a &quot;home&quot; page in the admin panel.
          </p>
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all"
            style={{ backgroundColor: "#D4881C", color: "#000" }}
          >
            Go to Admin Pages
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <BlockRenderer blocks={page.blocks} />
    </main>
  );
}

export async function generateMetadata() {
  const page = await prisma.page.findUnique({
    where: { slug: "home" },
    select: { title: true, description: true },
  });

  return {
    title: page ? `${page.title} | 423D Built` : "423D Built",
    description: page?.description || "Custom 3D Printing & Laser Engraving in Bristol, Tennessee",
  };
}
