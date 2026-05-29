import { describe, expect, it } from "vitest";
import { scoreStyle } from "../../src/core/style";
import { lexicalDiversity } from "../../src/signals/lexical-diversity";
import { sentenceLengthVariance } from "../../src/signals/sentence-variance";
import { templateRate } from "../../src/signals/template-rate";

const templated = "It is important to note that this comprehensive guide will help you unlock the power of productivity. Furthermore, it can streamline your workflow. In conclusion, this robust solution can take it to the next level.";
const natural = "Nora deleted the retry loop. The patch is small, but it removes a noisy alert that paged support twice last week. Metrics showed each webhook had already been acknowledged before the second queue attempt, so the worker now records that state explicitly.";

describe("style quality", () => {
  it("detects known template phrases", () => {
    expect(templateRate(templated)).toBeGreaterThan(templateRate(natural));
  });

  it("detects low lexical diversity", () => {
    expect(lexicalDiversity("value value value solution solution solution")).toBeLessThan(lexicalDiversity(natural));
  });

  it("detects flatter sentence rhythm", () => {
    expect(sentenceLengthVariance("This is useful. This is helpful. This is simple.")).toBeLessThan(sentenceLengthVariance(natural));
  });

  it("scores templated prose worse than natural prose", () => {
    expect(scoreStyle(templated).score).toBeGreaterThan(scoreStyle(natural).score);
  });
});
