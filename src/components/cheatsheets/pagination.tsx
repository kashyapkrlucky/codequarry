import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function pageWindow(page: number, pageCount: number): (number | "…")[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function Pagination({ page, pageCount, hrefFor }: { page: number; pageCount: number; hrefFor: (page: number) => string }) {
  if (pageCount <= 1) return null;
  const linkClass = "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md border px-2 text-sm";
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 pt-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={cn(linkClass, "hover:bg-muted")}>
          <ChevronLeft className="size-4" /> <span className="sr-only sm:not-sr-only">Prev</span>
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(linkClass, "opacity-40")}><ChevronLeft className="size-4" /></span>
      )}
      {pageWindow(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground">…</span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(linkClass, p === page ? "border-brand/50 bg-brand/10 font-medium" : "hover:bg-muted")}
          >
            {p}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} rel="next" className={cn(linkClass, "hover:bg-muted")}>
          <span className="sr-only sm:not-sr-only">Next</span> <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(linkClass, "opacity-40")}><ChevronRight className="size-4" /></span>
      )}
    </nav>
  );
}
