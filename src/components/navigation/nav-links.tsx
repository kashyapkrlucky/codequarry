"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  const base = href.split("?")[0];
  if (href.includes("?")) return false; // query-variant links (Latest) never claim active state
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function NavLinks({ orientation = "horizontal", onNavigate }: { orientation?: "horizontal" | "vertical"; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className={cn("flex", orientation === "horizontal" ? "items-center gap-1" : "flex-col gap-1")}>
      {siteConfig.nav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                orientation === "vertical" && "py-2.5 text-base",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                active && orientation === "vertical" && "bg-muted",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
