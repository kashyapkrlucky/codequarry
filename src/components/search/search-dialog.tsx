"use client";

import { ArrowRight, CornerDownLeft, FileText, Loader2, SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { IconByName } from "@/config/icons";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { HIGHLIGHT_START } from "@/lib/search/query";
import type { SearchHit, SearchResponse } from "@/types/content";
import { Highlight } from "./highlight";

const SUGGESTIONS = ["TypeScript generics", "Docker compose", "SQL joins", "React hooks", "Big O", "Git rebase"];

type Status = "idle" | "loading" | "done" | "error";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery: string;
}

export function SearchDialog({ open, onOpenChange, initialQuery }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [data, setData] = useState<{ query: string; hits: SearchHit[] } | null>(null);
  const [errorFor, setErrorFor] = useState<string | null>(null);
  const debounced = useDebouncedValue(query.trim(), 160);
  const active = debounced.length >= 2;

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`, { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<SearchResponse>) : Promise.reject(new Error(String(res.status)))))
      .then((body) => {
        setData({ query: debounced, hits: body.hits });
        setErrorFor(null);
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setErrorFor(debounced);
      });
    return () => controller.abort();
  }, [active, debounced]);

  // Derived state: keep showing the previous results while the next query loads.
  const status: Status = !active ? "idle" : errorFor === debounced ? "error" : data?.query === debounced ? "done" : "loading";
  const result = active ? data : null;

  // Keep keyboard selection on the best hit whenever results change.
  const [selected, setSelected] = useState("");
  const [selectedFor, setSelectedFor] = useState<SearchHit[] | null>(null);
  if (result && result.hits !== selectedFor) {
    setSelectedFor(result.hits);
    setSelected(result.hits[0]?.slug ?? "__all__");
  }

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; icon: string; hits: SearchHit[] }>();
    for (const hit of result?.hits ?? []) {
      const group = map.get(hit.category.slug) ?? { name: hit.category.name, icon: hit.category.icon, hits: [] };
      group.hits.push(hit);
      map.set(hit.category.slug, group);
    }
    return [...map.entries()];
  }, [result]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const trimmed = query.trim();
  const showNoResults = status === "done" && result?.hits.length === 0 && trimmed.length >= 2;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search CodeQuarry"
      description="Search cheatsheets by title, tag, or content"
      className="top-[12vh] w-[calc(100%-2rem)] max-w-2xl sm:max-w-2xl"
    >
      <Command shouldFilter={false} loop value={selected} onValueChange={setSelected} className="bg-popover">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search TypeScript, Docker, SQL, algorithms..."
          aria-label="Search cheatsheets"
          maxLength={100}
        />
        <CommandList className="max-h-[min(60vh,32rem)]">
          <div aria-live="polite" className="sr-only">
            {status === "done" && result ? `${result.hits.length} results` : ""}
          </div>

          {trimmed.length < 2 && (
            <CommandGroup heading="Try searching for">
              {SUGGESTIONS.map((s) => (
                <CommandItem key={s} value={`suggest-${s}`} onSelect={() => setQuery(s)}>
                  <ArrowRight className="text-muted-foreground" />
                  {s}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {status === "loading" && !result && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Searching…
            </div>
          )}

          {status === "error" && (
            <p className="py-10 text-center text-sm text-muted-foreground">Search is unavailable right now. Please try again.</p>
          )}

          {showNoResults && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <SearchX className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">No results for “{trimmed}”</p>
              <p className="text-xs text-muted-foreground">Try a broader term, or browse all cheatsheets.</p>
            </div>
          )}

          {groups.map(([slug, group]) => {
            return (
              <CommandGroup
                key={slug}
                heading={
                  <span className="flex items-center gap-1.5">
                    <IconByName name={group.icon} className="size-3.5" /> {group.name}
                  </span>
                }
              >
                {group.hits.map((hit) => (
                  <CommandItem
                    key={hit.slug}
                    value={hit.slug}
                    onSelect={() => go(`/cheatsheets/${hit.slug}`)}
                    className="items-start gap-3 py-2.5"
                  >
                    <FileText className="mt-0.5 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{hit.title}</p>
                      <Highlight
                        value={hit.excerpt.includes(HIGHLIGHT_START) ? hit.excerpt : hit.description}
                        className="line-clamp-2 text-xs leading-relaxed text-muted-foreground"
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}

          {trimmed.length >= 2 && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem value="__all__" onSelect={() => go(`/explore?q=${encodeURIComponent(trimmed)}`)}>
                  <ArrowRight className="text-muted-foreground" />
                  View all results for “{trimmed}” in Explore
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
        <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 font-mono">↑</kbd>
              <kbd className="rounded border bg-muted px-1 font-mono">↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 font-mono">
                <CornerDownLeft className="inline size-2.5" />
              </kbd>
              open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 font-mono">esc</kbd> close
            </span>
          </span>
          {status === "loading" && result && <Loader2 className="size-3 animate-spin" aria-label="Updating results" />}
        </div>
      </Command>
    </CommandDialog>
  );
}
