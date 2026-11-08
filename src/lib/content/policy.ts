/**
 * Content safety policy shared by the ingestion validator and the MDX renderer.
 *
 * Content is stored as MDX source but treated as *data*: no ESM imports/exports,
 * no JavaScript expressions, and only an explicit allow-list of components.
 */

/** Custom components authors may use in MDX. */
export const ALLOWED_COMPONENTS = ["Callout", "Kbd", "Steps", "Step"] as const;

/** Intrinsic HTML elements authors may write directly as JSX. */
export const ALLOWED_HTML_ELEMENTS = new Set([
  "a", "abbr", "b", "blockquote", "br", "code", "dd", "del", "details", "div",
  "dl", "dt", "em", "figcaption", "figure", "h2", "h3", "h4", "hr", "i", "img",
  "ins", "kbd", "li", "mark", "ol", "p", "pre", "s", "samp", "small", "span",
  "strong", "sub", "summary", "sup", "table", "tbody", "td", "th", "thead", "tr",
  "u", "ul", "var",
]);

export const CALLOUT_TYPES = ["info", "tip", "warning", "danger"] as const;
export type CalloutType = (typeof CALLOUT_TYPES)[number];

const ALLOWED_ATTRIBUTES = new Set([
  "type", "title", "href", "src", "alt", "width", "height", "colSpan", "rowSpan",
  "open", "align", "id", "lang",
]);

export function isAllowedAttribute(name: string): boolean {
  return ALLOWED_ATTRIBUTES.has(name);
}

export function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("mailto:")
  );
}
