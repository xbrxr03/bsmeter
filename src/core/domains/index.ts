import type { BSMeterOptions, DimensionScore, Highlight, SignalResult } from "../types";
import { codeReviewDomain } from "./code-review";
import { contentSeoDomain } from "./content-seo";
import { socialNewsDomain } from "./social-news";

export function computeDomainSpecific(
  text: string,
  options: BSMeterOptions,
  allSignals: SignalResult[],
  highlights: Highlight[]
): DimensionScore {
  switch (options.domain) {
    case "code-review":
      return codeReviewDomain(text, options, allSignals, highlights);
    case "content-seo":
      return contentSeoDomain(text, options, allSignals, highlights);
    case "social-news":
      return socialNewsDomain(text, options, allSignals, highlights);
  }
}
