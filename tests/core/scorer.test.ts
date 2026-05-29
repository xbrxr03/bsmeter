import { describe, it, expect } from "vitest";
import { bsScore } from "../../src/core/index";

const CLEAN_TEXT = `
The deployment pipeline was updated to use GitHub Actions instead of CircleCI.
This change reduces our monthly CI costs by approximately 40% based on our current usage patterns.
The migration involved updating 12 workflow files and validating each stage against our existing test suite.
All integration tests pass on the new runner configuration.
Performance benchmarks show build times improved from 8 minutes to 5 minutes on average.
`;

const SLOP_TEXT = `
In conclusion, it is important to note that furthermore, moreover, this is a very good piece of content.
As we can see, in today's world, moving forward, that being said, at the end of the day,
it's important to understand that needless to say, everything is delve into deeply.
In summary, to summarize, this was a great piece that touched on many important things.
First and foremost, last but not least, it's worth noting that it goes without saying.
`;

describe("bsScore", () => {
  it("returns a valid BSResult shape", () => {
    const result = bsScore(CLEAN_TEXT, { domain: "content-seo" });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(["clean", "suspect", "bs"]).toContain(result.verdict);
    expect(result.dimensions.utility).toBeDefined();
    expect(result.dimensions.quality).toBeDefined();
    expect(result.dimensions.style).toBeDefined();
    expect(result.domainSpecific).toBeDefined();
    expect(Array.isArray(result.signals)).toBe(true);
    expect(Array.isArray(result.highlights)).toBe(true);
    expect(result.meta.model).toBe("bsmeter-v1");
  });

  it("gives slop text higher score than clean text", () => {
    const cleanResult = bsScore(CLEAN_TEXT, { domain: "content-seo" });
    const slopResult = bsScore(SLOP_TEXT, { domain: "content-seo" });
    expect(slopResult.score).toBeGreaterThan(cleanResult.score);
  });

  it("works for code-review domain with diff", () => {
    const desc = "Updated the login function to handle null values";
    const diff = `
--- a/auth.ts
+++ b/auth.ts
@@ -12,6 +12,10 @@ export function login(user: User) {
+  if (!user) return null;
   return authenticate(user);
 }`;
    const result = bsScore(desc, { domain: "code-review", context: { diff } });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("works for social-news domain", () => {
    const result = bsScore(CLEAN_TEXT, { domain: "social-news", context: { title: "CI Migration Saves 40%" } });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.verdict).toBeDefined();
  });

  it("verdict thresholds are correct", () => {
    const result = bsScore(CLEAN_TEXT, { domain: "content-seo" });
    if (result.score <= 30) expect(result.verdict).toBe("clean");
    else if (result.score <= 60) expect(result.verdict).toBe("suspect");
    else expect(result.verdict).toBe("bs");
  });
});
