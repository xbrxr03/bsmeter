export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

export function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z'-]*/g) ?? [];
}

export function uniqueWords(text: string): Set<string> {
  return new Set(words(text).filter((word) => word.length > 2));
}

export function sentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function paragraphs(text: string): string[] {
  const blocks = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return blocks.length ? blocks : [text.trim()].filter(Boolean);
}

export function countPhraseMatches(text: string, phrases: string[]): number {
  const lower = text.toLowerCase();
  return phrases.reduce((count, phrase) => {
    const escaped = phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return count + (lower.match(new RegExp(`\\b${escaped}\\b`, "g"))?.length ?? 0);
  }, 0);
}

export function makeSignal(name: string, value: number, normalized: number, weight = 1) {
  const score = clamp(normalized);
  return {
    name,
    value,
    normalized: score,
    contribution: score * weight,
    flag: score >= 55,
  };
}
