import { gzipSync } from "node:zlib";
import { clamp, makeSignal } from "./text";

export function compressionRatio(text: string): number {
  if (!text.trim()) return 1;
  const raw = Buffer.byteLength(text, "utf8");
  return gzipSync(text).length / Math.max(raw, 1);
}

export function compressionSignal(text: string, weight = 1) {
  const ratio = compressionRatio(text);
  const normalized = clamp((0.72 - ratio) * 170);
  return makeSignal("compression_ratio", ratio, normalized, weight);
}
