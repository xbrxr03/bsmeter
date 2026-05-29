import { describe, expect, it } from "vitest";
import { tokenEntropy, entropySignal } from "../../src/signals/entropy";

describe("token entropy", () => {
  it("is higher for varied vocabulary", () => {
    expect(tokenEntropy("alpha alpha alpha alpha alpha")).toBeLessThan(tokenEntropy("alpha beta gamma delta epsilon"));
  });

  it("normalizes low entropy as a slop signal", () => {
    expect(entropySignal("test test test test test").normalized).toBeGreaterThan(50);
  });
});
