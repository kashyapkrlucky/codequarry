import GithubSlugger from "github-slugger";

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** Strips inline markdown so heading text matches what rehype-slug sees. */
export function plainHeadingText(raw: string): string {
  return raw
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/**
 * Extracts h2/h3 headings from MDX source, skipping fenced code blocks.
 * Uses the same slug algorithm (github-slugger) as rehype-slug so ids line up.
 */
export function extractToc(source: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let fence: string | null = null;

  for (const line of source.split("\n")) {
    const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
      continue;
    }
    if (fence) continue;

    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!heading) continue;
    const depth = heading[1].length;
    const text = plainHeadingText(heading[2]);
    // Every heading advances the slugger so duplicate-suffixes match rehype-slug.
    const id = slugger.slug(text);
    if (depth === 2 || depth === 3) items.push({ id, text, depth });
  }
  return items;
}
