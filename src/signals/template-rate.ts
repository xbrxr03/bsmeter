import templates from "../data/ai-templates.json";
import { clamp, countPhraseMatches, makeSignal, words } from "./text";

export function templateRate(text: string): number {
  const tokenCount = Math.max(words(text).length, 1);
  return countPhraseMatches(text, templates.phrases) / tokenCount;
}

export function templateRateSignal(text: string, weight = 1) {
  const rate = templateRate(text);
  return makeSignal("template_rate", rate, clamp(rate * 900), weight);
}
