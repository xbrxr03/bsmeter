import { clamp, makeSignal, uniqueWords } from "./text";

export function diffOverlap(description: string, diff = ""): number {
  if (!description.trim() || !diff.trim()) return 0;
  const desc = uniqueWords(description);
  const changed = uniqueWords(diff.replace(/^[+-]/gm, ""));
  const intersection = [...desc].filter((word) => changed.has(word)).length;
  const union = new Set([...desc, ...changed]).size;
  return union ? intersection / union : 0;
}

export function diffOverlapSignal(description: string, diff = "", weight = 1) {
  const overlap = diffOverlap(description, diff);
  return makeSignal("diff_overlap", overlap, clamp(overlap * 160), weight);
}
