import { clamp, makeSignal, sentences, words } from "./text";

export function sentenceLengthVariance(text: string): number {
  const lengths = sentences(text).map((sentence) => words(sentence).length).filter(Boolean);
  if (lengths.length < 2) return 0;
  const mean = lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
  return Math.sqrt(lengths.reduce((sum, length) => sum + (length - mean) ** 2, 0) / lengths.length);
}

export function sentenceVarianceSignal(text: string, weight = 1) {
  const variance = sentenceLengthVariance(text);
  return makeSignal("sentence_variance", variance, clamp((7 - variance) * 10), weight);
}
