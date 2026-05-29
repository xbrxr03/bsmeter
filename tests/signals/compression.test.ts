import { describe, expect, it } from "vitest";
import { compressionRatio, compressionSignal } from "../../src/signals/compression";

const repetitive = "optimize workflow ".repeat(80);
const diverse = "The migration stores account ids, validates Stripe webhook signatures, and retries failed invoices after a 429 response.";

describe("compression ratio", () => {
  it("is lower for repetitive text than varied text", () => {
    expect(compressionRatio(repetitive)).toBeLessThan(compressionRatio(diverse));
  });

  it("flags heavily repetitive text", () => {
    expect(compressionSignal(repetitive).flag).toBe(true);
  });
});
