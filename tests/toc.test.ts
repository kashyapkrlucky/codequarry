import { describe, expect, it } from "vitest";
import { extractToc } from "@/lib/content/toc";

describe("extractToc", () => {
  it("collects h2/h3 headings with github-slugger ids and skips code fences", () => {
    const source = ["## Basic types", "```bash", "## not a heading", "```", "### `useEffect` hook", "## Basic types"].join("\n");
    expect(extractToc(source)).toEqual([
      { id: "basic-types", text: "Basic types", depth: 2 },
      { id: "useeffect-hook", text: "useEffect hook", depth: 3 },
      { id: "basic-types-1", text: "Basic types", depth: 2 },
    ]);
  });
});
