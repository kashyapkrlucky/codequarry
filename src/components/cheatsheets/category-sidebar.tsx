import Link from "next/link";
import { IconByName } from "@/config/icons";
import type { CategoriesNav } from "./types";
import { cn } from "@/lib/utils";

export function CategorySidebar({ nav }: { nav: CategoriesNav }) {
  return (
    <nav aria-label={`${nav.current.name} cheatsheets`} className="space-y-6 text-sm">
      <div>
        <Link href={`/categories/${nav.current.slug}`} className="mb-2 flex items-center gap-2 font-semibold hover:text-brand">
          <IconByName name={nav.current.icon} className="size-4 text-brand" /> {nav.current.name}
        </Link>
        <ul className="space-y-0.5 border-l">
          {nav.siblings.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/cheatsheets/${s.slug}`}
                aria-current={s.slug === nav.activeSlug ? "page" : undefined}
                className={cn(
                  "-ml-px block border-l py-1 pl-3 leading-snug transition-colors",
                  s.slug === nav.activeSlug ? "border-brand font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wider uppercase">Categories</p>
        <ul className="space-y-0.5">
          {nav.categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/categories/${c.slug}`}
                className={cn("flex justify-between rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground", c.slug === nav.current.slug && "text-foreground")}
              >
                <span className="truncate">{c.name}</span>
                <span className="font-mono text-[11px] opacity-70">{c.cheatsheetCount}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
