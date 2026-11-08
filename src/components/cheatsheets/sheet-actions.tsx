"use client";

import { Bookmark, BookmarkCheck, Check, Link2, Printer, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useBookmarks, useHydrated } from "@/hooks/use-bookmarks";

export function BookmarkButton({ slug, title }: { slug: string; title: string }) {
  const { isBookmarked, toggle } = useBookmarks();
  const hydrated = useHydrated();
  const saved = hydrated && isBookmarked(slug);
  return (
    <Button
      variant={saved ? "secondary" : "outline"}
      size="sm"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from bookmarks` : `Bookmark ${title}`}
    >
      {saved ? <BookmarkCheck className="text-brand" /> : <Bookmark />}
      {saved ? "Saved" : "Bookmark"}
    </Button>
  );
}

function useFlag(): [boolean, () => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const id = window.setTimeout(() => setOn(false), 1600);
    return () => window.clearTimeout(id);
  }, [on]);
  return [on, () => setOn(true)];
}

export function CopyLinkButton() {
  const [copied, flag] = useFlag();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={copied ? "Link copied" : "Copy link"}
      title="Copy link"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href.split("#")[0]);
          flag();
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {copied ? <Check className="text-success" /> : <Link2 />}
    </Button>
  );
}

export function ShareButton({ title, text }: { title: string; text: string }) {
  const [copied, flag] = useFlag();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Share"
      title="Share"
      onClick={async () => {
        const url = window.location.href.split("#")[0];
        if (navigator.share) {
          try {
            await navigator.share({ title, text, url });
          } catch {
            /* user cancelled */
          }
          return;
        }
        try {
          await navigator.clipboard.writeText(url);
          flag();
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {copied ? <Check className="text-success" /> : <Share2 />}
    </Button>
  );
}

export function PrintButton() {
  return (
    <Button variant="ghost" size="icon-sm" aria-label="Print" title="Print" onClick={() => window.print()}>
      <Printer />
    </Button>
  );
}
