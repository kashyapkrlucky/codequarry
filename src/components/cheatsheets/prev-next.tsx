import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

type Item = { slug: string; title: string } | null;

export function PrevNext({ previous, next }: { previous: Item; next: Item }) {
  if (!previous && !next) return null;
  return (
    <nav aria-label="Previous and next cheatsheets" className="print-hidden grid gap-3 sm:grid-cols-2">
      {previous ? (
        <Link href={`/cheatsheets/${previous.slug}`} rel="prev" className="group rounded-xl border p-4 transition-colors hover:border-brand/45">
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowLeft className="size-3" /> Previous</span>
          <span className="mt-1 block font-medium">{previous.title}</span>
        </Link>
      ) : <span />}
      {next && (
        <Link href={`/cheatsheets/${next.slug}`} rel="next" className="group rounded-xl border p-4 text-right transition-colors hover:border-brand/45">
          <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">Next <ArrowRight className="size-3" /></span>
          <span className="mt-1 block font-medium">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
