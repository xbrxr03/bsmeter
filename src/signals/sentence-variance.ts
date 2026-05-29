import type { SignalResult } from "../core/types";

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export function sentenceVariance(text: string): SignalResult {
  const sentences = splitSentences(text);
  if (sentences.length < 3) {
    return { name: "sentence_variance", value: 0, normalized: 50, contribution: 0, flag: false };
  }

  const lengths = sentences.map(s => (s.match(/\b\w+\b/g) ?? []).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  // Low std dev = uniform sentence length = AI pattern. Typical: <3 (AI) to >8 (human)
  const bsScore = Math.min(100, Math.max(0, (5.0 - stdDev) / 4.0 * 100));

  return {
    name: "sentence_variance",
    value: Math.round(stdDev * 100) / 100,
    normalized: Math.round(bsScore),
    contribution: 0,
    flag: stdDev < 3.0,
  };
}
