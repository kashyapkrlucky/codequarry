import { LayoutGrid, List, SearchX } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/layout/section";
import { getCategories, getTechnologies } from "@/db/queries/categories";
import { listCheatsheets } from "@/db/queries/cheatsheets";
import { DIFFICULTY_LABEL, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  buildExploreHref,
  parseExploreParams,
  toggleValue,
  toListParams,
  type ExploreParams,
  type RawSearchParams,
} from "@/lib/validation/explore";
import type { DifficultyLevel, SortOption } from "@/types/content";
import { CheatsheetCard } from "./cheatsheet-card";
import { Pagination } from "./pagination";

interface BrowserProps {
  basePath: string;
  searchParams: Promise<RawSearchParams>;
  /** When set, results are scoped to this category (and its subcategories). */
  lockedCategory?: string;
  searchPlaceholder?: string;
}

const DIFFICULTIES: DifficultyLevel[] = ["beginner", "intermediate", "advanced"];
const SORTS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "alphabetical", label: "A–Z" },
];

/**
 * Server-rendered discovery UI. All filtering, sorting and pagination happen
 * in PostgreSQL; every control is a plain link or GET form, so it works
 * without client JavaScript and every state has a shareable URL.
 */
export async function CheatsheetBrowser({ basePath, searchParams, lockedCategory, searchPlaceholder }: BrowserProps) {
  const parsed = parseExploreParams(await searchParams);
  const params: ExploreParams = lockedCategory ? { ...parsed, category: lockedCategory } : parsed;
  const [result, categories, technologies] = await Promise.all([
    listCheatsheets(toListParams(params)),
    getCategories(),
    getTechnologies(),
  ]);

  // Links never carry the locked category (it lives in the path).
  const linkState: Partial<ExploreParams> = lockedCategory ? { ...params, category: undefined } : params;
  const href = (patch: Partial<ExploreParams>) => buildExploreHref(basePath, { ...linkState, page: 1, ...patch });
  const activeSort: SortOption = params.sort ?? (params.q ? "relevance" : "latest");
  const visibleSorts = SORTS.filter((s) => s.value !== "relevance" || params.q);
  const hasFilters = Boolean(params.q || params.tech.length || params.difficulty.length || (!lockedCategory && params.category));

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
      <aside aria-label="Filters" className="space-y-6 lg:sticky lg:top-20 lg:self-start">
        <form action={basePath} role="search" className="space-y-2">
          <label htmlFor="browser-q" className="text-xs font-semibold tracking-wider uppercase">Search</label>
          <input
            id="browser-q"
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            maxLength={100}
            placeholder={searchPlaceholder ?? "Filter by keyword…"}
            className="h-9 w-full rounded-lg border bg-card px-3 text-sm outline-none focus:border-brand/60 focus:ring-3 focus:ring-brand/15"
          />
          {!lockedCategory && params.category && <input type="hidden" name="category" value={params.category} />}
          {params.tech.length > 0 && <input type="hidden" name="tech" value={params.tech.join(",")} />}
          {params.difficulty.length > 0 && <input type="hidden" name="difficulty" value={params.difficulty.join(",")} />}
          {params.view !== "grid" && <input type="hidden" name="view" value={params.view} />}
        </form>

        {!lockedCategory && (
          <FilterGroup title="Category">
            {categories.filter((c) => c.cheatsheetCount > 0).map((c) => (
              <FilterChip
                key={c.slug}
                href={href({ category: params.category === c.slug ? undefined : c.slug })}
                active={params.category === c.slug}
                label={c.name}
                count={c.cheatsheetCount}
              />
            ))}
          </FilterGroup>
        )}

        <FilterGroup title="Difficulty">
          {DIFFICULTIES.map((d) => (
            <FilterChip key={d} href={href({ difficulty: toggleValue(params.difficulty, d) })} active={params.difficulty.includes(d)} label={DIFFICULTY_LABEL[d]} />
          ))}
        </FilterGroup>

        <FilterGroup title="Technology">
          {technologies.filter((t) => t.cheatsheetCount > 0).map((t) => (
            <FilterChip key={t.slug} href={href({ tech: toggleValue(params.tech, t.slug) })} active={params.tech.includes(t.slug)} label={t.name} count={t.cheatsheetCount} />
          ))}
        </FilterGroup>

        {hasFilters && (
          <Link href={basePath} className="inline-block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Clear all filters
          </Link>
        )}
      </aside>

      <section aria-labelledby="results-heading" className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <h2 id="results-heading" className="text-sm text-muted-foreground" aria-live="polite">
            <span className="font-medium text-foreground">{pluralize(result.total, "cheatsheet")}</span>
            {params.q && <> matching “{params.q}”</>}
          </h2>
          <div className="flex items-center gap-3">
            <nav aria-label="Sort" className="flex items-center rounded-lg border bg-card p-0.5 text-xs">
              {visibleSorts.map((s) => (
                <Link
                  key={s.value}
                  href={href({ sort: s.value })}
                  aria-current={activeSort === s.value ? "true" : undefined}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-medium transition-colors",
                    activeSort === s.value ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </Link>
              ))}
            </nav>
            <nav aria-label="Layout" className="hidden items-center rounded-lg border bg-card p-0.5 sm:flex">
              {(["grid", "list"] as const).map((v) => {
                const Icon = v === "grid" ? LayoutGrid : List;
                return (
                  <Link
                    key={v}
                    href={href({ view: v, page: params.page })}
                    aria-label={`${v} layout`}
                    aria-current={params.view === v ? "true" : undefined}
                    className={cn("rounded-md p-1.5", params.view === v ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Icon className="size-3.5" />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {result.items.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-6" />}
            title="No cheatsheets found"
            description={hasFilters ? "Try removing a filter or using a broader search term." : "Nothing has been published here yet."}
            action={hasFilters ? <Link href={basePath} className="text-sm font-medium text-brand">Clear filters</Link> : undefined}
          />
        ) : (
          <div className={cn("grid gap-4", params.view === "grid" ? "md:grid-cols-2 xl:grid-cols-3" : "gap-3")}>
            {result.items.map((sheet) => (
              <CheatsheetCard key={sheet.slug} sheet={sheet} layout={params.view} />
            ))}
          </div>
        )}

        <Pagination page={result.page} pageCount={result.pageCount} hrefFor={(page) => buildExploreHref(basePath, { ...linkState, page })} />
      </section>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-xs font-semibold tracking-wider uppercase">{title}</legend>
      <div className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-0.5">{children}</div>
    </fieldset>
  );
}

function FilterChip({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      scroll={false}
      className={cn(
        "flex items-center justify-between gap-2 rounded-md border px-2.5 py-1 text-sm transition-colors lg:border-transparent",
        active ? "border-brand/50 bg-brand/10 text-foreground lg:border-brand/30" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && <span className="font-mono text-[11px] opacity-70">{count}</span>}
    </Link>
  );
}
