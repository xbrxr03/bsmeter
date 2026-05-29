"use client";
import { useState } from "react";
import type { BSResult } from "../core/types";
import { TextInput } from "../web/components/TextInput";
import { DomainSelector } from "../web/components/DomainSelector";
import { ScoreDisplay } from "../web/components/ScoreDisplay";
import { SignalList } from "../web/components/SignalList";
import { HighlightedText } from "../web/components/HighlightedText";

export default function Home() {
  const [text, setText] = useState("");
  const [domain, setDomain] = useState<"code-review" | "content-seo" | "social-news">("content-seo");
  const [title, setTitle] = useState("");
  const [diff, setDiff] = useState("");
  const [result, setResult] = useState<BSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          domain,
          context: {
            title: title || undefined,
            diff: diff || undefined,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to score");
      }
      setResult(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="text-red-500">BS</span> Meter
        </h1>
        <p className="text-gray-400 text-lg">
          Not whether it&apos;s AI — whether it&apos;s worth reading.
        </p>
      </header>

      <div className="space-y-4 mb-6">
        <DomainSelector value={domain} onChange={setDomain} />
        <TextInput
          value={text}
          onChange={setText}
          placeholder="Paste text to score..."
          label="Text"
        />
        {domain === "content-seo" || domain === "social-news" ? (
          <TextInput
            value={title}
            onChange={setTitle}
            placeholder="Headline / title (optional)"
            label="Title"
            singleLine
          />
        ) : null}
        {domain === "code-review" ? (
          <TextInput
            value={diff}
            onChange={setDiff}
            placeholder="Paste PR diff here (optional — improves accuracy)"
            label="Diff"
            monospace
          />
        ) : null}
        <button
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? "Scoring..." : "Run BS Meter"}
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      {result && (
        <div className="space-y-8">
          <ScoreDisplay result={result} />
          {result.highlights.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-200">Flagged Text</h2>
              <HighlightedText text={text} highlights={result.highlights} />
            </section>
          )}
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-200">Signal Breakdown</h2>
            <SignalList signals={result.signals} />
          </section>
        </div>
      )}
    </main>
  );
}
