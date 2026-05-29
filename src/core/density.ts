import { compressionSignal } from "../signals/compression";
import { entropySignal } from "../signals/entropy";
import { ideaDensitySignal } from "../signals/idea-density";
import type { DimensionScore, SignalResult } from "./types";

export function utilitySignals(text: string): SignalResult[] {
  return [entropySignal(text, 0.3), ideaDensitySignal(text, 0.35), compressionSignal(text, 0.35)];
}

export function scoreUtility(text: string): DimensionScore & { results: SignalResult[] } {
  const results = utilitySignals(text);
  const score = results.reduce((sum, signal) => sum + signal.contribution, 0);
  return {
    score: Math.round(score),
    weight: 0.35,
    signals: results.map((signal) => signal.name),
    explanation: "Measures repetition, predictability, and how much concrete information the text carries.",
    results,
  };
}
