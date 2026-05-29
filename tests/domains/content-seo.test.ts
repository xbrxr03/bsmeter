import { describe, expect, it } from "vitest";
import { scoreContentSeoDomain } from "../../src/core/domains/content-seo";

describe("content-seo domain", () => {
  it("flags keyword stuffing and listicle framing", () => {
    const stuffed = "productivity tool productivity tool productivity tool productivity tool productivity tool can improve productivity.";
    const specific = "The app exports tasks to CSV and preserves completed dates for Asana imports.";
    expect(scoreContentSeoDomain(stuffed, "7 productivity tips").score).toBeGreaterThan(scoreContentSeoDomain(specific, "CSV export details").score);
  });
});
