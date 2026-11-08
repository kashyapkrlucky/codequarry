import type { Metadata } from "next";
import { BookmarksList } from "@/components/bookmarks/bookmarks-list";
import { Container } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Your saved CodeQuarry cheatsheets.",
  alternates: { canonical: "/bookmarks" },
  robots: { index: false, follow: true },
};

export default function BookmarksPage() {
  return (
    <Container className="max-w-4xl py-10">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Bookmarks</h1>
        <p className="text-muted-foreground">Cheatsheets you saved on this device.</p>
      </header>
      <BookmarksList />
    </Container>
  );
}
