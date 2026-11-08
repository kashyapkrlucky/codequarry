"use client";

import { Search } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { useSearch } from "./search-provider";

function useIsMac(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => /mac|iphone|ipad/i.test(navigator.userAgent),
    () => true,
  );
}

export function ShortcutHint({ className }: { className?: string }) {
  const isMac = useIsMac();
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground",
        className,
      )}
    >
      {isMac ? "⌘" : "Ctrl "}K
    </kbd>
  );
}

/** Compact header button that opens the global search overlay. */
export function SearchTrigger({ className }: { className?: string }) {
  const { open } = useSearch();
  return (
    <button
      type="button"
      onClick={() => open()}
      aria-label="Search cheatsheets"
      aria-keyshortcuts="Meta+K Control+K"
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-lg border bg-surface px-2.5 text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground",
        className,
      )}
    >
      <Search className="size-4" />
      <span className="hidden lg:inline">Search…</span>
      <ShortcutHint className="hidden sm:inline-flex" />
    </button>
  );
}
