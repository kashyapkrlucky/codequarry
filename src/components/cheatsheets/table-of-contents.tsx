"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/content/toc";
import { cn } from "@/lib/utils";

/** Tracks the heading closest to the top of the viewport. */
function useActiveHeading(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
        const firstVisible = elements.find((el) => visible.get(el.id));
        if (firstVisible) {
          setActive(firstVisible.id);
          return;
        }
        // Nothing in the band: pick the last heading above the viewport.
        const above = elements.filter((el) => el.getBoundingClientRect().top < 100);
        if (above.length) setActive(above[above.length - 1].id);
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: [0, 1] },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const active = useActiveHeading(items.map((i) => i.id));
  if (items.length === 0) return null;
  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 text-xs font-semibold tracking-wider uppercase">On this page</p>
      <ul className="space-y-0.5 border-l">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1 pr-2 leading-snug transition-colors",
                item.depth === 3 ? "pl-6 text-[13px]" : "pl-3",
                active === item.id
                  ? "border-brand font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
