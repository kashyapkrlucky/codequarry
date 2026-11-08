import type { Metadata } from "next";
import { Suspense } from "react";
import { BrowserSkeleton } from "@/components/cheatsheets/browser-skeleton";
import { CheatsheetBrowser } from "@/components/cheatsheets/cheatsheet-browser";
import { Container } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Explore cheatsheets",
  description: "Search and filter every CodeQuarry cheatsheet by category, technology, and difficulty.",
  alternates: { canonical: "/explore" },
  openGraph: { title: "Explore cheatsheets", url: "/explore" },
};

export default function ExplorePage({ searchParams }: PageProps<"/explore">) {
  return (
    <Container className="py-10">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Explore</h1>
        <p className="text-muted-foreground">Every cheatsheet, searchable and filterable. Filters are shareable URLs.</p>
      </header>
      <Suspense fallback={<BrowserSkeleton />}>
        <CheatsheetBrowser basePath="/explore" searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
