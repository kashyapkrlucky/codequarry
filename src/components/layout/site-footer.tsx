import Link from "next/link";
import { GitHubIcon } from "@/components/brand/github-icon";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { getCategories } from "@/db/queries/categories";

export async function SiteFooter() {
  const categories = (await getCategories()).filter((c) => !c.parentSlug).slice(0, 8);
  return (
    <footer className="print-hidden mt-24 border-t bg-surface/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Practical, searchable engineering references. {siteConfig.tagline}
          </p>
        </div>
        <FooterColumn title="Categories">
          {categories.map((c) => (
            <FooterLink key={c.slug} href={`/categories/${c.slug}`}>{c.name}</FooterLink>
          ))}
        </FooterColumn>
        <FooterColumn title="Product">
          <FooterLink href="/explore">Explore</FooterLink>
          <FooterLink href="/categories">All categories</FooterLink>
          <FooterLink href="/bookmarks">Bookmarks</FooterLink>
          <FooterLink href="/about">About CodeQuarry</FooterLink>
        </FooterColumn>
        <FooterColumn title="Project">
          <li>
            <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <GitHubIcon className="size-3.5" /> GitHub
            </a>
          </li>
          <FooterLink href="/privacy">Privacy</FooterLink>
          <FooterLink href="/terms">Terms</FooterLink>
        </FooterColumn>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © 2026 CodeQuarry. Content is provided for reference; verify against official documentation for production use.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold tracking-wider text-foreground uppercase">{title}</h2>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">{children}</Link>
    </li>
  );
}
