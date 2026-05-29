import type { BSDomain, DomainConfig } from "../types";

export const domainConfigs: Record<BSDomain, DomainConfig> = {
  "code-review": {
    id: "code-review",
    label: "Code Review",
    weight: 0.2,
    explanation: "Scores PR descriptions for diff restatement and hollow implementation summaries.",
  },
  "content-seo": {
    id: "content-seo",
    label: "Content & SEO",
    weight: 0.2,
    explanation: "Scores keyword stuffing, listicle framing, and title-body mismatch.",
  },
  "social-news": {
    id: "social-news",
    label: "Social & News",
    weight: 0.2,
    explanation: "Scores clickbait, sensationalism, engagement bait, and source grounding.",
  },
};

export function getDomainConfig(domain: BSDomain = "content-seo"): DomainConfig {
  return domainConfigs[domain] ?? domainConfigs["content-seo"];
}

export { scoreCodeReviewDomain } from "./code-review";
export { scoreContentSeoDomain } from "./content-seo";
export { scoreSocialNewsDomain } from "./social-news";
