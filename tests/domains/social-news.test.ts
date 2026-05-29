import { describe, expect, it } from "vitest";
import { scoreSocialNewsDomain } from "../../src/core/domains/social-news";

describe("social-news domain", () => {
  it("flags clickbait without source grounding", () => {
    const clickbait = "People are furious and you won't believe what happened next. Share this now.";
    const sourced = "Reuters reported on May 14, 2026 that the agency published the filing after a court deadline.";
    expect(scoreSocialNewsDomain(clickbait, "You won't believe this shocking update").score).toBeGreaterThan(scoreSocialNewsDomain(sourced, "Agency publishes filing").score);
  });
});
