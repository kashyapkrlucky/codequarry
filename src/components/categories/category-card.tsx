import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { IconByName } from "@/config/icons";
import { pluralize } from "@/lib/format";
import type { CategoryWithCount } from "@/types/content";

export function CategoryCard({ category, parentName }: { category: CategoryWithCount; parentName?: string }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex h-full flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-brand/45"
    >
      <div className="flex items-start justify-between">
        <span className="grid size-9 place-items-center rounded-lg border bg-surface text-brand">
          <IconByName name={category.icon} className="size-[18px]" />
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        {parentName && <p className="text-xs text-muted-foreground">{parentName}</p>}
        <h3 className="font-semibold tracking-tight">{category.name}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{category.description}</p>
      </div>
      <p className="mt-auto font-mono text-xs text-muted-foreground">
        {category.cheatsheetCount > 0 ? pluralize(category.cheatsheetCount, "cheatsheet") : "Coming soon"}
      </p>
    </Link>
  );
}
