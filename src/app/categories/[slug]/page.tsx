import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BrowserSkeleton } from "@/components/cheatsheets/browser-skeleton";
import { CheatsheetBrowser } from "@/components/cheatsheets/cheatsheet-browser";
import { Container } from "@/components/layout/section";
import { JsonLd } from "@/components/seo/json-ld";
import { Skeleton } from "@/components/ui/skeleton";
import { IconByName } from "@/config/icons";
import { getCategories, getCategoryBySlug } from "@/db/queries/categories";
import { pluralize } from "@/lib/format";
import { collectionJsonLd } from "@/lib/seo/structured-data";

export async function generateStaticParams() {
  const categories = await getCategories();
  // Cache Components requires at least one param; the placeholder resolves to a 404.
  return categories.length ? categories.map((c) => ({ slug: c.slug })) : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found", robots: { index: false } };
  const title = `${category.name} cheatsheets`;
  return {
    title,
    description: category.description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: { title, description: category.description, url: `/categories/${category.slug}` },
    twitter: { title, description: category.description },
  };
}

async function CategoryContent({ params, searchParams }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <>
      <JsonLd data={collectionJsonLd(`${category.name} cheatsheets`, category.description, `/categories/${category.slug}`)} />
      <header className="mb-10 space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link href="/categories" className="hover:text-foreground">Categories</Link>
          {category.parent && (
            <>
              <ChevronRight className="size-3" />
              <Link href={`/categories/${category.parent.slug}`} className="hover:text-foreground">{category.parent.name}</Link>
            </>
          )}
        </nav>
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl border bg-surface text-brand">
            <IconByName name={category.icon} className="size-6" />
          </span>
          <div className="space-y-1.5">
            <h1 className="text-3xl font-semibold tracking-tight">{category.name}</h1>
            <p className="max-w-2xl text-muted-foreground">{category.description}</p>
            <p className="font-mono text-xs text-muted-foreground">{pluralize(category.cheatsheetCount, "cheatsheet")}</p>
          </div>
        </div>
        {category.children.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold tracking-wider uppercase">Subcategories</span>
            {category.children.map((child) => (
              <Link key={child.slug} href={`/categories/${child.slug}`} className="rounded-md border bg-card px-2.5 py-1 text-sm hover:border-brand/45">
                {child.name} <span className="font-mono text-xs text-muted-foreground">{child.cheatsheetCount}</span>
              </Link>
            ))}
          </div>
        )}
      </header>
      <CheatsheetBrowser
        basePath={`/categories/${category.slug}`}
        searchParams={searchParams}
        lockedCategory={category.slug}
        searchPlaceholder={`Search ${category.name}…`}
      />
    </>
  );
}

export default function CategoryPage(props: PageProps<"/categories/[slug]">) {
  return (
    <Container className="py-10">
      <Suspense
        fallback={
          <>
            <div className="mb-10 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-72" />
              <Skeleton className="h-5 w-full max-w-xl" />
            </div>
            <BrowserSkeleton />
          </>
        }
      >
        <CategoryContent {...props} />
      </Suspense>
    </Container>
  );
}
