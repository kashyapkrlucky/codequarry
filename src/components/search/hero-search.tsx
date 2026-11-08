import { Search } from "lucide-react";
import { ShortcutHint } from "./search-trigger";

/**
 * Progressive-enhancement search bar: a plain GET form to /explore that works
 * without JavaScript. The global overlay is available via ⌘K / Ctrl+K.
 */
export function HeroSearch() {
  return (
    <form action="/explore" role="search" className="group relative w-full max-w-xl">
      <label htmlFor="hero-search" className="sr-only">Search cheatsheets</label>
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        id="hero-search"
        name="q"
        type="search"
        maxLength={100}
        autoComplete="off"
        placeholder="Search TypeScript, Docker, SQL, algorithms..."
        className="h-12 w-full rounded-xl border bg-card pr-20 pl-11 text-[15px] shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand/60 focus:ring-4 focus:ring-brand/15"
      />
      <ShortcutHint className="absolute top-1/2 right-4 -translate-y-1/2" />
    </form>
  );
}
