import { clamp, makeSignal, words } from "./text";

export function tokenEntropy(text: string): number {
  const tokens = words(text);
  if (tokens.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  return [...counts.values()].reduce((entropy, count) => {
    const p = count / tokens.length;
    return entropy - p * Math.log2(p);
  }, 0);
}

export function entropySignal(text: string, weight = 1) {
  const entropy = tokenEntropy(text);
  const normalized = clamp((4.2 - entropy) * 24);
  return makeSignal("token_entropy", entropy, normalized, weight);
}
