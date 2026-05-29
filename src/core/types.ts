export interface BSMeterOptions {
  domain: "code-review" | "content-seo" | "social-news";
  context?: {
    diff?: string;
    title?: string;
    url?: string;
  };
  threshold?: number;
}

export interface SignalResult {
  name: string;
  value: number;
  normalized: number;
  contribution: number;
  flag: boolean;
}

export interface DimensionScore {
  score: number;
  weight: number;
  signals: string[];
  explanation: string;
}

export interface Highlight {
  start: number;
  end: number;
  reason: string;
  severity: "low" | "medium" | "high";
}

export interface BSResult {
  score: number;
  verdict: "clean" | "suspect" | "bs";
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
