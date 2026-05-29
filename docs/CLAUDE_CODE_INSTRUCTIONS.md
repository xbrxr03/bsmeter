# Claude Code — Build Instructions

**Your job:** Build the core detection engine, web app, and CLI for BS Meter.

## Setup

1. Clone the repo: `git clone https://github.com/xbrxr03/bsmeter.git && cd bsmeter`
2. Run `npm install`
3. Read `docs/ARCHITECTURE.md` — this is your bible. Follow the API contract exactly.

## What You Build

All files marked `[CLAUDE CODE]` in the repo are yours:

### Priority 1: Core Engine
- `src/core/types.ts` — All TypeScript interfaces (BSResult, BSMeterOptions, DimensionScore, SignalResult, Highlight)
- `src/core/scorer.ts` — Composite scorer that combines all 4 layers, applies weights, returns BSResult
- `src/core/density.ts` — Layer 1: Information Utility (calls entropy, idea-density, compression, diff-overlap signals)
- `src/core/quality.ts` — Layer 2: Information Quality (calls subjectivity, hedging, specificity, source-grounding signals)
- `src/core/style.ts` — Layer 3: Style Quality (calls template-rate, sentence-variance, lexical-diversity, readability signals)
- `src/core/index.ts` — Main entry point: `bsScore(text, options) → BSResult`

### Priority 2: Signal Implementations
- `src/signals/compression.ts` — gzip compression ratio (cheapest signal, do this first)
- `src/signals/idea-density.ts` — Propositional idea density via POS tagging (use `compromise`)
- `src/signals/sentence-variance.ts` — Sentence length std deviation
- `src/signals/lexical-diversity.ts` — Type-token ratio + hapax legomena ratio
- `src/signals/readability.ts` — Flesch-Kincaid + Gunning-Fog + Flesch Reading Ease
- `src/signals/hedging.ts` — Hedging phrase detection (load from `src/data/hedging-phrases.json`)
- `src/signals/template-rate.ts` — N-gram overlap with AI templates (load from `src/data/ai-templates.json`)
- `src/signals/subjectivity.ts` — Subjectivity lexicon scoring (load from `src/data/subjectivity-lexicon.json`)
- `src/signals/specificity.ts` — Proper nouns + numbers + dates + URLs per paragraph
- `src/signals/entropy.ts` — Token entropy (GPT-2 via `@xenova/transformers` or n-gram fallback)
- `src/signals/diff-overlap.ts` — PR description vs diff Jaccard similarity (code-review domain only)
- `src/signals/headline-scan.ts` — Clickbait/sensationalism detection (social-news domain only)
- `src/signals/source-grounding.ts` — Source citation presence check (social-news domain only)

### Priority 3: Domain Configs
- `src/core/domains/index.ts` — Domain registry, each domain specifies which signals to use + weights
- `src/core/domains/code-review.ts` — Track A: includes diff-overlap, commit pattern analysis
- `src/core/domains/content-seo.ts` — Track E: includes title-body divergence, keyword stuffing, listicle detection
- `src/core/domains/social-news.ts` — Track H: includes headline-scan, source-grounding, engagement-bait

### Priority 4: Web App (Next.js on Vercel)
- `src/web/api/score.ts` — POST /api/score route
- `src/web/app/layout.tsx` — Next.js layout with dark theme + Tailwind
- `src/web/app/page.tsx` — Home page
- `src/web/components/TextInput.tsx` — Text/URL input + domain selector
- `src/web/components/ScoreDisplay.tsx` — Animated gauge meter + radar chart (recharts)
- `src/web/components/HighlightedText.tsx` — Text with red/yellow/green severity highlights
- `src/web/components/DomainSelector.tsx` — Dropdown for code-review/content-seo/social-news
- `src/web/components/SignalList.tsx` — Expandable list of all signal results

### Priority 5: CLI
- `src/cli/index.ts` — CLI entry point with commander/yargs
- `src/cli/formatters.ts` — Human-readable + JSON output formatters

## Critical Rules

1. **NEVER use an LLM to detect slop.** The hackathon explicitly says no. The ICLR paper proves LLMs fail at this (κ ≈ 0).
2. **All signals must be deterministic and explainable.** Every flag needs a reason a human can read.
3. **Follow the API contract in ARCHITECTURE.md exactly.** Types must match BSResult, BSMeterOptions, etc.
4. **Don't count em-dashes or punctuation.** Explicitly out of scope.
5. **Don't wrap GPTZero, Originality.ai, or any existing detector.** Build your own signals.
6. **Don't shame people for using AI.** We measure quality, not AI-ness.
7. **Report honest failure cases.** Judges reward intellectual honesty more than inflated accuracy.
8. **Dependencies that must work on Vercel:** If GPT-2 via @xenova/transformers is too heavy, use n-gram perplexity approximation instead. Web app MUST deploy to Vercel.

## Scoring Weights

| Dimension | Weight |
|-----------|--------|
| Information Utility | 35% |
| Information Quality | 25% |
| Style Quality | 20% |
| Domain Specific | 20% |

## Verdict Thresholds

| Score | Verdict |
|-------|---------|
| 0-30 | clean |
| 31-60 | suspect |
| 61-100 | bs |

## When Done

1. Run `npm test` — all tests must pass
2. Run `npm run lint` — no type errors
3. Commit to main with descriptive messages
4. Make sure `npm run dev` starts the web app successfully