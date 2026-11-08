import type { Prisma } from "@/generated/prisma/client";
import type { CheatsheetSummary } from "@/types/content";

/** Prisma selection shared by every list view — keeps payloads small and avoids N+1. */
export const summarySelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  difficulty: true,
  readingTime: true,
  updatedAt: true,
  publishedAt: true,
  category: { select: { slug: true, name: true, icon: true } },
  tags: { select: { tag: { select: { slug: true, name: true } } }, orderBy: { tag: { name: "asc" } } },
} satisfies Prisma.CheatsheetSelect;

export type SummaryRow = Prisma.CheatsheetGetPayload<{ select: typeof summarySelect }>;

export function toSummary(row: SummaryRow): CheatsheetSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    difficulty: row.difficulty,
    readingTime: row.readingTime,
    updatedAt: row.updatedAt,
    publishedAt: row.publishedAt,
    category: row.category,
    tags: row.tags.map((t) => t.tag),
  };
}

export const PUBLISHED = { status: "published" } as const;
