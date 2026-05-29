import { hedgingSignal } from "../signals/hedging";
import { sourceGroundingSignal } from "../signals/source-grounding";
import { specificitySignal } from "../signals/specificity";
import { subjectivitySignal } from "../signals/subjectivity";
import type { DimensionScore, SignalResult } from "./types";

export function qualitySignals(text: string, includeGrounding = false): SignalResult[] {
  const base = [hedgingSignal(text, 0.3), specificitySignal(text, 0.35), subjectivitySignal(text, 0.2)];
  return includeGrounding ? [...base, sourceGroundingSignal(text, 0.15)] : [...base, sourceGroundingSignal(text, 0)];
}

export function scoreQuality(text: string, includeGrounding = false): DimensionScore & { results: SignalResult[] } {
  const results = qualitySignals(text, includeGrounding);
  const score = results.reduce((sum, signal) => sum + signal.contribution, 0);
  return {
    score: Math.round(score),
    weight: 0.25,
    signals: results.map((signal) => signal.name),
    explanation: "Checks whether claims are specific, direct, grounded, and appropriately subjective.",
    results,
  };
}
