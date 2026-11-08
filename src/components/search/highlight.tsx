import { splitHighlights } from "@/lib/search/query";

/** Renders ts_headline output safely — markers become <mark>, everything else is text. */
export function Highlight({ value, className }: { value: string; className?: string }) {
  return (
    <span className={className}>
      {splitHighlights(value).map((segment, i) =>
        segment.match ? (
          <mark key={i} className="rounded-sm bg-brand/20 px-0.5 text-foreground">
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </span>
  );
}
