"use client";
import { useState } from "react";
import type { SignalResult } from "../../core/types";

const SIGNAL_DESCRIPTIONS: Record<string, string> = {
  compression_ratio: "gzip compression ratio — low = repetitive text",
  token_entropy: "N-gram entropy — low = predictable/templated",
  idea_density: "Content words per total words — low = empty sentences",
  diff_overlap: "PR description vs diff Jaccard similarity — high = restating the diff",
  subjectivity: "Subjectivity lexicon ratio — extremes indicate slop",
  hedging_density: "Hedging phrases per sentence — high = AI caution language",
  specificity: "Proper nouns, numbers, dates, URLs per paragraph",
  source_grounding: "Claims vs verifiable sources ratio",
  template_rate: "AI template phrase overlap — high = formulaic writing",
  sentence_variance: "Sentence length std deviation — low = uniform AI rhythm",
  lexical_diversity: "Type-token ratio + hapax legomena — low = small vocabulary",
  readability: "Flesch-Kincaid grade level — extreme values flag filler",
  headline_scan: "Clickbait/sensationalism patterns in headline",
  engagement_bait: "Engagement bait phrases detected",
  keyword_stuffing: "Keyword repetition density",
  listicle_pattern: "List structure ratio — high = low-effort listicle",
  title_body_divergence: "Mismatch between title promise and body content",
  domain_diff_overlap: "Domain-weighted PR description vs diff overlap",
  commit_template_rate: "Templated commit message patterns",
  pr_description_length: "PR description word count — very short = hollow",
};

export function SignalList({ signals }: { signals: SignalResult[] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? signals : signals.slice(0, 6);

  return (
    <div className="space-y-2">
      {shown.map(sig => (
        <div
          key={sig.name}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
            sig.flag
              ? "bg-red-950/30 border-red-800/50"
              : "bg-gray-900 border-gray-800"
          }`}
        >
          <span className="text-lg">{sig.flag ? "⚠️" : "✓"}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm text-gray-200">{sig.name}</span>
              <span className="text-xs text-gray-500 truncate">
                {SIGNAL_DESCRIPTIONS[sig.name] ?? ""}
              </span>
            </div>
            <div className="mt-1 h-1 bg-gray-700 rounded-full">
              <div
                className={`h-full rounded-full ${
                  sig.normalized > 60 ? "bg-red-500" : sig.normalized > 30 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${sig.normalized}%` }}
              />
            </div>
          </div>
          <span className="font-mono text-sm text-gray-400 tabular-nums w-10 text-right">
            {sig.normalized}
          </span>
        </div>
      ))}
      {signals.length > 6 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
        >
          {expanded ? "Show less" : `Show ${signals.length - 6} more signals`}
        </button>
      )}
    </div>
  );
}
