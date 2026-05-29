import { describe, it, expect } from "vitest";
import { computeDensity } from "../../src/core/density";

describe("computeDensity", () => {
  it("returns a DimensionScore with required fields", () => {
    const signals: any[] = [];
    const result = computeDensity("This is a test text with some meaningful content about technology and systems.", { domain: "content-seo" }, signals);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.weight).toBe(0.35);
    expect(Array.isArray(result.signals)).toBe(true);
    expect(typeof result.explanation).toBe("string");
  });

  it("includes diff_overlap signal for code-review with diff", () => {
    const signals: any[] = [];
    computeDensity("Updated the login function", { domain: "code-review", context: { diff: "+if (!user) return null;" } }, signals);
    const names = signals.map(s => s.name);
    expect(names).toContain("diff_overlap");
  });
});
