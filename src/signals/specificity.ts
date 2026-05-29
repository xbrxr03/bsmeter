import { clamp, makeSignal, paragraphs } from "./text";

export function specificityScore(text: string): number {
  const paragraphCount = Math.max(paragraphs(text).length, 1);
  const numbers = text.match(/\b\d{1,4}(?:[.,:/-]\d{1,4})*\b/g)?.length ?? 0;
  const urls = text.match(/https?:\/\/\S+|www\.\S+/g)?.length ?? 0;
  const dates = text.match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}\b/gi)?.length ?? 0;
  const properNouns = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g)?.length ?? 0;
  return (numbers + urls * 2 + dates + properNouns) / paragraphCount;
}

export function specificitySignal(text: string, weight = 1) {
  const score = specificityScore(text);
  const normalized = clamp((2.5 - score) * 28);
  return makeSignal("specificity", score, normalized, weight);
}
