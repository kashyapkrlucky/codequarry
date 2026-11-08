"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createLocalBookmarkStore, SERVER_SNAPSHOT, type BookmarkStore } from "@/lib/bookmarks/store";

let store: BookmarkStore | null = null;
function getStore(): BookmarkStore {
  store ??= createLocalBookmarkStore();
  return store;
}

const subscribe = (listener: () => void) => getStore().subscribe(listener);
const getSnapshot = () => getStore().getSnapshot();
const getServerSnapshot = () => SERVER_SNAPSHOT;

export function useBookmarks() {
  const bookmarks = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isBookmarked = useCallback((slug: string) => bookmarks.includes(slug), [bookmarks]);
  const toggle = useCallback((slug: string) => {
    const s = getStore();
    if (s.getSnapshot().includes(slug)) s.remove(slug);
    else s.add(slug);
  }, []);
  const remove = useCallback((slug: string) => getStore().remove(slug), []);
  return { bookmarks, isBookmarked, toggle, remove };
}

/** True after hydration — used to avoid flashing "no bookmarks" before localStorage is read. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
