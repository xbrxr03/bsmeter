import type { BSMeterOptions, DimensionScore, SignalResult } from "./types";
import { compressionRatio } from "../signals/compression";
import { tokenEntropy } from "../signals/entropy";
import { ideaDensity } from "../signals/idea-density";
import { diffOverlap } from "../signals/diff-overlap";

export function computeDensity(
  text: string,
  options: BSMeterOptions,
  allSignals: SignalResult[]
): DimensionScore {
  const compression = compressionRatio(text);
  const entropy = tokenEntropy(text);
  const density = ideaDensity(text);

  const signals: SignalResult[] = [compression, entropy, density];

  if (options.domain === "code-review" && options.context?.diff) {
    const overlap = diffOverlap(text, options.context.diff);
    signals.push(overlap);
  }

  allSignals.push(...signals);

  // Weighted average of BS scores
  const weights = options.domain === "code-review"
    ? [0.25, 0.25, 0.25, 0.25]
    : [0.35, 0.35, 0.30];

  const score = signals.reduce((sum, s, i) => sum + s.normalized * weights[i], 0);

  const flagged = signals.filter(s => s.flag).map(s => s.name);
  const explanation = flagged.length > 0
    ? `Low information utility: ${flagged.join(", ")} flagged issues`
    : "Information density looks reasonable";

  return {
    score: Math.round(score),
    weight: 0.35,
    signals: signals.map(s => s.name),
    explanation,
  };
}
