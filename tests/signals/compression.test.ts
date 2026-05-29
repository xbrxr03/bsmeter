import { describe, it, expect } from "vitest";
import { compressionRatio } from "../../src/signals/compression";

describe("compressionRatio", () => {
  it("returns a valid SignalResult shape", () => {
    const result = compressionRatio("Hello world, this is some test text to compress.");
    expect(result.name).toBe("compression_ratio");
    expect(result.value).toBeGreaterThan(0);
    expect(result.normalized).toBeGreaterThanOrEqual(0);
    expect(result.normalized).toBeLessThanOrEqual(100);
  });

  it("flags very repetitive text", () => {
    const repetitive = "the ".repeat(200);
    const result = compressionRatio(repetitive);
    expect(result.flag).toBe(true);
    expect(result.normalized).toBeGreaterThan(50);
  });

  it("does not flag diverse text", () => {
    const diverse =
      "The quick brown fox jumps over the lazy dog. " +
      "She sells seashells by the seashore. " +
      "Peter Piper picked a peck of pickled peppers. " +
      "How much wood would a woodchuck chuck if a woodchuck could chuck wood?";
    const result = compressionRatio(diverse);
    expect(result.normalized).toBeLessThan(80);
  });

  it("handles short text gracefully", () => {
    const result = compressionRatio("hi");
    expect(result.name).toBe("compression_ratio");
    expect(result.normalized).toBe(50);
  });
});
