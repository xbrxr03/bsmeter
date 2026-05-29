import { clamp, makeSignal, sentences, words } from "./text";

function syllables(word: string): number {
  const groups = word.toLowerCase().replace(/e$/, "").match(/[aeiouy]+/g);
  return Math.max(groups?.length ?? 1, 1);
}

export function fleschKincaidGrade(text: string): number {
  const tokenList = words(text);
  const sentenceCount = Math.max(sentences(text).length, 1);
  const syllableCount = tokenList.reduce((sum, word) => sum + syllables(word), 0);
  if (!tokenList.length) return 0;
  return 0.39 * (tokenList.length / sentenceCount) + 11.8 * (syllableCount / tokenList.length) - 15.59;
}

export function readabilitySignal(text: string, weight = 1) {
  const grade = fleschKincaidGrade(text);
  const normalized = grade > 18 ? (grade - 18) * 8 : grade < 4 ? (4 - grade) * 8 : 5;
  return makeSignal("readability_swing", grade, clamp(normalized), weight);
}
