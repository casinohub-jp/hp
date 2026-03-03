import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/media";

const BASE = "https://casinohub.jp";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const articles = getAllArticles();

  const articlePages = articles.map((a) => ({
    url: `${BASE}/column/${a.slug}`,
    lastModified: a.date ? new Date(a.date) : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: BASE, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/column`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...articlePages,
  ];
}
