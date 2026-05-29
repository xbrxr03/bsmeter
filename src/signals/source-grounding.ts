import type { SignalResult } from "../core/types";

const URL_RE = /https?:\/\/\S+/g;
const CITATION_RE = /\b(?:according to|reported by|said by|cited by|per|source:|via|quoting|study by|researchers at|scientists at|experts at|published in|study in|report from)\b/gi;
const ATTRIBUTION_RE = /(?:[A-Z][a-z]+ (?:[A-Z][a-z]+ )?(?:said|stated|reported|wrote|noted|confirmed|announced|warned|explained))/g;
const CLAIM_RE = /\b(?:shows?|proves?|reveals?|demonstrates?|confirms?|finds?|found|suggests?|indicates?|claims?|alleges?|reports?)\b/gi;

export function sourceGrounding(text: string): SignalResult {
  const urls = (text.match(URL_RE) ?? []).length;
  const citations = (text.match(CITATION_RE) ?? []).length;
  const attributions = (text.match(ATTRIBUTION_RE) ?? []).length;
  const claims = (text.match(CLAIM_RE) ?? []).length;

  if (claims === 0 && citations === 0) {
    // No claims and no citations — not a news article, neutral
    return { name: "source_grounding", value: 0, normalized: 30, contribution: 0, flag: false };
  }

  const sources = urls + citations + attributions;
  // If lots of claims but no sources = ungrounded = slop
  const ratio = claims > 0 ? sources / claims : 1;
  const bsScore = Math.min(100, Math.max(0, (0.5 - ratio) / 0.5 * 100));

  return {
    name: "source_grounding",
    value: Math.round(ratio * 100) / 100,
    normalized: Math.round(bsScore),
    contribution: 0,
    flag: ratio < 0.2 && claims > 2,
  };
}
