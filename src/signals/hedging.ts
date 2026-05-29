import hedges from "../data/hedging-phrases.json";
import { clamp, countPhraseMatches, makeSignal, sentences } from "./text";

export function hedgingDensity(text: string): number {
  const sentenceCount = Math.max(sentences(text).length, 1);
  return countPhraseMatches(text, hedges.phrases) / sentenceCount;
}

export function hedgingSignal(text: string, weight = 1) {
  const density = hedgingDensity(text);
  return makeSignal("hedging_density", density, clamp(density * 80), weight);
}
