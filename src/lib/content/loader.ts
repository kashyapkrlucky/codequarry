import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import {
  categoryMetaSchema,
  frontmatterSchema,
  technologyMetaSchema,
  type CategoryMeta,
  type Frontmatter,
  type TechnologyMeta,
} from "@/lib/validation/content";
import { estimateReadingTime } from "./reading-time";
import { validateMdxSource } from "./validate-mdx";

export interface ContentDocument {
  file: string;
  frontmatter: Frontmatter;
  readingTime: number;
  body: string;
}

export interface ContentBundle {
  categories: CategoryMeta[];
  technologies: TechnologyMeta[];
  documents: ContentDocument[];
}

export class ContentValidationError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Content validation failed with ${problems.length} problem(s):\n  - ${problems.join("\n  - ")}`);
    this.name = "ContentValidationError";
  }
}

async function readJson<T>(file: string, schema: z.ZodType<T>, problems: string[]): Promise<T[]> {
  const raw = JSON.parse(await readFile(file, "utf8")) as unknown;
  const parsed = z.array(schema).safeParse(raw);
  if (!parsed.success) {
    problems.push(`${path.basename(file)}: ${z.prettifyError(parsed.error)}`);
    return [];
  }
  return parsed.data;
}

async function listMdxFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return entry.name.startsWith("_") ? [] : listMdxFiles(full);
      return entry.name.endsWith(".mdx") ? [full] : [];
    }),
  );
  return files.flat().sort();
}

/**
 * Loads and validates the whole content directory. Throws a single
 * ContentValidationError listing every problem so authors can fix them in one pass.
 */
export async function loadContent(rootDir: string): Promise<ContentBundle> {
  const problems: string[] = [];
  const categories = await readJson(path.join(rootDir, "_meta/categories.json"), categoryMetaSchema, problems);
  const technologies = await readJson(path.join(rootDir, "_meta/technologies.json"), technologyMetaSchema, problems);

  const categorySlugs = new Set(categories.map((c) => c.slug));
  const technologySlugs = new Set(technologies.map((t) => t.slug));
  for (const c of categories) {
    if (c.parent && !categorySlugs.has(c.parent)) problems.push(`categories.json: "${c.slug}" has unknown parent "${c.parent}"`);
  }

  const documents: ContentDocument[] = [];
  const seenSlugs = new Map<string, string>();

  for (const file of await listMdxFiles(rootDir)) {
    const rel = path.relative(rootDir, file);
    const { data, content } = matter(await readFile(file, "utf8"));
    const parsed = frontmatterSchema.safeParse(data);
    if (!parsed.success) {
      problems.push(`${rel}: invalid frontmatter\n${z.prettifyError(parsed.error)}`);
      continue;
    }
    const fm = parsed.data;
    if (!categorySlugs.has(fm.category)) problems.push(`${rel}: unknown category "${fm.category}"`);
    for (const tech of fm.technologies) {
      if (!technologySlugs.has(tech)) problems.push(`${rel}: unknown technology "${tech}"`);
    }
    const duplicate = seenSlugs.get(fm.slug);
    if (duplicate) problems.push(`${rel}: slug "${fm.slug}" is already used by ${duplicate}`);
    seenSlugs.set(fm.slug, rel);

    for (const issue of validateMdxSource(content)) problems.push(`${rel}: ${issue}`);

    documents.push({
      file: rel,
      frontmatter: fm,
      readingTime: fm.readingTime ?? estimateReadingTime(content),
      body: content.trim(),
    });
  }

  if (problems.length > 0) throw new ContentValidationError(problems);
  return { categories, technologies, documents };
}
