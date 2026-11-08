import type { CategoryRef, CategoryWithCount } from "@/types/content";

export interface CategoriesNav {
  current: CategoryRef;
  activeSlug: string;
  siblings: { slug: string; title: string }[];
  categories: CategoryWithCount[];
}
