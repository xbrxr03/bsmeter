import { describe, it, expect } from "vitest";
import { tokenEntropy } from "../../src/signals/entropy";

describe("tokenEntropy", () => {
  it("returns a valid SignalResult", () => {
    const result = tokenEntropy("The quick brown fox jumps over the lazy dog. A diverse sentence with many different words.");
    expect(result.name).toBe("token_entropy");
    expect(result.normalized).toBeGreaterThanOrEqual(0);
    expect(result.normalized).toBeLessThanOrEqual(100);
  });

  it("gives higher BS score to repetitive text", () => {
    const repetitive = "the the the the the the the the the the the the the the the the the the the the";
    const diverse = "apple banana cherry dragon elephant fox gorilla hedgehog iguana jaguar kangaroo lemur mango narwhal octopus parrot quail rabbit salmon turtle unicorn viper whale xenon yak zebra";
    const r1 = tokenEntropy(repetitive);
    const r2 = tokenEntropy(diverse);
    expect(r1.normalized).toBeGreaterThan(r2.normalized);
  });

  it("handles short text gracefully", () => {
    const result = tokenEntropy("hi there");
    expect(result.normalized).toBe(50);
  });
});
