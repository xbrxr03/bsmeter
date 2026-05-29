import nlp from "compromise";
import type { SignalResult } from "../core/types";

export function ideaDensity(text: string): SignalResult {
  const doc = nlp(text);
  const words = text.match(/\b\w+\b/g) ?? [];
  const total = words.length;

  if (total < 5) {
    return { name: "idea_density", value: 0, normalized: 50, contribution: 0, flag: false };
  }

  const verbTokens = doc.verbs().out("array") as string[];
  const adjTokens = doc.adjectives().out("array") as string[];
  const advTokens = doc.adverbs().out("array") as string[];
  const nounTokens = doc.nouns().out("array") as string[];

  const countWords = (arr: string[]) =>
    arr.reduce((sum, s) => sum + (s.match(/\b\w+\b/g)?.length ?? 0), 0);

  const contentWordCount =
    countWords(verbTokens) +
    countWords(adjTokens) +
    countWords(advTokens) +
    countWords(nounTokens);

  const density = contentWordCount / total;
  // Typical: 0.3 (low) to 0.7 (high). BS when low.
  const bsScore = Math.min(100, Math.max(0, (0.45 - density) / 0.15 * 100));

  return {
    name: "idea_density",
    value: Math.round(density * 1000) / 1000,
    normalized: Math.round(bsScore),
    contribution: 0,
    flag: density < 0.35,
  };
}
