import { headlineSignal } from "../../signals/headline-scan";
import { sourceGroundingSignal } from "../../signals/source-grounding";
import { countPhraseMatches, makeSignal } from "../../signals/text";
import type { DimensionScore, SignalResult } from "../types";

const engagementBait = ["share this", "comment below", "you need to see", "wait until", "the internet is losing it", "people are furious"];

export function socialNewsSignals(text: string, title = ""): SignalResult[] {
  const bait = countPhraseMatches(`${title} ${text}`, engagementBait);
  return [headlineSignal(title, text, 0.45), sourceGroundingSignal(text, 0.4), makeSignal("engagement_bait", bait, bait * 30, 0.15)];
}

export function scoreSocialNewsDomain(text: string, title = ""): DimensionScore & { results: SignalResult[] } {
  const results = socialNewsSignals(text, title);
  return {
    score: Math.round(results.reduce((sum, signal) => sum + signal.contribution, 0)),
    weight: 0.2,
    signals: results.map((signal) => signal.name),
    explanation: "Detects sensational headlines, engagement bait, and weak source grounding.",
    results,
  };
}
