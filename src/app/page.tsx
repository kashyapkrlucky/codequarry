import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CategoryCard } from "@/components/categories/category-card";
import { CheatsheetCard } from "@/components/cheatsheets/cheatsheet-card";
import { Container, EmptyState, SectionHeading } from "@/components/layout/section";
import { HeroSearch } from "@/components/search/hero-search";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { getCategories } from "@/db/queries/categories";
import { getFeaturedCheatsheets, getLatestCheatsheets } from "@/db/queries/cheatsheets";
import { websiteJsonLd } from "@/lib/seo/structured-data";

export default async function HomePage() {
  const [categories, featured, latest] = await Promise.all([
    getCategories(),
    getFeaturedCheatsheets(6),
    getLatestCheatsheets(6),
  ]);
  const popular = categories.slice(0, 10);

  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <section className="border-b bg-[radial-gradient(60rem_24rem_at_50%_-6rem,color-mix(in_oklab,var(--brand)_10%,transparent),transparent)]">
        <Container className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
          <p className="rounded-full border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
            {siteConfig.tagline}
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Everything You Need to Know. <span className="text-brand">One Developer Reference.</span>
          </h1>
          <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            Explore practical cheatsheets, technical concepts, and engineering references. Find answers faster. Build better software.
          </p>
          <HeroSearch />
          <Link href="/categories" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            Explore categories <ArrowRight className="size-3.5" />
          </Link>
        </Container>
      </section>

      <Container className="space-y-16 pt-14">
        <section aria-labelledby="categories-heading">
          <SectionHeading id="categories-heading" title="Popular categories" description="Start from a domain and drill down." href="/categories" linkLabel="All categories" />
          {popular.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {popular.map((c) => <CategoryCard key={c.slug} category={c} />)}
            </div>
          ) : (
            <EmptyState title="No categories yet" description="Run `npm run db:seed` to import the initial content." />
          )}
        </section>

        {featured.length > 0 && (
          <section aria-labelledby="featured-heading">
            <SectionHeading id="featured-heading" title="Featured cheatsheets" description="Hand-picked references developers reach for most." href="/explore?sort=popular" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((s) => <CheatsheetCard key={s.slug} sheet={s} />)}
            </div>
          </section>
        )}

        {latest.length > 0 && (
          <section aria-labelledby="latest-heading">
            <SectionHeading id="latest-heading" title="Recently added" href="/explore?sort=latest" />
            <div className="grid gap-3">
              {latest.map((s) => <CheatsheetCard key={s.slug} sheet={s} layout="list" showTags={false} />)}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
