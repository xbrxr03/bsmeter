import type { BSMeterOptions, BSResult } from "./types";
import { score } from "./scorer";

export function bsScore(text: string, options: BSMeterOptions): BSResult {
  return score(text, options);
}

export type { BSMeterOptions, BSResult, DimensionScore, SignalResult, Highlight } from "./types";
