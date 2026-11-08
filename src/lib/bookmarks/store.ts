/**
 * Bookmark persistence behind a small interface so an authenticated,
 * server-backed implementation can replace localStorage later without
 * touching UI components (they only use the `useBookmarks` hook).
 */
export interface BookmarkStore {
  getSnapshot(): readonly string[];
  add(slug: string): void;
  remove(slug: string): void;
  subscribe(listener: () => void): () => void;
}

const STORAGE_KEY = "codequarry:bookmarks:v1";
const MAX_BOOKMARKS = 200;
const EMPTY: readonly string[] = Object.freeze([]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createLocalBookmarkStore(): BookmarkStore {
  let cache: readonly string[] | null = null;
  const listeners = new Set<() => void>();

  const read = (): readonly string[] => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string" && SLUG.test(s)) : [];
    } catch {
      return [];
    }
  };

  const write = (next: readonly string[]) => {
    cache = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage may be full or disabled (private mode); keep the in-memory value.
    }
    listeners.forEach((l) => l());
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cache = read();
    listeners.forEach((l) => l());
  };

  return {
    getSnapshot() {
      if (typeof window === "undefined") return EMPTY;
      cache ??= read();
      return cache;
    },
    add(slug) {
      const current = this.getSnapshot();
      if (!SLUG.test(slug) || current.includes(slug)) return;
      write([slug, ...current].slice(0, MAX_BOOKMARKS));
    },
    remove(slug) {
      write(this.getSnapshot().filter((s) => s !== slug));
    },
    subscribe(listener) {
      if (listeners.size === 0) window.addEventListener("storage", onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
  };
}

export const SERVER_SNAPSHOT = EMPTY;
