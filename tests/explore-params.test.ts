import { describe, expect, it } from "vitest";
import { buildExploreHref, parseExploreParams, toggleValue } from "@/lib/validation/explore";

describe("explore params", () => {
  it("parses valid params and drops invalid values", () => {
    const parsed = parseExploreParams({ q: " react ", tech: "react,Not Valid,react", difficulty: ["beginner", "expert"], page: "-3", sort: "weird" });
    expect(parsed).toMatchObject({ q: "react", tech: ["react"], difficulty: ["beginner"], page: 1, sort: undefined, view: "grid" });
  });

  it("round-trips into a canonical URL", () => {
    expect(buildExploreHref("/explore", { q: "sql", tech: ["sql", "postgresql"], page: 2 })).toBe("/explore?q=sql&tech=sql%2Cpostgresql&page=2");
    expect(buildExploreHref("/explore", { page: 1, view: "grid" })).toBe("/explore");
  });

  it("toggles filter values", () => {
    expect(toggleValue(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleValue(["a", "b"], "a")).toEqual(["b"]);
  });
});
