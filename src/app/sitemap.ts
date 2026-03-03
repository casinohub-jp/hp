import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/media";

const BASE = "https://casinohub.jp";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();
  const articles = slugs.map((slug) => ({
    url: `${BASE}/column/${slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: BASE, lastModified: new Date() },
    { url: `${BASE}/column`, lastModified: new Date() },
    ...articles,
  ];
}
