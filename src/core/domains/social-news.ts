import type { BSMeterOptions, DimensionScore, Highlight, SignalResult } from "../types";
import { headlineScan } from "../../signals/headline-scan";
import { sourceGrounding } from "../../signals/source-grounding";

const ENGAGEMENT_BAIT = [
  "you won't believe", "share if you agree", "tag someone who",
  "comment below", "like and share", "retweet if", "follow for more",
  "this will change everything", "nobody talks about this",
  "they don't want you to know", "the mainstream media won't",
];

function detectEngagementBait(text: string): number {
  const lower = text.toLowerCase();
  let hits = 0;
  for (const phrase of ENGAGEMENT_BAIT) {
    if (lower.includes(phrase)) hits++;
  }
  return Math.min(100, hits * 35);
}

export function socialNewsDomain(
  text: string,
  options: BSMeterOptions,
  allSignals: SignalResult[],
  highlights: Highlight[]
): DimensionScore {
  const signals: SignalResult[] = [];

  const headline = headlineScan(options.context?.title ?? "");
  signals.push(headline);

  const grounding = sourceGrounding(text);
  signals.push(grounding);

  const engagementScore = detectEngagementBait(text);
  signals.push({
    name: "engagement_bait",
    value: engagementScore,
    normalized: engagementScore,
    contribution: 0,
    flag: engagementScore > 30,
  });

  allSignals.push(...signals);

  if (headline.flag) {
    highlights.push({
      start: 0,
      end: (options.context?.title ?? "").length,
      reason: "Sensationalist or clickbait headline detected",
      severity: "high",
    });
  }
  if (grounding.flag) {
    highlights.push({
      start: 0,
      end: Math.min(300, text.length),
      reason: "Claims made without verifiable sources",
      severity: "medium",
    });
  }

  const weights = [0.35, 0.40, 0.25];
  const score = signals.reduce((sum, s, i) => sum + s.normalized * weights[i], 0);

  const flagged = signals.filter(s => s.flag).map(s => s.name);
  return {
    score: Math.round(score),
    weight: 0.20,
    signals: signals.map(s => s.name),
    explanation: flagged.length > 0
      ? `News/social issues: ${flagged.join(", ")}`
      : "Content appears credibly sourced",
  };
}
