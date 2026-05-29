import { describe, it, expect } from "vitest";
import { computeStyle } from "../../src/core/style";

describe("computeStyle", () => {
  it("returns valid DimensionScore", () => {
    const signals: any[] = [];
    const result = computeStyle(
      "The project launched successfully. We deployed to production. Tests passed. Metrics look good. Users are happy.",
      signals
    );
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.weight).toBe(0.20);
  });

  it("flags text heavy with AI template phrases", () => {
    const signals: any[] = [];
    const result = computeStyle(
      "In conclusion, it is important to note that furthermore, moreover, at the end of the day, needless to say, first and foremost.",
      signals
    );
    const templateSig = signals.find((s: any) => s.name === "template_rate");
    expect(templateSig?.flag).toBe(true);
  });

  it("pushes all 4 signals into allSignals", () => {
    const signals: any[] = [];
    computeStyle("Hello world. This is a test. Testing is good.", signals);
    const names = signals.map((s: any) => s.name);
    expect(names).toContain("template_rate");
    expect(names).toContain("sentence_variance");
    expect(names).toContain("lexical_diversity");
    expect(names).toContain("readability");
  });
});
