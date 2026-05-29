import { describe, it, expect } from "vitest";
import { bsScore } from "../../src/core/index";

describe("code-review domain", () => {
  it("scores a hollow PR description higher than a substantive one", () => {
    const hollow = bsScore("Updated stuff", { domain: "code-review" });
    const substantive = bsScore(
      "Refactored authentication middleware to use JWT tokens instead of session cookies. " +
      "This resolves the scaling issue we hit during the Black Friday load test where session store " +
      "became a bottleneck at ~50k concurrent users. Includes migration script for existing sessions.",
      { domain: "code-review" }
    );
    expect(hollow.score).toBeGreaterThan(substantive.score);
  });

  it("flags diff-restating descriptions", () => {
    const diff = `
+++ b/auth.ts
+function validateToken(token: string): boolean {
+  return token !== null && token.length > 0;
+}`;
    const restating = bsScore(
      "Added validateToken function that returns true when token is not null and length is greater than zero",
      { domain: "code-review", context: { diff } }
    );
    expect(restating.score).toBeGreaterThan(20);
  });
});
