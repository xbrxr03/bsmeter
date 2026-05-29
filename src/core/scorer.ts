import type { BSMeterOptions, BSResult, Highlight, SignalResult } from "./types";
import { computeDensity } from "./density";
import { computeQuality } from "./quality";
import { computeStyle } from "./style";
import { computeDomainSpecific } from "./domains/index";

function toVerdict(score: number): "clean" | "suspect" | "bs" {
  if (score <= 30) return "clean";
  if (score <= 60) return "suspect";
  return "bs";
}

function addHighlightsFromSignals(
  text: string,
  signals: SignalResult[],
  highlights: Highlight[]
): void {
  // Template phrase highlights
  if (signals.find(s => s.name === "template_rate" && s.flag)) {
    const templatePhrases = [
      "in conclusion", "to summarize", "furthermore", "moreover",
      "it is important to note", "first and foremost", "last but not least",
      "at the end of the day", "that being said", "as we can see",
      "delve into", "dive into", "needless to say", "it goes without saying",
    ];
    const lower = text.toLowerCase();
    for (const phrase of templatePhrases) {
      let idx = lower.indexOf(phrase);
      while (idx !== -1) {
        highlights.push({
          start: idx,
          end: idx + phrase.length,
          reason: `AI template phrase: "${phrase}"`,
          severity: "medium",
        });
        idx = lower.indexOf(phrase, idx + 1);
      }
    }
  }

  // Hedging highlights
  if (signals.find(s => s.name === "hedging_density" && s.flag)) {
    const hedges = ["it seems", "arguably", "in many ways", "it could be said", "perhaps", "possibly"];
    const lower = text.toLowerCase();
    for (const hedge of hedges) {
      let idx = lower.indexOf(hedge);
      while (idx !== -1) {
        highlights.push({
          start: idx,
          end: idx + hedge.length,
          reason: "Hedging language",
          severity: "low",
        });
        idx = lower.indexOf(hedge, idx + 1);
      }
    }
  }
}

export function score(text: string, options: BSMeterOptions): BSResult {
  const start = Date.now();
  const allSignals: SignalResult[] = [];
  const highlights: Highlight[] = [];

  const utility = computeDensity(text, options, allSignals);
  const quality = computeQuality(text, options, allSignals);
  const style = computeStyle(text, allSignals);
  const domainSpecific = computeDomainSpecific(text, options, allSignals, highlights);

  addHighlightsFromSignals(text, allSignals, highlights);

  // Composite score: 35% utility + 25% quality + 20% style + 20% domain
  const composite =
    utility.score * 0.35 +
    quality.score * 0.25 +
    style.score * 0.20 +
    domainSpecific.score * 0.20;

  const finalScore = Math.round(Math.min(100, Math.max(0, composite)));

  // Assign contribution to each signal proportionally
  for (const sig of allSignals) {
    sig.contribution = Math.round(sig.normalized * 0.1);
  }

  return {
    score: finalScore,
    verdict: toVerdict(finalScore),
    dimensions: { utility, quality, style },
    domainSpecific,
    signals: allSignals,
    highlights,
    meta: {
      textLength: text.length,
      processingTimeMs: Date.now() - start,
      model: "bsmeter-v1",
    },
  };
}
