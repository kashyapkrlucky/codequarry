import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { getCategories } from "@/db/queries/categories";
import { getPublishedSlugs } from "@/db/queries/cheatsheets";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sheets, categories] = await Promise.all([getPublishedSlugs(), getCategories()]);
  const latest = sheets.reduce<Date | undefined>((max, s) => (!max || s.updatedAt > max ? s.updatedAt : max), undefined);
  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/explore"), lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/categories"), changeFrequency: "monthly", priority: 0.6 },
    ...categories.map((c) => ({ url: absoluteUrl(`/categories/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...sheets.map((s) => ({ url: absoluteUrl(`/cheatsheets/${s.slug}`), lastModified: s.updatedAt, changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.3 },
  ];
}
