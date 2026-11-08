import { describe, expect, it } from "vitest";
import { validateMdxSource } from "@/lib/content/validate-mdx";

describe("validateMdxSource", () => {
  it("accepts markdown, GFM tables, code and allow-listed components", () => {
    const source = [
      "## Heading",
      "| a | b |",
      "| --- | --- |",
      "| `x` | y |",
      "",
      "```ts",
      "const obj = { a: 1 }; // braces inside code are fine",
      "```",
      "",
      '<Callout type="tip">Use <Kbd>⌘K</Kbd> to search.</Callout>',
    ].join("\n");
    expect(validateMdxSource(source)).toEqual([]);
  });

  it.each([
    ["ESM imports", 'import x from "y"\n\n# Hi'],
    ["JS expressions", "Total: {1 + 1}"],
    ["unknown components", "<Danger />"],
    ["script tags", "<script>alert(1)</script>"],
    ["iframes", '<iframe src="https://evil.example" />'],
    ["javascript: links", "[click](javascript:alert(1))"],
    ["event-handler attributes", '<div onClick="steal()">x</div>'],
    ["attribute expressions", "<Callout type={evil}>x</Callout>"],
    ["invalid callout types", '<Callout type="rainbow">x</Callout>'],
  ])("rejects %s", (_label, source) => {
    expect(validateMdxSource(source).length).toBeGreaterThan(0);
  });
});
