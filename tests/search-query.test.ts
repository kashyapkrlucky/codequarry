import { describe, expect, it } from "vitest";
import { HIGHLIGHT_END, HIGHLIGHT_START, splitHighlights, tokenize, toPrefixTsQuery } from "@/lib/search/query";

describe("toPrefixTsQuery", () => {
  it("builds AND-ed prefix terms", () => {
    expect(toPrefixTsQuery("Docker compose")).toBe("docker:* & compose:*");
  });

  it("strips tsquery operators and punctuation from user input", () => {
    expect(toPrefixTsQuery("a' | b:* & !c (d)")).toBe("a:* & b:* & c:* & d:*");
  });

  it("returns null when nothing searchable remains", () => {
    expect(toPrefixTsQuery("  !!! ")).toBeNull();
  });

  it("dedupes and caps the number of terms", () => {
    expect(tokenize("a a b c d e f g h i j")).toHaveLength(8);
  });
});

describe("splitHighlights", () => {
  it("splits marker-wrapped matches into segments", () => {
    const value = `Use ${HIGHLIGHT_START}generics${HIGHLIGHT_END} wisely`;
    expect(splitHighlights(value)).toEqual([
      { text: "Use ", match: false },
      { text: "generics", match: true },
      { text: " wisely", match: false },
    ]);
  });

  it("treats markup as plain text", () => {
    expect(splitHighlights("<img onerror=x>")).toEqual([{ text: "<img onerror=x>", match: false }]);
  });
});
