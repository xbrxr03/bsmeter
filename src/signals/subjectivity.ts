import type { SignalResult } from "../core/types";
import lexicon from "../data/subjectivity-lexicon.json";

const { strong_subjective, weak_subjective } = lexicon as {
  strong_subjective: string[];
  weak_subjective: string[];
};
const strongSet = new Set(strong_subjective);
const weakSet = new Set(weak_subjective);

export function subjectivity(text: string): SignalResult {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) ?? [];
  if (words.length === 0) {
    return { name: "subjectivity", value: 0, normalized: 50, contribution: 0, flag: false };
  }

  let strongCount = 0;
  let weakCount = 0;
  for (const w of words) {
    if (strongSet.has(w)) strongCount++;
    else if (weakSet.has(w)) weakCount++;
  }

  const ratio = (strongCount * 1.5 + weakCount) / words.length;
  // Extremely low ratio = corporate AI speak = slop
  // Extremely high ratio = rant = also suspect
  // Ideal range: 0.05–0.20
  let bsScore: number;
  if (ratio < 0.05) {
    // Very flat, emotionless — AI corporate speak
    bsScore = Math.min(100, (0.05 - ratio) / 0.05 * 80);
  } else if (ratio > 0.30) {
    // Over-emotional rant
    bsScore = Math.min(100, (ratio - 0.30) / 0.20 * 60);
  } else {
    bsScore = 0;
  }

  return {
    name: "subjectivity",
    value: Math.round(ratio * 1000) / 1000,
    normalized: Math.round(bsScore),
    contribution: 0,
    flag: ratio < 0.04 || ratio > 0.35,
  };
}
