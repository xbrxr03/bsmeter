import { describe, expect, it } from "vitest";
import { scoreQuality } from "../../src/core/quality";
import { hedgingDensity } from "../../src/signals/hedging";
import { specificityScore } from "../../src/signals/specificity";

const hedged = "It seems this could possibly help in many ways. One might argue it may be useful.";
const direct = "On May 14, Stripe returned 37 duplicate invoice events for Acme Corp in the webhook retry queue.";

describe("information quality", () => {
  it("detects hedged writing", () => {
    expect(hedgingDensity(hedged)).toBeGreaterThan(hedgingDensity(direct));
  });

  it("rewards specific names, dates, and numbers", () => {
    expect(specificityScore(direct)).toBeGreaterThan(specificityScore(hedged));
  });

  it("scores vague hedging worse than direct evidence", () => {
    expect(scoreQuality(hedged).score).toBeGreaterThan(scoreQuality(direct).score);
  });
});
