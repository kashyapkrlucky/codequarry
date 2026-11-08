import { z } from "zod";
import type { ListParams } from "@/db/queries/cheatsheets";
import { difficultySchema, slugSchema } from "./content";

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Accepts `a,b` or repeated params; silently drops invalid values instead of failing the page. */
const list = <T extends string>(item: z.ZodType<T>) =>
  z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) =>
      (v === undefined ? [] : Array.isArray(v) ? v : v.split(","))
        .filter((x): x is T => item.safeParse(x).success)
        .filter((x, i, all) => all.indexOf(x) === i)
        .slice(0, 10),
    )
    .catch([]);

const first = (v: unknown) => (Array.isArray(v) ? v[0] : v);

export const exploreParamsSchema = z.object({
  q: z.preprocess(first, z.string().trim().max(100).optional()).catch(undefined),
  category: z.preprocess(first, slugSchema.optional()).catch(undefined),
  tech: list(slugSchema),
  difficulty: list(difficultySchema),
  sort: z.preprocess(first, z.enum(["relevance", "latest", "popular", "alphabetical"]).optional()).catch(undefined),
  page: z.preprocess(first, z.coerce.number().int().min(1).max(500).default(1)).catch(1),
  view: z.preprocess(first, z.enum(["grid", "list"]).default("grid")).catch("grid"),
});

export type ExploreParams = z.infer<typeof exploreParamsSchema>;

export function parseExploreParams(raw: RawSearchParams): ExploreParams {
  return exploreParamsSchema.parse(raw);
}

export function toListParams(p: ExploreParams, pageSize = 12): ListParams {
  return {
    q: p.q || undefined,
    category: p.category,
    technologies: p.tech,
    difficulties: p.difficulty,
    sort: p.sort === "relevance" && !p.q ? undefined : p.sort,
    page: p.page,
    pageSize,
  };
}

/** Serialises explore params back into a query string, dropping defaults. */
export function buildExploreHref(base: string, p: Partial<ExploreParams>): string {
  const params = new URLSearchParams();
  if (p.q) params.set("q", p.q);
  if (p.category) params.set("category", p.category);
  if (p.tech?.length) params.set("tech", p.tech.join(","));
  if (p.difficulty?.length) params.set("difficulty", p.difficulty.join(","));
  if (p.sort) params.set("sort", p.sort);
  if (p.page && p.page > 1) params.set("page", String(p.page));
  if (p.view && p.view !== "grid") params.set("view", p.view);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function toggleValue<T>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}
