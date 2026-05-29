import { describe, expect, it } from "vitest";
import { scoreUtility } from "../../src/core/density";
import { ideaDensity } from "../../src/signals/idea-density";

const concrete = "Maria deployed the billing migration after comparing 312 failed invoices against the May 2026 Stripe export.";
const abstract = "This solution is important and valuable because it can help improve things in many useful ways.";

describe("information utility", () => {
  it("scores repetitive filler worse than concrete text", () => {
    expect(scoreUtility("important useful valuable ".repeat(50)).score).toBeGreaterThan(scoreUtility(concrete).score);
  });

  it("gives concrete technical text more idea density than abstract filler", () => {
    expect(ideaDensity(concrete)).toBeGreaterThan(ideaDensity(abstract));
  });
});
