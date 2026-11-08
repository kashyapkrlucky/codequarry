import { DIFFICULTY_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DifficultyLevel } from "@/types/content";

const DOT: Record<DifficultyLevel, string> = {
  beginner: "bg-success",
  intermediate: "bg-warning",
  advanced: "bg-destructive",
};

export function DifficultyBadge({ level, className }: { level: DifficultyLevel; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", DOT[level])} />
      {DIFFICULTY_LABEL[level]}
    </span>
  );
}
