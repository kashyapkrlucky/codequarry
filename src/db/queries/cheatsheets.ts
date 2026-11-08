import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getDb, isDatabaseConfigured } from "@/db";
import type { Prisma } from "@/generated/prisma/client";
import { toPrefixTsQuery } from "@/lib/search/query";
import type {
  CheatsheetDetail,
  CheatsheetSummary,
  DifficultyLevel,
  Paginated,
  SortOption,
} from "@/types/content";
import { CONTENT_TAG, getCategoryScopeIds } from "./categories";
import { PUBLISHED, summarySelect, toSummary } from "./mappers";

export async function getFeaturedCheatsheets(limit = 6): Promise<CheatsheetSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  if (!isDatabaseConfigured()) return [];
  const rows = await getDb().cheatsheet.findMany({
    where: { ...PUBLISHED, featured: true },
    orderBy: [{ viewCount: "desc" }, { title: "asc" }],
    take: limit,
    select: summarySelect,
  });
  return rows.map(toSummary);
}

export async function getLatestCheatsheets(limit = 6): Promise<CheatsheetSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  if (!isDatabaseConfigured()) return [];
  const rows = await getDb().cheatsheet.findMany({
    where: PUBLISHED,
    orderBy: [{ publishedAt: "desc" }, { title: "asc" }],
    take: limit,
    select: summarySelect,
  });
  return rows.map(toSummary);
}

export interface ListParams {
  q?: string;
  category?: string;
  technologies?: string[];
  difficulties?: DifficultyLevel[];
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

/** Ranked ids of published cheatsheets matching a full-text query (title, tags, description, content). */
async function matchingIds(q: string, cap = 500): Promise<string[]> {
  const tsquery = toPrefixTsQuery(q);
  if (!tsquery) return [];
  const pattern = `%${q.trim().slice(0, 100).replace(/[\\%_]/g, "\\$&")}%`;
  const rows = await getDb().$queryRaw<{ id: string }[]>`
    SELECT id FROM cheatsheets
    WHERE status = 'published'
      AND (search_vector @@ to_tsquery('english', ${tsquery}) OR title ILIKE ${pattern})
    ORDER BY ts_rank_cd(search_vector, to_tsquery('english', ${tsquery})) DESC, title ASC
    LIMIT ${cap}`;
  return rows.map((r) => r.id);
}

/** Server-side filtered, sorted, paginated listing used by /explore and category pages. */
export async function listCheatsheets(params: ListParams): Promise<Paginated<CheatsheetSummary>> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);

  const pageSize = Math.min(Math.max(params.pageSize ?? 12, 1), 48);
  const page = Math.max(params.page ?? 1, 1);
  const empty = { items: [], total: 0, page, pageSize, pageCount: 0 };
  if (!isDatabaseConfigured()) return empty;

  const db = getDb();
  const where: Prisma.CheatsheetWhereInput = { ...PUBLISHED };
  if (params.category) where.categoryId = { in: await getCategoryScopeIds(params.category) };
  if (params.technologies?.length) {
    where.technologies = { some: { technology: { slug: { in: params.technologies } } } };
  }
  if (params.difficulties?.length) where.difficulty = { in: params.difficulties };

  const q = params.q?.trim();
  let rankedIds: string[] | null = null;
  if (q) {
    rankedIds = await matchingIds(q);
    if (rankedIds.length === 0) return empty;
    where.id = { in: rankedIds };
  }

  const sort: SortOption = params.sort ?? (q ? "relevance" : "latest");

  if (sort === "relevance" && rankedIds) {
    // Preserve full-text rank order: filter ids first, paginate, then hydrate one page.
    const allowed = new Set((await db.cheatsheet.findMany({ where, select: { id: true } })).map((r) => r.id));
    const ordered = rankedIds.filter((id) => allowed.has(id));
    const pageIds = ordered.slice((page - 1) * pageSize, page * pageSize);
    const rows = await db.cheatsheet.findMany({ where: { id: { in: pageIds } }, select: summarySelect });
    const byId = new Map(rows.map((r) => [r.id, r]));
    return {
      items: pageIds.flatMap((id) => (byId.has(id) ? [toSummary(byId.get(id)!)] : [])),
      total: ordered.length,
      page,
      pageSize,
      pageCount: Math.ceil(ordered.length / pageSize),
    };
  }

  const orderBy: Prisma.CheatsheetOrderByWithRelationInput[] =
    sort === "popular"
      ? [{ viewCount: "desc" }, { title: "asc" }]
      : sort === "alphabetical"
        ? [{ title: "asc" }]
        : [{ publishedAt: "desc" }, { title: "asc" }];

  const [total, rows] = await Promise.all([
    db.cheatsheet.count({ where }),
    db.cheatsheet.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize, select: summarySelect }),
  ]);
  return { items: rows.map(toSummary), total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export async function getCheatsheetBySlug(slug: string): Promise<CheatsheetDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG, `cheatsheet:${slug}`);
  if (!isDatabaseConfigured()) return null;

  const row = await getDb().cheatsheet.findFirst({
    where: { slug, ...PUBLISHED },
    select: {
      ...summarySelect,
      content: true,
      viewCount: true,
      categoryId: true,
      category: {
        select: { slug: true, name: true, icon: true, parent: { select: { slug: true, name: true, icon: true } } },
      },
      technologies: {
        select: { technology: { select: { slug: true, name: true, icon: true } } },
        orderBy: { technology: { name: "asc" } },
      },
    },
  });
  if (!row) return null;
  const { parent, ...category } = row.category;
  return {
    ...toSummary({ ...row, category }),
    content: row.content,
    viewCount: row.viewCount,
    categoryId: row.categoryId,
    parentCategory: parent,
    technologies: row.technologies.map((t) => t.technology),
  };
}

export interface CategorySiblings {
  items: Pick<CheatsheetSummary, "slug" | "title">[];
  previous: Pick<CheatsheetSummary, "slug" | "title"> | null;
  next: Pick<CheatsheetSummary, "slug" | "title"> | null;
}

/** Cheatsheets in the same category (alphabetical) for sidebar nav and prev/next links. */
export async function getCategorySiblings(categoryId: string, slug: string): Promise<CategorySiblings> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  if (!isDatabaseConfigured()) return { items: [], previous: null, next: null };
  const items = await getDb().cheatsheet.findMany({
    where: { ...PUBLISHED, categoryId },
    orderBy: { title: "asc" },
    select: { slug: true, title: true },
  });
  const index = items.findIndex((i) => i.slug === slug);
  return {
    items,
    previous: index > 0 ? items[index - 1] : null,
    next: index >= 0 && index < items.length - 1 ? items[index + 1] : null,
  };
}

/** Related cheatsheets ranked by shared tags/technologies, then same category. */
export async function getRelatedCheatsheets(id: string, limit = 3): Promise<CheatsheetSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  const ranked = await db.$queryRaw<{ id: string }[]>`
    WITH me AS (SELECT id, category_id FROM cheatsheets WHERE id = ${id}::uuid)
    SELECT c.id
    FROM cheatsheets c, me
    WHERE c.status = 'published' AND c.id <> me.id
    ORDER BY
      (SELECT count(*) FROM cheatsheet_tags a JOIN cheatsheet_tags b ON a.tag_id = b.tag_id
        WHERE a.cheatsheet_id = me.id AND b.cheatsheet_id = c.id) * 2
      + (SELECT count(*) FROM cheatsheet_technologies a JOIN cheatsheet_technologies b ON a.technology_id = b.technology_id
        WHERE a.cheatsheet_id = me.id AND b.cheatsheet_id = c.id) * 3
      + CASE WHEN c.category_id = me.category_id THEN 2 ELSE 0 END DESC,
      c.view_count DESC
    LIMIT ${limit}`;
  const ids = ranked.map((r) => r.id);
  const rows = await db.cheatsheet.findMany({ where: { id: { in: ids } }, select: summarySelect });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.flatMap((rid) => (byId.has(rid) ? [toSummary(byId.get(rid)!)] : []));
}

/** Summaries for a client-provided list of slugs (bookmarks). Order follows input. */
export async function getCheatsheetsBySlugs(slugs: string[]): Promise<CheatsheetSummary[]> {
  if (!isDatabaseConfigured() || slugs.length === 0) return [];
  const rows = await getDb().cheatsheet.findMany({
    where: { ...PUBLISHED, slug: { in: slugs } },
    select: summarySelect,
  });
  const bySlug = new Map(rows.map((r) => [r.slug, toSummary(r)]));
  return slugs.flatMap((s) => (bySlug.has(s) ? [bySlug.get(s)!] : []));
}

export async function getPublishedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  if (!isDatabaseConfigured()) return [];
  return getDb().cheatsheet.findMany({
    where: PUBLISHED,
    orderBy: { viewCount: "desc" },
    select: { slug: true, updatedAt: true },
  });
}
