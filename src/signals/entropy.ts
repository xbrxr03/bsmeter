import type { SignalResult } from "../core/types";

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/\b[a-z']+\b/g) ?? [];
}

function buildNgramFreq(tokens: string[], n: number): Map<string, number> {
  const freq = new Map<string, number>();
  for (let i = 0; i <= tokens.length - n; i++) {
    const key = tokens.slice(i, i + n).join(" ");
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }
  return freq;
}

// N-gram perplexity approximation: low perplexity = predictable = slop
export function tokenEntropy(text: string): SignalResult {
  const tokens = tokenize(text);
  if (tokens.length < 10) {
    return { name: "token_entropy", value: 0, normalized: 50, contribution: 0, flag: false };
  }

  // Unigram distribution entropy
  const uniFreq = buildNgramFreq(tokens, 1);
  const total = tokens.length;
  let entropy = 0;
  for (const count of uniFreq.values()) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }

  // Bigram joint entropy
  const biFreq = buildNgramFreq(tokens, 2);
  const biTotal = total - 1;
  let biEntropy = 0;
  for (const biCount of biFreq.values()) {
    const p = biCount / biTotal;
    biEntropy -= p * Math.log2(p);
  }
  // Conditional bigram entropy H(word_n | word_{n-1}) = H(bigram) - H(unigram)
  const conditionalEntropy = Math.max(0, biEntropy - entropy);

  // Use a weighted combination: unigram entropy + conditional entropy
  // Both low = predictable/repetitive = slop
  const combinedEntropy = entropy * 0.5 + conditionalEntropy * 0.5;
  // Typical range: ~0 (very repetitive) to ~4.5 (diverse)
  // BS score: high when entropy is low
  const bsScore = Math.min(100, Math.max(0, (3.5 - combinedEntropy) / 3.0 * 100));

  return {
    name: "token_entropy",
    value: Math.round(combinedEntropy * 100) / 100,
    normalized: Math.round(bsScore),
    contribution: 0,
    flag: combinedEntropy < 3.5,
  };
}
