import { describe, it, expect } from "vitest";
import { bsScore } from "../../src/core/index";

describe("social-news domain", () => {
  it("flags clickbait headlines", () => {
    const result = bsScore(
      "Some content about a study that found interesting results.",
      { domain: "social-news", context: { title: "You won't believe what doctors found" } }
    );
    const headlineSig = result.signals.find(s => s.name === "headline_scan");
    expect(headlineSig?.flag).toBe(true);
  });

  it("gives lower score to well-sourced news", () => {
    const sourced = bsScore(
      "According to a report published by the WHO on January 15, 2025, " +
      "Dr. Jane Smith confirmed that vaccine efficacy rates reached 94% in the latest trial. " +
      "The study, available at https://who.int/reports/2025-vaccine, involved 50,000 participants across 12 countries.",
      { domain: "social-news", context: { title: "WHO Vaccine Study Results" } }
    );
    const unsourced = bsScore(
      "Vaccines might possibly be effective in some cases according to some people who said something somewhere. " +
      "Experts believe that perhaps the results could indicate something. " +
      "It seems that this is a complex topic with many factors to consider.",
      { domain: "social-news", context: { title: "Vaccine Update" } }
    );
    expect(sourced.score).toBeLessThan(unsourced.score);
  });
});
