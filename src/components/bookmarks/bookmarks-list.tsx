"use client";

import { Bookmark, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheatsheetMeta } from "@/components/cheatsheets/cheatsheet-meta";
import { EmptyState } from "@/components/layout/section";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookmarks, useHydrated } from "@/hooks/use-bookmarks";
import type { CheatsheetSummary } from "@/types/content";

export function BookmarksList() {
  const hydrated = useHydrated();
  const { bookmarks, remove } = useBookmarks();
  const [fetched, setFetched] = useState<{ key: string; items: CheatsheetSummary[] } | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const key = bookmarks.join(",");

  useEffect(() => {
    if (!hydrated || !key) return;
    const controller = new AbortController();
    fetch(`/api/cheatsheets?slugs=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { items: CheatsheetSummary[] }) => setFetched({ key, items: data.items }))
      .catch((e: unknown) => {
        if ((e as Error).name !== "AbortError") setErrorKey(key);
      });
    return () => controller.abort();
  }, [hydrated, key]);

  const error = errorKey === key && key !== "";
  // While a changed list refetches, keep showing the previous results (filtered below).
  const items = !key ? [] : (fetched?.items ?? null);

  if (!hydrated || (items === null && !error)) {
    return (
      <div className="grid gap-3" aria-busy="true">
        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  if (error) return <EmptyState title="Couldn't load bookmarks" description="Check your connection and refresh the page." />;

  // Only show bookmarks that still exist (unpublished sheets are filtered by the API).
  const visible = (items ?? []).filter((i) => bookmarks.includes(i.slug));

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark className="size-6" />}
        title="No bookmarks yet"
        description="Use the Bookmark button on any cheatsheet to save it here. Bookmarks are stored in this browser."
        action={<Link href="/explore" className="text-sm font-medium text-brand">Explore cheatsheets</Link>}
      />
    );
  }

  return (
    <ul className="grid gap-3">
      {visible.map((sheet) => (
        <li key={sheet.slug} className="flex items-start gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-brand/45">
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-xs text-muted-foreground">{sheet.category.name}</p>
            <Link href={`/cheatsheets/${sheet.slug}`} className="font-semibold tracking-tight hover:text-brand">{sheet.title}</Link>
            <p className="line-clamp-1 text-sm text-muted-foreground">{sheet.description}</p>
            <CheatsheetMeta sheet={sheet} />
          </div>
          <button
            type="button"
            onClick={() => remove(sheet.slug)}
            aria-label={`Remove ${sheet.title} from bookmarks`}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
