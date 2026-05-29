import { headlineSignal } from "../../signals/headline-scan";
import { makeSignal, words } from "../../signals/text";
import type { DimensionScore, SignalResult } from "../types";

function keywordStuffing(text: string): number {
  const tokens = words(text).filter((word) => word.length > 3);
  if (tokens.length < 8) return 0;
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  return Math.max(...counts.values()) / tokens.length;
}

function listiclePattern(title = "", text = ""): number {
  return /\b\d+\s+(ways|tips|things|reasons|secrets|tricks)\b/i.test(`${title} ${text}`) ? 1 : 0;
}

export function contentSeoSignals(text: string, title = ""): SignalResult[] {
  const stuffing = keywordStuffing(text);
  const listicle = listiclePattern(title, text);
  return [
    makeSignal("keyword_stuffing", stuffing, stuffing * 260, 0.45),
    makeSignal("listicle_pattern", listicle, listicle * 45, 0.25),
    headlineSignal(title, text, 0.3),
  ];
}

export function scoreContentSeoDomain(text: string, title = ""): DimensionScore & { results: SignalResult[] } {
  const results = contentSeoSignals(text, title);
  return {
    score: Math.round(results.reduce((sum, signal) => sum + signal.contribution, 0)),
    weight: 0.2,
    signals: results.map((signal) => signal.name),
    explanation: "Detects SEO filler, repeated target keywords, listicle framing, and overstated headlines.",
    results,
  };
}
