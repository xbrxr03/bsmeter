import lexicon from "../data/subjectivity-lexicon.json";
import { clamp, makeSignal, words } from "./text";

const subjective = new Set(lexicon.subjective);

export function subjectivityRatio(text: string): number {
  const tokens = words(text);
  if (!tokens.length) return 0;
  return tokens.filter((token) => subjective.has(token)).length / tokens.length;
}

export function subjectivitySignal(text: string, weight = 1) {
  const ratio = subjectivityRatio(text);
  const normalized = ratio < 0.015 ? 45 : ratio > 0.18 ? 70 : 10;
  return makeSignal("subjectivity_ratio", ratio, clamp(normalized), weight);
}
