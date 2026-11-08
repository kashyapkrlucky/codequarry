import { ChevronRight, Clock, ListTree } from "lucide-react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategorySidebar } from "@/components/cheatsheets/category-sidebar";
import { CheatsheetCard } from "@/components/cheatsheets/cheatsheet-card";
import { DifficultyBadge } from "@/components/cheatsheets/difficulty-badge";
import { FeedbackWidget } from "@/components/cheatsheets/feedback-widget";
import { PrevNext } from "@/components/cheatsheets/prev-next";
import { ReadingProgress } from "@/components/cheatsheets/reading-progress";
import { BookmarkButton, CopyLinkButton, PrintButton, ShareButton } from "@/components/cheatsheets/sheet-actions";
import { TableOfContents } from "@/components/cheatsheets/table-of-contents";
import { ViewTracker } from "@/components/cheatsheets/view-tracker";
import { MdxContent } from "@/components/content/mdx-content";
import { Container } from "@/components/layout/section";
import { JsonLd } from "@/components/seo/json-ld";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories } from "@/db/queries/categories";
import { getCategorySiblings, getCheatsheetBySlug, getPublishedSlugs, getRelatedCheatsheets } from "@/db/queries/cheatsheets";
import { CONTENT_TAG } from "@/db/queries/categories";
import { extractToc } from "@/lib/content/toc";
import { formatDate } from "@/lib/format";
import { cheatsheetJsonLd } from "@/lib/seo/structured-data";

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  // Cache Components requires at least one param; the placeholder resolves to a 404.
  return slugs.length ? slugs.map(({ slug }) => ({ slug })) : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: PageProps<"/cheatsheets/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const sheet = await getCheatsheetBySlug(slug);
  if (!sheet) return { title: "Cheatsheet not found", robots: { index: false } };
  const url = `/cheatsheets/${sheet.slug}`;
  return {
    title: sheet.title,
    description: sheet.description,
    keywords: sheet.tags.map((t) => t.name),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: sheet.title,
      description: sheet.description,
      url,
      publishedTime: (sheet.publishedAt ?? sheet.updatedAt).toISOString(),
      modifiedTime: new Date(sheet.updatedAt).toISOString(),
      section: sheet.category.name,
      tags: sheet.tags.map((t) => t.name),
    },
    twitter: { card: "summary_large_image", title: sheet.title, description: sheet.description },
  };
}

/** The compiled article body is cached separately: MDX compilation + Shiki are the expensive parts. */
async function ArticleBody({ slug, source }: { slug: string; source: string }) {
  "use cache";
  cacheLife("days");
  cacheTag(CONTENT_TAG, `cheatsheet:${slug}`);
  return <MdxContent source={source} />;
}

async function CheatsheetView({ params }: PageProps<"/cheatsheets/[slug]">) {
  const { slug } = await params;
  const sheet = await getCheatsheetBySlug(slug);
  if (!sheet) notFound();

  const [siblings, related, categories] = await Promise.all([
    getCategorySiblings(sheet.categoryId, sheet.slug),
    getRelatedCheatsheets(sheet.id, 3),
    getCategories(),
  ]);
  const toc = extractToc(sheet.content);

  return (
    <>
      <JsonLd data={cheatsheetJsonLd(sheet)} />
      <ViewTracker slug={sheet.slug} />
      <div className="grid gap-10 lg:grid-cols-[13.5rem_minmax(0,1fr)] xl:grid-cols-[13.5rem_minmax(0,1fr)_13.5rem]">
        <aside className="print-hidden hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pr-2 pb-6">
            <CategorySidebar nav={{ current: sheet.category, activeSlug: sheet.slug, siblings: siblings.items, categories: categories.filter((c) => c.cheatsheetCount > 0) }} />
          </div>
        </aside>

        <article className="min-w-0 max-w-3xl space-y-10">
          <header className="space-y-5 border-b pb-8">
            <nav aria-label="Breadcrumb" className="print-hidden flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <Link href="/explore" className="hover:text-foreground">Cheatsheets</Link>
              {sheet.parentCategory && (
                <>
                  <ChevronRight className="size-3" />
                  <Link href={`/categories/${sheet.parentCategory.slug}`} className="hover:text-foreground">{sheet.parentCategory.name}</Link>
                </>
              )}
              <ChevronRight className="size-3" />
              <Link href={`/categories/${sheet.category.slug}`} className="hover:text-foreground">{sheet.category.name}</Link>
            </nav>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{sheet.title}</h1>
              <p className="text-base text-pretty text-muted-foreground sm:text-lg">{sheet.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <DifficultyBadge level={sheet.difficulty} className="text-sm" />
              <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" /> {sheet.readingTime} min read</span>
              <span>Updated <time dateTime={new Date(sheet.updatedAt).toISOString()}>{formatDate(sheet.updatedAt)}</time></span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
                {sheet.technologies.map((t) => (
                  <li key={`tech-${t.slug}`}>
                    <Link href={`/explore?tech=${t.slug}`} className="rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 text-xs font-medium hover:border-brand/60">{t.name}</Link>
                  </li>
                ))}
                {sheet.tags.map((t) => (
                  <li key={t.slug} className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground">#{t.name}</li>
                ))}
              </ul>
              <div className="print-hidden flex items-center gap-1">
                <BookmarkButton slug={sheet.slug} title={sheet.title} />
                <ShareButton title={sheet.title} text={sheet.description} />
                <CopyLinkButton />
                <PrintButton />
              </div>
            </div>
          </header>

          {toc.length > 0 && (
            <details className="print-hidden group rounded-xl border bg-surface/50 xl:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <ListTree className="size-4 text-muted-foreground" /> On this page
                <ChevronRight className="ml-auto size-4 transition-transform group-open:rotate-90" />
              </summary>
              <ul className="space-y-1 border-t px-4 py-3 text-sm">
                {toc.map((item) => (
                  <li key={item.id} className={item.depth === 3 ? "pl-4" : ""}>
                    <a href={`#${item.id}`} className="text-muted-foreground hover:text-foreground">{item.text}</a>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <ArticleBody slug={sheet.slug} source={sheet.content} />

          <FeedbackWidget slug={sheet.slug} />
          <PrevNext previous={siblings.previous} next={siblings.next} />

          {related.length > 0 && (
            <section aria-labelledby="related-heading" className="print-hidden space-y-4">
              <h2 id="related-heading" className="text-lg font-semibold tracking-tight">Related cheatsheets</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {related.map((r) => <CheatsheetCard key={r.slug} sheet={r} showTags={false} />)}
              </div>
            </section>
          )}
        </article>

        <aside className="print-hidden hidden xl:block">
          <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pb-6">
            <TableOfContents items={toc} />
          </div>
        </aside>
      </div>
    </>
  );
}

function CheatsheetSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[13.5rem_minmax(0,1fr)] xl:grid-cols-[13.5rem_minmax(0,1fr)_13.5rem]" aria-busy="true">
      <div className="hidden space-y-2 lg:block">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-5 w-4/5" />)}</div>
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function CheatsheetPage(props: PageProps<"/cheatsheets/[slug]">) {
  return (
    <>
      <ReadingProgress />
      <Container className="py-10">
        <Suspense fallback={<CheatsheetSkeleton />}>
          <CheatsheetView {...props} />
        </Suspense>
      </Container>
    </>
  );
}
