import Link from "next/link";
import { IconByName } from "@/config/icons";
import { cn } from "@/lib/utils";
import type { CheatsheetSummary } from "@/types/content";
import { CheatsheetMeta } from "./cheatsheet-meta";

interface CheatsheetCardProps {
  sheet: CheatsheetSummary;
  layout?: "grid" | "list";
  showTags?: boolean;
  className?: string;
}

export function CheatsheetCard({ sheet, layout = "grid", showTags = true, className }: CheatsheetCardProps) {
  return (
    <article
      className={cn(
        "group relative flex rounded-xl border bg-card transition-colors hover:border-brand/45 focus-within:border-brand/60",
        layout === "grid" ? "flex-col gap-3 p-5" : "flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-6",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <IconByName name={sheet.category.icon} className="size-3.5 text-brand" />
          {sheet.category.name}
        </p>
        <h3 className="font-semibold tracking-tight">
          <Link href={`/cheatsheets/${sheet.slug}`} className="outline-none after:absolute after:inset-0 after:rounded-xl">
            {sheet.title}
          </Link>
        </h3>
        <p className={cn("text-sm leading-relaxed text-muted-foreground", layout === "grid" ? "line-clamp-2" : "line-clamp-1")}>
          {sheet.description}
        </p>
      </div>
      <div className={cn("space-y-3", layout === "grid" ? "mt-auto" : "sm:w-64 sm:shrink-0 sm:text-right")}>
        {showTags && sheet.tags.length > 0 && (
          <ul className={cn("flex flex-wrap gap-1.5", layout === "list" && "sm:justify-end")} aria-label="Tags">
            {sheet.tags.slice(0, 4).map((tag) => (
              <li key={tag.slug} className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-secondary-foreground">
                {tag.name}
              </li>
            ))}
          </ul>
        )}
        <CheatsheetMeta sheet={sheet} className={cn(layout === "list" && "sm:justify-end")} />
      </div>
    </article>
  );
}
