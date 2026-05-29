import { scoreUtility } from "./density";
import { scoreCodeReviewDomain, scoreContentSeoDomain, scoreSocialNewsDomain } from "./domains";
import { scoreQuality } from "./quality";
import { scoreStyle } from "./style";
import type { BSDomain, BSResult, BSMeterOptions, BSVerdict, DimensionScore, Highlight } from "./types";

export function verdictForScore(score: number): BSVerdict {
  if (score <= 30) return "clean";
  if (score <= 60) return "suspect";
  return "bs";
}

function stripResults<T extends DimensionScore & { results: unknown[] }>(dimension: T): DimensionScore {
  const { results: _results, ...rest } = dimension;
  return rest;
}

function scoreDomain(text: string, domain: BSDomain, options: BSMeterOptions) {
  if (domain === "code-review") return scoreCodeReviewDomain(text, options.context?.diff ?? "");
  if (domain === "social-news") return scoreSocialNewsDomain(text, options.context?.title ?? "");
  return scoreContentSeoDomain(text, options.context?.title ?? "");
}

function highlights(text: string): Highlight[] {
  const patterns = ["it is important to note", "in conclusion", "furthermore", "moreover", "you won't believe"];
  return patterns.flatMap((pattern) => {
    const index = text.toLowerCase().indexOf(pattern);
    return index >= 0 ? [{ start: index, end: index + pattern.length, reason: "template or clickbait phrase", severity: "medium" as const }] : [];
  });
}

export function bsScore(text: string, options: BSMeterOptions = {}): BSResult {
  const start = performance.now();
  const domain = options.domain ?? "content-seo";
  const utility = scoreUtility(text);
  const quality = scoreQuality(text, domain === "social-news");
  const style = scoreStyle(text);
  const domainSpecific = scoreDomain(text, domain, options);
  const baseScore =
    utility.score * utility.weight +
    quality.score * quality.weight +
    style.score * style.weight +
    domainSpecific.score * domainSpecific.weight;
  const synergyPenalty = utility.score >= 45 && style.score >= 55 ? Math.min(22, (utility.score + style.score - 100) * 0.55) : 0;
  const score = Math.round(baseScore + synergyPenalty);
  const signals = [...utility.results, ...quality.results, ...style.results, ...domainSpecific.results];

  return {
    score: Math.max(0, Math.min(100, score)),
    verdict: verdictForScore(score),
    dimensions: {
      utility: stripResults(utility),
      quality: stripResults(quality),
      style: stripResults(style),
    },
    domainSpecific: stripResults(domainSpecific),
    signals,
    highlights: highlights(text),
    meta: {
      textLength: text.length,
      processingTimeMs: Math.round(performance.now() - start),
      model: "bsmeter-v1",
    },
  };
}
