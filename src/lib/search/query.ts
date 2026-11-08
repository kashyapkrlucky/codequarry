/** Markers wrapped around matched terms by ts_headline; rendered as <mark> in the UI. */
export const HIGHLIGHT_START = "⁣[[";
export const HIGHLIGHT_END = "]]⁣";

export const MAX_QUERY_LENGTH = 100;

/** Normalises free-text input into lowercase alphanumeric search terms. */
export function tokenize(input: string): string[] {
  const terms = input.slice(0, MAX_QUERY_LENGTH).toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return [...new Set(terms)].slice(0, 8);
}

/**
 * Builds a PostgreSQL tsquery string with prefix matching ("dock" → "dock:*")
 * so search-as-you-type matches partial words. Only alphanumeric tokens are
 * emitted, so the result can never contain tsquery operators from user input.
 * The string is still passed as a bound parameter, never interpolated.
 */
export function toPrefixTsQuery(input: string): string | null {
  const terms = tokenize(input);
  if (terms.length === 0) return null;
  return terms.map((t) => `${t}:*`).join(" & ");
}

export interface HighlightSegment {
  text: string;
  match: boolean;
}

/** Splits a marker-annotated string into plain/matched segments for safe rendering. */
export function splitHighlights(value: string): HighlightSegment[] {
  const segments: HighlightSegment[] = [];
  let rest = value;
  while (rest.length > 0) {
    const start = rest.indexOf(HIGHLIGHT_START);
    if (start === -1) {
      segments.push({ text: rest, match: false });
      break;
    }
    if (start > 0) segments.push({ text: rest.slice(0, start), match: false });
    const end = rest.indexOf(HIGHLIGHT_END, start + HIGHLIGHT_START.length);
    if (end === -1) {
      segments.push({ text: rest.slice(start + HIGHLIGHT_START.length), match: true });
      break;
    }
    segments.push({ text: rest.slice(start + HIGHLIGHT_START.length, end), match: true });
    rest = rest.slice(end + HIGHLIGHT_END.length);
  }
  return segments.filter((s) => s.text.length > 0);
}
