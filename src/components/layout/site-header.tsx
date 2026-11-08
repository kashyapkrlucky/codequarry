import { GitHubIcon } from "@/components/brand/github-icon";
import { Logo } from "@/components/brand/logo";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { NavLinks } from "@/components/navigation/nav-links";
import { SearchTrigger } from "@/components/search/search-trigger";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="print-hidden sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto grid h-14 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-1">
          <MobileNav />
          <Logo />
        </div>
        <nav aria-label="Main" className="hidden md:block">
          <NavLinks />
        </nav>
        <div className="flex items-center justify-end gap-1.5">
          <SearchTrigger />
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild>
            <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer" aria-label="CodeQuarry on GitHub">
              <GitHubIcon className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
