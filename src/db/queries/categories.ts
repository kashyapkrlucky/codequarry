import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getDb, isDatabaseConfigured } from "@/db";
import type { CategoryWithCount, TechnologyRef } from "@/types/content";
import { PUBLISHED } from "./mappers";

export const CONTENT_TAG = "content";

/** All categories ordered for display, with published counts (parents include children). */
export async function getCategories(): Promise<CategoryWithCount[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG, "categories");
  if (!isDatabaseConfigured()) return [];

  const db = getDb();
  const [categories, counts] = await Promise.all([
    db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true, icon: true, description: true, sortOrder: true, parent: { select: { slug: true } } },
    }),
    db.cheatsheet.groupBy({ by: ["categoryId"], where: PUBLISHED, _count: { _all: true } }),
  ]);

  const direct = new Map(counts.map((c) => [c.categoryId, c._count._all]));
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const total = new Map<string, number>();
  for (const c of categories) {
    const own = direct.get(c.id) ?? 0;
    total.set(c.slug, (total.get(c.slug) ?? 0) + own);
    // Roll counts up the tree so a parent category reflects its subcategories.
    let parentSlug = c.parent?.slug;
    while (parentSlug) {
      total.set(parentSlug, (total.get(parentSlug) ?? 0) + own);
      parentSlug = bySlug.get(parentSlug)?.parent?.slug;
    }
  }

  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    description: c.description,
    sortOrder: c.sortOrder,
    parentSlug: c.parent?.slug ?? null,
    cheatsheetCount: total.get(c.slug) ?? 0,
  }));
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return null;
  return {
    ...category,
    parent: categories.find((c) => c.slug === category.parentSlug) ?? null,
    children: categories.filter((c) => c.parentSlug === category.slug),
  };
}

/** Returns the slug plus all descendant category ids, for "category includes subcategories" filters. */
export async function getCategoryScopeIds(slug: string): Promise<string[]> {
  const categories = await getCategories();
  const ids: string[] = [];
  const walk = (s: string) => {
    for (const c of categories) {
      if (c.slug === s) ids.push(c.id);
      if (c.parentSlug === s) walk(c.slug);
    }
  };
  walk(slug);
  return [...new Set(ids)];
}

export interface TechnologyWithCount extends TechnologyRef {
  cheatsheetCount: number;
}

export async function getTechnologies(): Promise<TechnologyWithCount[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG, "technologies");
  if (!isDatabaseConfigured()) return [];

  const rows = await getDb().technology.findMany({
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      icon: true,
      _count: { select: { cheatsheets: { where: { cheatsheet: PUBLISHED } } } },
    },
  });
  return rows.map(({ _count, ...t }) => ({ ...t, cheatsheetCount: _count.cheatsheets }));
}
