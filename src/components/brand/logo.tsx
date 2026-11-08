import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Faceted "quarried stone" mark: a cut gem split into purple and cyan facets. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7", className)}>
      <rect width="32" height="32" rx="8" className="fill-foreground/[0.06]" />
      <path d="M16 6 25 13 16 26 7 13Z" fill="none" className="stroke-brand" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M7 13h18M16 6l-4 7 4 13 4-13-4-7" fill="none" className="stroke-brand" strokeWidth="1.25" strokeLinejoin="round" opacity="0.7" />
      <path d="M16 6 20 13 25 13Z" className="fill-brand-2" opacity="0.9" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 rounded-md font-semibold tracking-tight", className)}>
      <LogoMark />
      <span className="text-[15px]">
        Code<span className="text-brand">Quarry</span>
      </span>
      <span className="sr-only"> — {siteConfig.tagline}</span>
    </Link>
  );
}
