import type { BSMeterOptions, DimensionScore, Highlight, SignalResult } from "../types";

function detectKeywordStuffing(text: string): number {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) ?? [];
  if (words.length === 0) return 0;
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  const stopwords = new Set(["the", "a", "an", "is", "are", "was", "in", "on", "of", "to", "and", "or", "for", "with", "it", "this", "that", "be", "by", "as", "at"]);
  const contentWords = [...freq.entries()].filter(([w]) => !stopwords.has(w) && w.length > 3);
  if (contentWords.length === 0) return 0;
  const maxFreq = Math.max(...contentWords.map(([, c]) => c));
  const maxRatio = maxFreq / words.length;
  return Math.min(100, maxRatio / 0.05 * 100);
}

function detectListicle(text: string): number {
  const lines = text.split("\n");
  const listLines = lines.filter(l => /^\s*[-*•]|\d+\.\s/.test(l));
  const ratio = listLines.length / Math.max(lines.length, 1);
  return Math.min(100, ratio / 0.5 * 80);
}

function titleBodyDivergence(title: string, body: string): number {
  if (!title) return 0;
  const titleWords = new Set(title.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? []);
  const bodyWords = new Set(body.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? []);
  if (titleWords.size === 0) return 0;
  const overlap = [...titleWords].filter(w => bodyWords.has(w)).length;
  const divergence = 1 - overlap / titleWords.size;
  return Math.round(Math.min(100, divergence * 80));
}

export function contentSeoDomain(
  text: string,
  options: BSMeterOptions,
  allSignals: SignalResult[],
  highlights: Highlight[]
): DimensionScore {
  const signals: SignalResult[] = [];

  const stuffingScore = detectKeywordStuffing(text);
  signals.push({
    name: "keyword_stuffing",
    value: Math.round(stuffingScore),
    normalized: stuffingScore,
    contribution: 0,
    flag: stuffingScore > 50,
  });

  const listicleScore = detectListicle(text);
  signals.push({
    name: "listicle_pattern",
    value: Math.round(listicleScore),
    normalized: listicleScore,
    contribution: 0,
    flag: listicleScore > 60,
  });

  if (options.context?.title) {
    const divergence = titleBodyDivergence(options.context.title, text);
    signals.push({
      name: "title_body_divergence",
      value: divergence,
      normalized: divergence,
      contribution: 0,
      flag: divergence > 50,
    });
    if (divergence > 50) {
      highlights.push({
        start: 0,
        end: Math.min(200, text.length),
        reason: "Content doesn't match what the title promised",
        severity: "medium",
      });
    }
  }

  allSignals.push(...signals);

  const weights = options.context?.title ? [0.35, 0.30, 0.35] : [0.50, 0.50];
  const usedSignals = options.context?.title ? signals : signals.slice(0, 2);
  const score = usedSignals.reduce((sum, s, i) => sum + s.normalized * weights[i], 0);

  const flagged = signals.filter(s => s.flag).map(s => s.name);
  return {
    score: Math.round(score),
    weight: 0.20,
    signals: signals.map(s => s.name),
    explanation: flagged.length > 0
      ? `SEO/content issues: ${flagged.join(", ")}`
      : "Content structure looks legitimate",
  };
}
