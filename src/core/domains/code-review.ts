import type { BSMeterOptions, DimensionScore, Highlight, SignalResult } from "../types";
import { diffOverlap } from "../../signals/diff-overlap";
import { templateRate } from "../../signals/template-rate";

const COMMIT_TEMPLATE_PATTERNS = [
  /^(fix|feat|chore|update|add|remove|refactor):\s*.{0,30}$/i,
  /^(updated|fixed|added|removed|changed)\s+\w+/i,
];

function analyzeCommitPatterns(text: string): number {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  let templateCount = 0;
  for (const line of lines) {
    for (const pattern of COMMIT_TEMPLATE_PATTERNS) {
      if (pattern.test(line)) { templateCount++; break; }
    }
  }
  return lines.length > 0 ? templateCount / lines.length : 0;
}

export function codeReviewDomain(
  text: string,
  options: BSMeterOptions,
  allSignals: SignalResult[],
  highlights: Highlight[]
): DimensionScore {
  const signals: SignalResult[] = [];

  // Diff overlap (already computed in density if diff present, but score it here too)
  if (options.context?.diff) {
    const overlap = diffOverlap(text, options.context.diff);
    const domainOverlap: SignalResult = { ...overlap, name: "domain_diff_overlap" };
    signals.push(domainOverlap);
    if (domainOverlap.flag) {
      highlights.push({
        start: 0,
        end: text.length,
        reason: "PR description largely restates the diff without adding context",
        severity: "high",
      });
    }
  }

  // Template rate for commit message patterns
  const commitScore = analyzeCommitPatterns(text);
  const commitSignal: SignalResult = {
    name: "commit_template_rate",
    value: Math.round(commitScore * 100) / 100,
    normalized: Math.round(Math.min(100, commitScore * 150)),
    contribution: 0,
    flag: commitScore > 0.5,
  };
  signals.push(commitSignal);

  // Detect hollow PR descriptions (very short with no substance)
  const wordCount = (text.match(/\b\w+\b/g) ?? []).length;
  const hollownessScore = wordCount < 20 ? Math.min(100, (20 - wordCount) * 5) : 0;
  const hollownessSignal: SignalResult = {
    name: "pr_description_length",
    value: wordCount,
    normalized: hollownessScore,
    contribution: 0,
    flag: wordCount < 15,
  };
  signals.push(hollownessSignal);

  allSignals.push(...signals);

  const weights = options.context?.diff ? [0.50, 0.25, 0.25] : [0.50, 0.50];
  const usedSignals = options.context?.diff ? signals : signals.slice(1);
  const score = usedSignals.reduce((sum, s, i) => sum + s.normalized * weights[i], 0);

  const flagged = signals.filter(s => s.flag).map(s => s.name);
  return {
    score: Math.round(score),
    weight: 0.20,
    signals: signals.map(s => s.name),
    explanation: flagged.length > 0
      ? `Code review issues: ${flagged.join(", ")}`
      : "PR description looks substantive",
  };
}
