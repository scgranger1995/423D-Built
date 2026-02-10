import { prisma } from "@/lib/prisma";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { notFound } from "next/navigation";

// ============================================
// Dynamic Page Route - /p/[slug]
// Renders pages created in the visual page editor
// ============================================

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const page = await prisma.page.findUnique({
    where: { slug, published: true },
    include: {
      blocks: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!page) notFound();

  return (
    <main className="min-h-screen">
      <BlockRenderer blocks={page.blocks} />
    </main>
  );
}

// ============================================
// Metadata
// ============================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const page = await prisma.page.findUnique({
    where: { slug },
    select: { title: true, description: true },
  });

  if (!page) return {};

  return {
    title: `${page.title} | 423D Built`,
    description: page.description || undefined,
  };
}
