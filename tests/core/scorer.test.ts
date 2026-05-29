import { describe, expect, it } from "vitest";
import { bsScore, verdictForScore } from "../../src/core";

const slop = "In today's fast-paced world, it is important to note that this comprehensive guide will unlock the power of productivity. Furthermore, this robust solution can help in many ways. In conclusion, you can take it to the next level.";
const clean = "On May 14, the billing worker retried 37 Stripe webhook events after a 429 response. This PR stores the retry id in Postgres, skips duplicate invoice events, and adds a regression test for the Acme Corp account.";

describe("bsScore", () => {
  it("returns the full result contract", () => {
    const result = bsScore(clean, { domain: "code-review", context: { diff: "+ retry_id text" } });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.verdict).toMatch(/clean|suspect|bs/);
    expect(result.dimensions.utility.signals.length).toBeGreaterThan(0);
    expect(result.dimensions.quality.signals.length).toBeGreaterThan(0);
    expect(result.dimensions.style.signals.length).toBeGreaterThan(0);
    expect(result.domainSpecific.signals.length).toBeGreaterThan(0);
    expect(result.meta.model).toBe("bsmeter-v1");
  });

  it("uses documented verdict thresholds", () => {
    expect(verdictForScore(0)).toBe("clean");
    expect(verdictForScore(30)).toBe("clean");
    expect(verdictForScore(31)).toBe("suspect");
    expect(verdictForScore(60)).toBe("suspect");
    expect(verdictForScore(61)).toBe("bs");
    expect(verdictForScore(100)).toBe("bs");
  });

  it("scores known slop text above known clean text", () => {
    expect(bsScore(slop).score).toBeGreaterThan(bsScore(clean).score);
  });
});
