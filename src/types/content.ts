import type { DifficultyLevel } from "@/lib/validation/content";

export type { DifficultyLevel };

export interface CategoryRef {
  slug: string;
  name: string;
  icon: string;
}

export interface TagRef {
  slug: string;
  name: string;
}

export interface TechnologyRef {
  slug: string;
  name: string;
  icon: string;
}

export interface CategoryWithCount extends CategoryRef {
  id: string;
  description: string;
  parentSlug: string | null;
  sortOrder: number;
  cheatsheetCount: number;
}

export interface CheatsheetSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  readingTime: number;
  updatedAt: Date;
  publishedAt: Date | null;
  category: CategoryRef;
  tags: TagRef[];
}

export interface CheatsheetDetail extends CheatsheetSummary {
  content: string;
  viewCount: number;
  categoryId: string;
  parentCategory: CategoryRef | null;
  technologies: TechnologyRef[];
}

export type SortOption = "relevance" | "latest" | "popular" | "alphabetical";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface SearchHit {
  slug: string;
  title: string;
  /** Description with matches wrapped in HIGHLIGHT_START / HIGHLIGHT_END markers. */
  description: string;
  /** Content excerpt around the match, same marker format. */
  excerpt: string;
  category: CategoryRef;
}

export interface SearchResponse {
  query: string;
  hits: SearchHit[];
}
