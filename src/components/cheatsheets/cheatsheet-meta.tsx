import { Clock } from "lucide-react";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CheatsheetSummary } from "@/types/content";
import { DifficultyBadge } from "./difficulty-badge";

export function CheatsheetMeta({
  sheet,
  className,
}: {
  sheet: Pick<CheatsheetSummary, "difficulty" | "readingTime" | "updatedAt">;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", className)}>
      <DifficultyBadge level={sheet.difficulty} />
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3" aria-hidden="true" />
        {sheet.readingTime} min
      </span>
      <span>
        Updated <time dateTime={new Date(sheet.updatedAt).toISOString()}>{formatDate(sheet.updatedAt)}</time>
      </span>
    </div>
  );
}
