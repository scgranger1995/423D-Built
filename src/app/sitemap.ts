import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://423dbuilt.com";

  // Static routes
  const staticRoutes = [
    "",
    "/shop",
    "/gallery",
    "/services",
    "/about",
    "/contact",
    "/quote",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic product pages
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    });

    productEntries = products.map((product) => ({
      url: `${baseUrl}/shop/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("[Sitemap] Failed to fetch products:", error);
  }

  // Published custom pages
  let pageEntries: MetadataRoute.Sitemap = [];
  try {
    const pages = await prisma.page.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });

    pageEntries = pages.map((page) => ({
      url: `${baseUrl}/p/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("[Sitemap] Failed to fetch pages:", error);
  }

  return [...staticEntries, ...productEntries, ...pageEntries];
}
