import { clamp, makeSignal, sentences } from "./text";

export function sourceGrounding(text: string): number {
  const factual = sentences(text).filter((sentence) => /\b(is|are|was|were|will|said|reported|announced|found|showed)\b/i.test(sentence));
  if (!factual.length) return 1;
  const grounded = factual.filter((sentence) =>
    /https?:\/\/|according to|said|reported|Reuters|Associated Press|AP\b|court|filing|study|report|data|survey|\b\d{4}\b/.test(sentence),
  );
  return grounded.length / factual.length;
}

export function sourceGroundingSignal(text: string, weight = 1) {
  const grounding = sourceGrounding(text);
  return makeSignal("source_grounding", grounding, clamp((0.65 - grounding) * 120), weight);
}
