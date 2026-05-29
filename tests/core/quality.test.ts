import { describe, it, expect } from "vitest";
import { computeQuality } from "../../src/core/quality";

describe("computeQuality", () => {
  it("returns valid DimensionScore", () => {
    const signals: any[] = [];
    const result = computeQuality(
      "According to a study published in Nature, researchers at MIT found that carbon emissions increased by 12% in 2024.",
      { domain: "social-news" },
      signals
    );
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.weight).toBe(0.25);
  });

  it("includes source_grounding for social-news domain", () => {
    const signals: any[] = [];
    computeQuality("Some text here with claims.", { domain: "social-news" }, signals);
    const names = signals.map((s: any) => s.name);
    expect(names).toContain("source_grounding");
  });

  it("does not include source_grounding for content-seo domain", () => {
    const signals: any[] = [];
    computeQuality("Some text here.", { domain: "content-seo" }, signals);
    const names = signals.map((s: any) => s.name);
    expect(names).not.toContain("source_grounding");
  });
});
