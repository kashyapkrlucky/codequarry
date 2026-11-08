import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getDb, isDatabaseConfigured } from "@/db";
import { HIGHLIGHT_END, HIGHLIGHT_START, toPrefixTsQuery } from "@/lib/search/query";
import type { SearchHit } from "@/types/content";
import { CONTENT_TAG } from "./categories";

interface SearchRow {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category_slug: string;
  category_name: string;
  category_icon: string;
}

const DESCRIPTION_OPTS = `StartSel="${HIGHLIGHT_START}", StopSel="${HIGHLIGHT_END}", HighlightAll=true`;
const EXCERPT_OPTS = `StartSel="${HIGHLIGHT_START}", StopSel="${HIGHLIGHT_END}", MaxWords=16, MinWords=8, MaxFragments=1`;

/**
 * Global search (excerpts come from prose only; code fences are stripped): ranks the top matches by full-text relevance in a subquery,
 * then computes highlighted snippets only for those rows (ts_headline is costly).
 */
export async function searchCheatsheets(query: string, limit = 12): Promise<SearchHit[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CONTENT_TAG);
  if (!isDatabaseConfigured()) return [];

  const tsquery = toPrefixTsQuery(query);
  if (!tsquery) return [];
  const pattern = `%${query.trim().slice(0, 100).replace(/[\\%_]/g, "\\$&")}%`;

  const rows = await getDb().$queryRaw<SearchRow[]>`
    WITH q AS (SELECT to_tsquery('english', ${tsquery}) AS query),
    top AS (
      SELECT c.id,
             ts_rank_cd(c.search_vector, q.query) + CASE WHEN c.title ILIKE ${pattern} THEN 1 ELSE 0 END AS rank
      FROM cheatsheets c, q
      WHERE c.status = 'published'
        AND (c.search_vector @@ q.query OR c.title ILIKE ${pattern})
      ORDER BY rank DESC, c.title ASC
      LIMIT ${limit}
    )
    SELECT c.slug, c.title,
           ts_headline('english', c.description, q.query, ${DESCRIPTION_OPTS}) AS description,
           ts_headline('english', regexp_replace(regexp_replace(regexp_replace(c.content, '\`\`\`.*?\`\`\`', ' ', 'g'), '</?[A-Za-z][^>]*>', ' ', 'g'), '[#*_|<>\\[\\]\`-]+', ' ', 'g'), q.query, ${EXCERPT_OPTS}) AS excerpt,
           cat.slug AS category_slug, cat.name AS category_name, cat.icon AS category_icon
    FROM top
    JOIN cheatsheets c ON c.id = top.id
    JOIN categories cat ON cat.id = c.category_id
    CROSS JOIN q
    ORDER BY top.rank DESC, c.title ASC`;

  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    description: r.description,
    excerpt: r.excerpt.replace(/\s+/g, " ").trim(),
    category: { slug: r.category_slug, name: r.category_name, icon: r.category_icon },
  }));
}
