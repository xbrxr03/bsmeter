import { describe, it, expect } from "vitest";
import { bsScore } from "../../src/core/index";

describe("content-seo domain", () => {
  it("returns valid result for blog content", () => {
    const result = bsScore(
      "React hooks were introduced in version 16.8. " +
      "They allow you to use state and other React features without writing a class component. " +
      "The useState hook takes an initial value and returns a pair: current state and a setter function.",
      { domain: "content-seo", context: { title: "React Hooks Explained" } }
    );
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.domainSpecific.signals).toContain("title_body_divergence");
  });

  it("flags keyword stuffing", () => {
    const stuffed = "best best best SEO SEO SEO content content content marketing marketing marketing strategy strategy strategy";
    const result = bsScore(stuffed, { domain: "content-seo" });
    const sig = result.signals.find(s => s.name === "keyword_stuffing");
    expect(sig?.flag).toBe(true);
  });
});
