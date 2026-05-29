import type { SignalResult } from "../core/types";
import patterns from "../data/clickbait-patterns.json";

const { prefix_patterns, numeric_patterns, superlative_patterns, emotional_triggers } =
  patterns as {
    prefix_patterns: string[];
    numeric_patterns: string[];
    superlative_patterns: string[];
    emotional_triggers: string[];
  };

export function headlineScan(headline: string): SignalResult {
  if (!headline || headline.trim().length === 0) {
    return { name: "headline_scan", value: 0, normalized: 0, contribution: 0, flag: false };
  }

  const lower = headline.toLowerCase();
  let score = 0;
  let flagged = false;

  for (const p of prefix_patterns) {
    if (lower.includes(p)) { score += 30; flagged = true; }
  }
  for (const p of numeric_patterns) {
    if (new RegExp(p, "i").test(lower)) { score += 20; flagged = true; }
  }
  for (const p of superlative_patterns) {
    if (lower.includes(p)) { score += 15; }
  }
  for (const p of emotional_triggers) {
    if (lower.includes(p)) { score += 25; flagged = true; }
  }

  const normalized = Math.min(100, score);

  return {
    name: "headline_scan",
    value: score,
    normalized,
    contribution: 0,
    flag: flagged || normalized >= 30,
  };
}
