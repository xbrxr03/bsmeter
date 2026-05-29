"use client";
import type { Highlight } from "../../core/types";

function severityStyle(severity: Highlight["severity"]): string {
  if (severity === "high") return "bg-red-900/60 border-b-2 border-red-500 text-red-200";
  if (severity === "medium") return "bg-yellow-900/40 border-b-2 border-yellow-500 text-yellow-200";
  return "bg-blue-900/30 border-b-2 border-blue-500 text-blue-200";
}

interface Segment {
  text: string;
  highlight?: Highlight;
}

function buildSegments(text: string, highlights: Highlight[]): Segment[] {
  if (highlights.length === 0) return [{ text }];

  // Sort by start position
  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const segments: Segment[] = [];
  let cursor = 0;

  for (const h of sorted) {
    const start = Math.max(h.start, cursor);
    const end = Math.min(h.end, text.length);
    if (start >= end) continue;

    if (cursor < start) {
      segments.push({ text: text.slice(cursor, start) });
    }
    segments.push({ text: text.slice(start, end), highlight: h });
    cursor = end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) });
  }

  return segments;
}

export function HighlightedText({ text, highlights }: { text: string; highlights: Highlight[] }) {
  const segments = buildSegments(text, highlights);

  return (
    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words border border-gray-700">
      {segments.map((seg, i) =>
        seg.highlight ? (
          <span
            key={i}
            className={`cursor-help rounded px-0.5 ${severityStyle(seg.highlight.severity)}`}
            title={seg.highlight.reason}
          >
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </div>
  );
}
