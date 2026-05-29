import type { BSMeterOptions, DimensionScore, SignalResult } from "./types";
import { subjectivity } from "../signals/subjectivity";
import { hedgingDensity } from "../signals/hedging";
import { specificity } from "../signals/specificity";
import { sourceGrounding } from "../signals/source-grounding";

export function computeQuality(
  text: string,
  options: BSMeterOptions,
  allSignals: SignalResult[]
): DimensionScore {
  const subj = subjectivity(text);
  const hedging = hedgingDensity(text);
  const spec = specificity(text);

  const signals: SignalResult[] = [subj, hedging, spec];

  if (options.domain === "social-news") {
    const grounding = sourceGrounding(text);
    signals.push(grounding);
  }

  allSignals.push(...signals);

  const weights = options.domain === "social-news"
    ? [0.20, 0.25, 0.25, 0.30]
    : [0.25, 0.35, 0.40];

  const score = signals.reduce((sum, s, i) => sum + s.normalized * weights[i], 0);

  const flagged = signals.filter(s => s.flag).map(s => s.name);
  const explanation = flagged.length > 0
    ? `Quality concerns: ${flagged.join(", ")} flagged`
    : "Information quality looks acceptable";

  return {
    score: Math.round(score),
    weight: 0.25,
    signals: signals.map(s => s.name),
    explanation,
  };
}
