import type { Metadata } from "next";
import { CategoryCard } from "@/components/categories/category-card";
import { Container, EmptyState } from "@/components/layout/section";
import { getCategories } from "@/db/queries/categories";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse CodeQuarry references by domain — languages, frontend, backend, databases, DevOps, and computer science.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <Container className="py-10">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Pick a domain to see its cheatsheets and subcategories.</p>
      </header>
      {categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Seed the database to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <CategoryCard key={c.slug} category={c} parentName={categories.find((p) => p.slug === c.parentSlug)?.name} />
          ))}
        </div>
      )}
    </Container>
  );
}
