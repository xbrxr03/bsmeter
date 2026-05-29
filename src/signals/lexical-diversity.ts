import { clamp, makeSignal, words } from "./text";

export function lexicalDiversity(text: string): number {
  const tokens = words(text);
  if (!tokens.length) return 0;
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  const typeToken = counts.size / tokens.length;
  const hapax = [...counts.values()].filter((count) => count === 1).length / tokens.length;
  return (typeToken + hapax) / 2;
}

export function lexicalDiversitySignal(text: string, weight = 1) {
  const diversity = lexicalDiversity(text);
  return makeSignal("lexical_diversity", diversity, clamp((0.55 - diversity) * 130), weight);
}
