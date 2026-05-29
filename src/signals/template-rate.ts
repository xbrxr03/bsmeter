import type { SignalResult } from "../core/types";
import templates from "../data/ai-templates.json";

const { phrases }: { phrases: string[] } = templates as { phrases: string[]; ngrams: string[][] };

export function templateRate(text: string): SignalResult {
  const lower = text.toLowerCase();
  const words = lower.match(/\b\w+\b/g) ?? [];
  if (words.length === 0) {
    return { name: "template_rate", value: 0, normalized: 0, contribution: 0, flag: false };
  }

  let hitCount = 0;
  let hitWordCount = 0;
  for (const phrase of phrases) {
    if (lower.includes(phrase)) {
      hitCount++;
      hitWordCount += phrase.split(" ").length;
    }
  }

  // Rate: how many template words per 100 words
  const rate = hitWordCount / words.length;
  const bsScore = Math.min(100, rate / 0.15 * 100);

  return {
    name: "template_rate",
    value: Math.round(rate * 1000) / 1000,
    normalized: Math.round(bsScore),
    contribution: 0,
    flag: hitCount >= 3 || rate > 0.08,
  };
}
