"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// The dialog (cmdk + results UI) is only downloaded the first time search opens.
const SearchDialog = dynamic(() => import("./search-dialog").then((m) => m.SearchDialog), { ssr: false });

interface SearchContextValue {
  open: (initialQuery?: string) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used inside <SearchProvider>");
  return ctx;
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  // Remount the dialog per explicit open so it starts from `initialQuery`.
  const [session, setSession] = useState(0);

  const open = useCallback((query = "") => {
    setInitialQuery(query);
    setSession((n) => n + 1);
    setHasOpened(true);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setHasOpened(true);
        setIsOpen((v) => !v);
        return;
      }
      // "/" opens search unless the user is typing somewhere.
      const target = event.target as HTMLElement | null;
      const typing = target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if (event.key === "/" && !typing) {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <SearchContext.Provider value={value}>
      {children}
      {hasOpened && <SearchDialog key={session} open={isOpen} onOpenChange={setIsOpen} initialQuery={initialQuery} />}
    </SearchContext.Provider>
  );
}
