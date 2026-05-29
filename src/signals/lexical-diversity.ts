import type { SignalResult } from "../core/types";

export function lexicalDiversity(text: string): SignalResult {
  const tokens = text.toLowerCase().match(/\b[a-z]+\b/g) ?? [];
  if (tokens.length < 10) {
    return { name: "lexical_diversity", value: 0, normalized: 50, contribution: 0, flag: false };
  }

  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);

  const typeTokenRatio = freq.size / tokens.length;
  const hapaxCount = [...freq.values()].filter(c => c === 1).length;
  const hapaxRatio = hapaxCount / freq.size;

  // Combine TTR and hapax ratio; low = repetitive = slop
  const diversity = (typeTokenRatio + hapaxRatio) / 2;
  // Typical: <0.25 (repetitive) to >0.55 (diverse). BS when low.
  const bsScore = Math.min(100, Math.max(0, (0.4 - diversity) / 0.2 * 100));

  return {
    name: "lexical_diversity",
    value: Math.round(diversity * 1000) / 1000,
    normalized: Math.round(bsScore),
    contribution: 0,
    flag: diversity < 0.25,
  };
}
