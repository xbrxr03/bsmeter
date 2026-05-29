import type { SignalResult } from "../core/types";

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function countComplexWords(words: string[]): number {
  return words.filter(w => countSyllables(w) >= 3).length;
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
}

export function readability(text: string): SignalResult {
  const sentences = splitSentences(text);
  const words = text.match(/\b[a-zA-Z]+\b/g) ?? [];

  if (words.length < 10 || sentences.length < 1) {
    return { name: "readability", value: 0, normalized: 50, contribution: 0, flag: false };
  }

  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const wordsPerSentence = words.length / sentences.length;
  const syllablesPerWord = syllables / words.length;
  const complexWords = countComplexWords(words);

  const fleschKincaid = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  const gunningFog = 0.4 * (wordsPerSentence + 100 * (complexWords / words.length));
  const fleschReadingEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;

  // High readability (FK < 8, ease > 70) + low substance = filler
  // Low readability (FK > 16) + repetitive = inflated BS
  const avgGradeLevel = (fleschKincaid + gunningFog) / 2;

  // BS signal: extremely easy (grade < 4) or extremely complex (grade > 18) text
  // with low substance is suspect. Use distance from ideal 8-14 range.
  const deviation = Math.max(0, 4 - avgGradeLevel) + Math.max(0, avgGradeLevel - 14);
  const bsScore = Math.min(100, deviation * 8);

  return {
    name: "readability",
    value: Math.round(avgGradeLevel * 10) / 10,
    normalized: Math.round(bsScore),
    contribution: 0,
    flag: avgGradeLevel < 4 || avgGradeLevel > 18 || fleschReadingEase > 80,
  };
}
