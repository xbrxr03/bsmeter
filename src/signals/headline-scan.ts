import clickbait from "../data/clickbait-patterns.json";
import { clamp, countPhraseMatches, makeSignal, words } from "./text";

export function headlineSensationalism(title = "", body = ""): number {
  const text = `${title} ${body.slice(0, 240)}`;
  const phraseHits = countPhraseMatches(text, clickbait.patterns);
  const wordHits = words(text).filter((word) => clickbait.sensationalist_words.includes(word)).length;
  return phraseHits * 2 + wordHits;
}

export function headlineSignal(title = "", body = "", weight = 1) {
  const score = headlineSensationalism(title, body);
  return makeSignal("headline_sensationalism", score, clamp(score * 18), weight);
}
