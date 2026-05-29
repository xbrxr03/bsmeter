import { diffOverlapSignal } from "../../signals/diff-overlap";
import { countPhraseMatches, makeSignal } from "../../signals/text";
import type { DimensionScore, SignalResult } from "../types";

const hollowReviewPhrases = [
  "minor changes", "various improvements", "small fixes", "clean up", "refactor code",
  "update implementation", "improve functionality", "make changes", "address feedback",
];

export function codeReviewSignals(text: string, diff = ""): SignalResult[] {
  const hollow = countPhraseMatches(text, hollowReviewPhrases);
  return [diffOverlapSignal(text, diff, 0.65), makeSignal("hollow_pr_language", hollow, hollow * 25, 0.35)];
}

export function scoreCodeReviewDomain(text: string, diff = ""): DimensionScore & { results: SignalResult[] } {
  const results = codeReviewSignals(text, diff);
  return {
    score: Math.round(results.reduce((sum, signal) => sum + signal.contribution, 0)),
    weight: 0.2,
    signals: results.map((signal) => signal.name),
    explanation: "Detects PR descriptions that merely echo the diff or rely on vague review boilerplate.",
    results,
  };
}
