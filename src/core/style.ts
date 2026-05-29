import { lexicalDiversitySignal } from "../signals/lexical-diversity";
import { readabilitySignal } from "../signals/readability";
import { sentenceVarianceSignal } from "../signals/sentence-variance";
import { templateRateSignal } from "../signals/template-rate";
import type { DimensionScore, SignalResult } from "./types";

export function styleSignals(text: string): SignalResult[] {
  return [
    templateRateSignal(text, 0.35),
    sentenceVarianceSignal(text, 0.25),
    lexicalDiversitySignal(text, 0.25),
    readabilitySignal(text, 0.15),
  ];
}

export function scoreStyle(text: string): DimensionScore & { results: SignalResult[] } {
  const results = styleSignals(text);
  const score = results.reduce((sum, signal) => sum + signal.contribution, 0);
  return {
    score: Math.round(score),
    weight: 0.2,
    signals: results.map((signal) => signal.name),
    explanation: "Finds formulaic phrasing, flat sentence rhythm, low vocabulary variety, and readability swings.",
    results,
  };
}
