import { gzipSync } from "zlib";
import type { SignalResult } from "../core/types";

export function compressionRatio(text: string): SignalResult {
  if (text.length < 20) {
    return { name: "compression_ratio", value: 0.5, normalized: 50, contribution: 0, flag: false };
  }
  const buf = Buffer.from(text, "utf8");
  const compressed = gzipSync(buf);
  const ratio = compressed.length / buf.length;
  // Low ratio = repetitive = slop. Typical values: ~0.25 (very repetitive) to ~0.75 (varied)
  // Map [0.25, 0.65] → [100, 0] (BS score: high when repetitive)
  const bsScore = Math.min(100, Math.max(0, (0.65 - ratio) / 0.40 * 100));
  return {
    name: "compression_ratio",
    value: Math.round(ratio * 1000) / 1000,
    normalized: Math.round(bsScore),
    contribution: 0,
    flag: ratio < 0.45,
  };
}
