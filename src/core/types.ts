export type BSDomain = "code-review" | "content-seo" | "social-news";
export type BSVerdict = "clean" | "suspect" | "bs";

export interface BSMeterOptions {
  domain?: BSDomain;
  context?: {
    diff?: string;
    title?: string;
    url?: string;
  };
  threshold?: number;
}

export interface BSResult {
  score: number;
  verdict: BSVerdict;
  dimensions: {
    utility: DimensionScore;
    quality: DimensionScore;
    style: DimensionScore;
  };
  domainSpecific: DimensionScore;
  signals: SignalResult[];
  highlights: Highlight[];
  meta: {
    textLength: number;
    processingTimeMs: number;
    model: "bsmeter-v1";
  };
}

export interface DimensionScore {
  score: number;
  weight: number;
  signals: string[];
  explanation: string;
}

export interface SignalResult {
  name: string;
  value: number;
  normalized: number;
  contribution: number;
  flag: boolean;
}

export interface Highlight {
  start: number;
  end: number;
  reason: string;
  severity: "low" | "medium" | "high";
}

export interface DomainConfig {
  id: BSDomain;
  label: string;
  weight: number;
  explanation: string;
}
