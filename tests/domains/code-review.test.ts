import { describe, expect, it } from "vitest";
import { scoreCodeReviewDomain } from "../../src/core/domains/code-review";

describe("code-review domain", () => {
  it("flags PR text that restates the diff", () => {
    const diff = "+export function retryWebhook(invoiceId) { return queue.add(invoiceId); }";
    const restating = "Adds retryWebhook invoiceId queue add function and updates implementation.";
    const contextual = "Retries are keyed by invoice id so duplicate Stripe webhooks stop paging support.";
    expect(scoreCodeReviewDomain(restating, diff).score).toBeGreaterThan(scoreCodeReviewDomain(contextual, diff).score);
  });
});
