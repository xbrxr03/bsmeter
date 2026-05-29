import type { SignalResult } from "../core/types";

function tokenize(text: string): Set<string> {
  const tokens = text.toLowerCase().match(/\b[a-z][a-z0-9_]*\b/g) ?? [];
  const stopwords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "or", "and", "but", "if",
    "this", "that", "these", "those", "it", "its", "we", "i", "you",
    "he", "she", "they", "them", "their", "our", "your", "my", "his",
    "her", "not", "no", "nor", "so", "yet", "both", "either", "neither",
  ]);
  return new Set(tokens.filter(t => !stopwords.has(t) && t.length > 2));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter(x => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

export function diffOverlap(description: string, diff: string): SignalResult {
  if (!diff || diff.trim().length === 0) {
    return { name: "diff_overlap", value: 0, normalized: 0, contribution: 0, flag: false };
  }

  // Extract only added lines from diff
  const diffLines = diff
    .split("\n")
    .filter(l => l.startsWith("+") && !l.startsWith("+++"))
    .join(" ");

  const descTokens = tokenize(description);
  const diffTokens = tokenize(diffLines);

  const similarity = jaccard(descTokens, diffTokens);
  // High similarity = description just restates the diff = slop
  // Typical: <0.1 (genuine description) to >0.4 (restating)
  const bsScore = Math.min(100, similarity / 0.35 * 100);

  return {
    name: "diff_overlap",
    value: Math.round(similarity * 1000) / 1000,
    normalized: Math.round(bsScore),
    contribution: 0,
    flag: similarity > 0.25,
  };
}
