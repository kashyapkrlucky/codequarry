import { z } from "zod";

export const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be lowercase kebab-case");

export const difficultySchema = z.enum(["beginner", "intermediate", "advanced"]);
export type DifficultyLevel = z.infer<typeof difficultySchema>;

export const statusSchema = z.enum(["draft", "published", "archived"]);

export const categoryMetaSchema = z.object({
  slug: slugSchema,
  name: z.string().min(2).max(60),
  description: z.string().min(10).max(240),
  icon: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
  parent: slugSchema.optional(),
});
export type CategoryMeta = z.infer<typeof categoryMetaSchema>;

export const technologyMetaSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(60),
  description: z.string().min(5).max(240),
  icon: z.string().min(1),
});
export type TechnologyMeta = z.infer<typeof technologyMetaSchema>;

const isoDate = z.union([z.string(), z.date()]).transform((value, ctx) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    ctx.addIssue({ code: "custom", message: "must be an ISO date (YYYY-MM-DD)" });
    return z.NEVER;
  }
  return date;
});

/** Frontmatter accepted at the top of every cheatsheet MDX file. */
export const frontmatterSchema = z.object({
  title: z.string().min(2).max(100),
  slug: slugSchema,
  description: z.string().min(20).max(220),
  category: slugSchema,
  difficulty: difficultySchema,
  tags: z.array(z.string().min(1).max(40)).min(1).max(12),
  technologies: z.array(slugSchema).max(8).default([]),
  readingTime: z.number().int().positive().max(120).optional(),
  featured: z.boolean().default(false),
  status: statusSchema.default("published"),
  publishedAt: isoDate.optional(),
  updatedAt: isoDate,
});
export type Frontmatter = z.infer<typeof frontmatterSchema>;
