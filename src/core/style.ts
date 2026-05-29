import type { DimensionScore, SignalResult } from "./types";
import { templateRate } from "../signals/template-rate";
import { sentenceVariance } from "../signals/sentence-variance";
import { lexicalDiversity } from "../signals/lexical-diversity";
import { readability } from "../signals/readability";

export function computeStyle(
  text: string,
  allSignals: SignalResult[]
): DimensionScore {
  const template = templateRate(text);
  const variance = sentenceVariance(text);
  const diversity = lexicalDiversity(text);
  const read = readability(text);

  const signals = [template, variance, diversity, read];
  allSignals.push(...signals);

  const weights = [0.30, 0.25, 0.30, 0.15];
  const score = signals.reduce((sum, s, i) => sum + s.normalized * weights[i], 0);

  const flagged = signals.filter(s => s.flag).map(s => s.name);
  const explanation = flagged.length > 0
    ? `Style issues detected: ${flagged.join(", ")}`
    : "Writing style looks natural";

  return {
    score: Math.round(score),
    weight: 0.20,
    signals: signals.map(s => s.name),
    explanation,
  };
}
