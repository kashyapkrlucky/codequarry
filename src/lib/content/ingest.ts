import { slug as slugify } from "github-slugger";
import type { Database } from "@/db/client";
import type { ContentBundle } from "./loader";

export interface IngestOptions {
  /** Archive published cheatsheets whose source file no longer exists. */
  prune?: boolean;
  log?: (message: string) => void;
}

export interface IngestResult {
  categories: number;
  technologies: number;
  cheatsheets: number;
  archived: number;
}

/**
 * Writes a validated ContentBundle to PostgreSQL. Idempotent: every entity is
 * upserted by slug, and join tables are replaced per cheatsheet.
 * The database is the source of truth at runtime; MDX files are the authoring format.
 */
export async function ingestContent(
  db: Database,
  bundle: ContentBundle,
  { prune = false, log = () => {} }: IngestOptions = {},
): Promise<IngestResult> {
  // 1. Categories (two passes so parents resolve regardless of order).
  const categoryIds = new Map<string, string>();
  for (const c of bundle.categories) {
    const row = await db.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, name: c.name, description: c.description, icon: c.icon, sortOrder: c.sortOrder },
      update: { name: c.name, description: c.description, icon: c.icon, sortOrder: c.sortOrder },
      select: { id: true },
    });
    categoryIds.set(c.slug, row.id);
  }
  for (const c of bundle.categories) {
    await db.category.update({
      where: { slug: c.slug },
      data: { parentId: c.parent ? categoryIds.get(c.parent)! : null },
    });
  }
  log(`✓ ${bundle.categories.length} categories`);

  // 2. Technologies.
  const technologyIds = new Map<string, string>();
  for (const t of bundle.technologies) {
    const row = await db.technology.upsert({
      where: { slug: t.slug },
      create: t,
      update: { name: t.name, description: t.description, icon: t.icon },
      select: { id: true },
    });
    technologyIds.set(t.slug, row.id);
  }
  log(`✓ ${bundle.technologies.length} technologies`);

  // 3. Tags (deduplicated across all documents).
  const tagNames = new Map<string, string>();
  for (const doc of bundle.documents) {
    for (const name of doc.frontmatter.tags) tagNames.set(slugify(name), name);
  }
  const tagIds = new Map<string, string>();
  for (const [slug, name] of tagNames) {
    const row = await db.tag.upsert({ where: { slug }, create: { slug, name }, update: { name }, select: { id: true } });
    tagIds.set(slug, row.id);
  }

  // 4. Cheatsheets + join tables, one transaction per document.
  const importedIds: string[] = [];
  for (const doc of bundle.documents) {
    const fm = doc.frontmatter;
    const existing = await db.cheatsheet.findUnique({ where: { slug: fm.slug }, select: { publishedAt: true } });
    const publishedAt =
      fm.status === "published" ? (fm.publishedAt ?? existing?.publishedAt ?? fm.updatedAt) : (fm.publishedAt ?? null);

    const data = {
      title: fm.title,
      description: fm.description,
      content: doc.body,
      categoryId: categoryIds.get(fm.category)!,
      difficulty: fm.difficulty,
      readingTime: doc.readingTime,
      status: fm.status,
      featured: fm.featured,
      publishedAt,
      updatedAt: fm.updatedAt,
    };

    const id = await db.$transaction(async (tx) => {
      const row = await tx.cheatsheet.upsert({
        where: { slug: fm.slug },
        create: { slug: fm.slug, ...data },
        update: data,
        select: { id: true },
      });
      await tx.cheatsheetTag.deleteMany({ where: { cheatsheetId: row.id } });
      await tx.cheatsheetTechnology.deleteMany({ where: { cheatsheetId: row.id } });
      const uniqueTags = [...new Set(fm.tags.map((t) => tagIds.get(slugify(t))!))];
      await tx.cheatsheetTag.createMany({ data: uniqueTags.map((tagId) => ({ cheatsheetId: row.id, tagId })) });
      await tx.cheatsheetTechnology.createMany({
        data: fm.technologies.map((t) => ({ cheatsheetId: row.id, technologyId: technologyIds.get(t)! })),
      });
      return row.id;
    });
    importedIds.push(id);
    log(`  • ${fm.slug} (${fm.status})`);
  }
  log(`✓ ${importedIds.length} cheatsheets`);

  // 5. Full-text search vectors.
  await refreshSearchVectors(db, importedIds);
  log("✓ search index refreshed");

  // 6. Optionally archive cheatsheets that no longer have a source file.
  let archived = 0;
  if (prune) {
    const result = await db.cheatsheet.updateMany({
      where: { slug: { notIn: bundle.documents.map((d) => d.frontmatter.slug) }, status: { not: "archived" } },
      data: { status: "archived" },
    });
    archived = result.count;
    log(`✓ archived ${archived} cheatsheet(s) without source files`);
  }

  return {
    categories: bundle.categories.length,
    technologies: bundle.technologies.length,
    cheatsheets: importedIds.length,
    archived,
  };
}

/**
 * Rebuilds the weighted tsvector for the given cheatsheets.
 * Weights: A = title + tags, B = description, C = body (prose and code).
 */
export async function refreshSearchVectors(db: Database, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await db.$executeRaw`
    UPDATE cheatsheets AS c
    SET search_vector =
        setweight(to_tsvector('english', c.title), 'A')
     || setweight(to_tsvector('english', coalesce(t.tag_names, '')), 'A')
     || setweight(to_tsvector('english', c.description), 'B')
     || setweight(to_tsvector('english', c.content), 'C')
    FROM (
      SELECT c2.id, string_agg(tg.name, ' ') AS tag_names
      FROM cheatsheets c2
      LEFT JOIN cheatsheet_tags ct ON ct.cheatsheet_id = c2.id
      LEFT JOIN tags tg ON tg.id = ct.tag_id
      WHERE c2.id = ANY(${ids}::uuid[])
      GROUP BY c2.id
    ) AS t
    WHERE c.id = t.id`;
}
