import nlp from "compromise";
import type { SignalResult } from "../core/types";

const URL_RE = /https?:\/\/\S+/g;
const NUMBER_RE = /\b\d+(?:[.,]\d+)?(?:%|px|kb|mb|gb|ms|s|m|h|km|mph)?\b/gi;
const DATE_RE = /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:,\s*\d{4})?|\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/gi;

export function specificity(text: string): SignalResult {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const paraCount = Math.max(1, paragraphs.length);

  const doc = nlp(text);
  const properNouns = doc.match("#ProperNoun+").out("array") as string[];

  const urls = (text.match(URL_RE) ?? []).length;
  const numbers = (text.match(NUMBER_RE) ?? []).length;
  const dates = (text.match(DATE_RE) ?? []).length;
  const props = properNouns.length;

  const specificityScore = (urls + numbers + dates + props) / paraCount;
  // Low specificity = vague = slop. Typical: <1 (very vague) to >6 (very specific)
  const bsScore = Math.min(100, Math.max(0, (3.0 - specificityScore) / 2.5 * 100));

  return {
    name: "specificity",
    value: Math.round(specificityScore * 100) / 100,
    normalized: Math.round(bsScore),
    contribution: 0,
    flag: specificityScore < 1.0,
  };
}
