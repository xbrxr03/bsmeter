import type { SignalResult } from "../core/types";
import hedgingPhrases from "../data/hedging-phrases.json";

const phrases: string[] = hedgingPhrases as string[];

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
}

export function hedgingDensity(text: string): SignalResult {
  const lower = text.toLowerCase();
  const sentences = splitSentences(text);
  if (sentences.length === 0) {
    return { name: "hedging_density", value: 0, normalized: 0, contribution: 0, flag: false };
  }

  let matchCount = 0;
  const matchedPhrases: string[] = [];
  for (const phrase of phrases) {
    if (lower.includes(phrase)) {
      matchCount++;
      matchedPhrases.push(phrase);
    }
  }

  const density = matchCount / sentences.length;
  // Typical: <0.2 (clean) to >1.0 (AI hedging). BS when high.
  const bsScore = Math.min(100, density / 0.8 * 100);

  return {
    name: "hedging_density",
    value: Math.round(density * 1000) / 1000,
    normalized: Math.round(bsScore),
    contribution: 0,
    flag: density > 0.4,
  };
}
