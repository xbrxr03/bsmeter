# BS Meter — Architecture & Repo Structure

**For:** DEV Agent (repo setup) → Claude Code (engine + app) → Codex (data + tests)
**Created:** 2026-05-29 15:43 EDT

---

## Repo: `xbrxr03/bsmeter`

### File Structure

```
bsmeter/
├── README.md                    # Detection approach, honest numbers, how to use
├── CONTRIBUTING.md               # Open source contribution guide
├── LICENSE                       # MIT
├── package.json                  # npm package root
├── pyproject.toml                # pip package (optional, if we do Python too)
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions CI
├── docs/
│   ├── ARCHITECTURE.md           # This file — full architecture spec
│   ├── DETECTION_APPROACH.md     # Detection philosophy + signal explanations
│   ├── BAKE_OFF.md              # Bake-off results + confusion matrix
│   └── HONEST_NUMBERS.md         # Where BS Meter fails
├── src/
│   ├── core/
│   │   ├── index.ts              # Main entry: bsScore(text, options) → BSResult
│   │   ├── types.ts              # All TypeScript interfaces/types
│   │   ├── scorer.ts             # Composite scorer — combines all layers
│   │   ├── density.ts            # Layer 1: Information Utility signals
│   │   ├── quality.ts            # Layer 2: Information Quality signals
│   │   ├── style.ts              # Layer 3: Style Quality signals
│   │   └── domains/
│   │       ├── index.ts          # Domain registry
│   │       ├── code-review.ts    # Track A: PR/diff/commit analysis
│   │       ├── content-seo.ts    # Track E: Blog/SEO analysis
│   │       └── social-news.ts    # Track H: News/social analysis
│   ├── signals/
│   │   ├── entropy.ts            # GPT-2 token entropy calculation
│   │   ├── compression.ts       # gzip compression ratio
│   │   ├── idea-density.ts       # Propositional idea density (POS tagging)
│   │   ├── subjectivity.ts       # Subjectivity lexicon scoring
│   │   ├── hedging.ts           # Hedging phrase detection
│   │   ├── specificity.ts        # Proper nouns, numbers, dates, URLs per paragraph
│   │   ├── template-rate.ts      # N-gram template overlap with AI patterns
│   │   ├── sentence-variance.ts  # Sentence length variance
│   │   ├── lexical-diversity.ts  # Type-token ratio, hapax legomena
│   │   ├── readability.ts        # Flesch-Kincaid, Gunning-Fog, Flesch Reading Ease
│   │   ├── diff-overlap.ts       # PR description vs diff semantic overlap
│   │   ├── headline-scan.ts     # Sensationalism + clickbait detection
│   │   └── source-grounding.ts   # Claim verifiability + source citation check
│   ├── data/
│   │   ├── ai-templates.json     # Known AI phrase/structure patterns
│   │   ├── hedging-phrases.json  # Hedging phrase lexicon
│   │   ├── subjectivity-lexicon.json  # Wiebe et al. subjectivity words
│   │   └── clickbait-patterns.json     # Clickbait headline patterns
│   ├── cli/
│   │   ├── index.ts              # CLI entry point
│   │   └── formatters.ts         # Output formatters (human, JSON)
│   └── web/
│       ├── api/
│       │   └── score.ts          # API route: POST /api/score
│       ├── components/
│       │   ├── ScoreDisplay.tsx   # Radar chart + score breakdown
│       │   ├── TextInput.tsx      # Text/URL input form
│       │   ├── HighlightedText.tsx # Highlighted slop regions
│       │   ├── DomainSelector.tsx  # Track selector dropdown
│       │   └── SignalList.tsx     # Individual signal breakdown
│       ├── pages/
│       │   └── index.tsx          # Main web app page
│       ├── app/
│       │   ├── layout.tsx         # Next.js layout
│       │   └── page.tsx           # Next.js home page
│       └── styles/
│           └── globals.css
├── data/
│   └── bake-off/
│       ├── code-review/
│       │   ├── slop/              # 20 slop PRs (JSON)
│       │   └── clean/             # 20 clean PRs (JSON)
│       ├── content-seo/
│       │   ├── slop/              # 20 slop blog posts
│       │   └── clean/             # 20 clean blog posts
│       └── social-news/
│           ├── slop/              # 20 slop news articles
│           └── clean/             # 20 clean news articles
├── tests/
│   ├── core/
│   │   ├── scorer.test.ts
│   │   ├── density.test.ts
│   │   ├── quality.test.ts
│   │   └── style.test.ts
│   ├── signals/
│   │   ├── entropy.test.ts
│   │   ├── compression.test.ts
│   │   └── ...
│   └── domains/
│       ├── code-review.test.ts
│       ├── content-seo.test.ts
│       └── social-news.test.ts
└── scripts/
    ├── collect-github-prs.ts     # Codex: scrape PRs for bake-off
    ├── collect-blog-posts.ts     # Codex: scrape blog posts
    ├── collect-news-articles.ts # Codex: scrape news
    └── run-bakeoff.ts            # Run bake-off + generate confusion matrix
```

---

## Core API Contract

### `bsScore(text, options) → BSResult`

**Input:**
```typescript
interface BSMeterOptions {
  domain: "code-review" | "content-seo" | "social-news";
  context?: {
    diff?: string;           // For code-review: the PR diff
    title?: string;          // For content-seo/social-news: headline/title
    url?: string;            // Source URL (for live fire)
  };
  threshold?: number;       // Default: 50. Above = slop.
}
```

**Output:**
```typescript
interface BSResult {
  score: number;            // 0-100 (100 = maximum BS)
  verdict: "clean" | "suspect" | "bs";
  dimensions: {
    utility: DimensionScore;  // Information Utility
    quality: DimensionScore;   // Information Quality
    style: DimensionScore;     // Style Quality
  };
  domainSpecific: DimensionScore;  // Track-specific checks
  signals: SignalResult[];   // All individual signal results
  highlights: Highlight[];    // Where the BS is in the text
  meta: {
    textLength: number;
    processingTimeMs: number;
    model: "bsmeter-v1";
  };
}

interface DimensionScore {
  score: number;            // 0-100
  weight: number;           // How much this dimension counts
  signals: string[];         // Which signals contributed
  explanation: string;       // Human-readable reason
}

interface SignalResult {
  name: string;             // e.g., "compression_ratio"
  value: number;            // Raw metric value
  normalized: number;        // 0-100 scale
  contribution: number;      // How much it moved the score
  flag: boolean;             // Did this signal flag a problem?
}

interface Highlight {
  start: number;            // Character offset
  end: number;              // Character offset
  reason: string;           // e.g., "circular reference", "diff-restating"
  severity: "low" | "medium" | "high";
}
```

### Scoring Weights (initial, tunable)

| Dimension | Weight | Rationale |
|-----------|--------|-----------|
| Information Utility | 35% | ICLR paper: Density + Relevance = strongest predictors |
| Information Quality | 25% | Specificity + factuality matter for trust |
| Style Quality | 20% | Repetition + templatedness = obvious slop signals |
| Domain Specific | 20% | Track-specific context (diff overlap, headline divergence, etc.) |

### Verdict Thresholds

| Score | Verdict |
|-------|---------|
| 0-30 | clean ✅ |
| 31-60 | suspect ⚠️ |
| 61-100 | bs 🚨 |

---

## Signal Specifications

### Layer 1: Information Utility

**1a. Token Entropy**
- Method: Run text through GPT-2 small, measure mean token log-probability
- Low entropy = predictable/templated = slop signal
- Implementation: Use `gpt-2` via `transformers.js` or pre-computed reference distributions
- Fallback if GPT-2 too heavy for Vercel: Use n-gram perplexity approximation

**1b. Idea Density**
- Method: Count propositional content words (verbs, adjectives, adverbs, prepositions, conjunctions) / total words
- Low density = sentences that say nothing
- Implementation: POS tagging via `compromise` or similar lightweight NLP

**1c. Compression Ratio**
- Method: `gzip(text).length / text.length`
- Low ratio = repetitive/redundant = slop signal
- Cheap to compute, fast, always available

**1d. Diff-Restating Score** (code-review only)
- Method: Semantic overlap between PR description and actual diff
- If description just restates what the diff shows = slop
- Implementation: Tokenize both, compute Jaccard similarity of content words

### Layer 2: Information Quality

**2a. Subjectivity Ratio**
- Method: Count words in Wiebe subjectivity lexicon / total words
- Extremely low = corporate AI speak. Extremely high = rant.
- Both extremes can indicate slop depending on domain

**2b. Hedging Density**
- Method: Count hedging phrases ("it seems", "arguably", "in many ways", "it could be said") / total sentences
- High hedging = AI playing it safe = slop signal

**2c. Specificity Score**
- Method: Count proper nouns + numbers + dates + URLs / total paragraphs
- Low specificity = vague claims without concrete details = slop

**2d. Source Grounding** (social-news only)
- Method: Extract claims (sentences with factual assertions), check for verifiable entities (org names, people, dates with context)
- Low grounding = unverifiable claims

### Layer 3: Style Quality

**3a. Template Rate**
- Method: N-gram overlap with known AI template phrases/structures
- High overlap = formulaic = slop
- Template DB: "In conclusion", "It's important to note", "Furthermore", etc.

**3b. Sentence Length Variance**
- Method: Standard deviation of sentence lengths (in words)
- Low variance = uniform sentence length = typical AI pattern
- Human writing has natural burstiness

**3c. Lexical Diversity**
- Method: Type-token ratio + hapax legomena (words appearing once) ratio
- Low diversity = small vocabulary, repeated phrases = slop

**3d. Readability Swing**
- Method: Flesch-Kincaid + Gunning-Fog index
- High readability + low substance = oversimplified filler
- Low readability + low substance = unnecessarily complex BS

**3e. Paragraph Structure**
- Method: Detect intro-body-conclusion pattern in short text
- AI template applied to trivial content = slop

### Layer 4: Domain Specific

**Code Review:**
- Diff-restating score (see 1d)
- Commit message pattern analysis (templated messages)
- Code comment density vs code substance

**Content & SEO:**
- Title-body divergence (headline promises X, body delivers Y)
- Keyword stuffing ratio
- Listicle pattern detection
- Paragraph-to-substance ratio (long paragraphs, zero concrete info)

**Social & News:**
- Headline sensationalism score (clickbait patterns)
- Source citation presence (does the article cite sources?)
- Engagement-bait pattern detection ("You won't believe...", "This one trick...")
- Claim verifiability (can claims be checked?)

---

## Web App Specs

**Stack:** Next.js 14 + TypeScript + Tailwind CSS → Deploy on Vercel

**Pages:**
1. Home — text input, domain selector, "Run BS Meter" button
2. Results — radar chart (3 dimensions), overall score with gauge animation, highlighted text, signal breakdown list

**Visual Design:**
- Dark theme (dev tool aesthetic)
- Score gauge: animated needle/meter (fits the "BS Meter" name)
- Radar chart: 3 axes (Utility, Quality, Style)
- Highlighted text: red/yellow/green severity coloring
- Mobile responsive

**API:**
- `POST /api/score` — accepts text + options, returns BSResult
- Rate limited (simple in-memory for hackathon)

---

## CLI Specs

**Package:** `bsmeter` (npm)
**Entry:** `npx bsmeter` or global install

```
bsmeter scan "Your text here"                    # Quick score
bsmeter scan --domain code-review "PR desc"      # Domain-specific
bsmeter scan --json "text"                       # JSON output
bsmeter pr https://github.com/owner/repo/pull/123  # Analyze a GitHub PR
bsmeter file ./path/to/file.md                   # Score a file
bsmeter batch ./docs/                            # Score all files in dir
```

Exit codes: 0 = clean, 1 = suspect, 2 = bs (useful for CI)

---

## Worker Assignments (Who Builds What)

### DEV Agent — Repo Setup + Packaging + Docs
- [ ] Create GitHub repo `xbrxr03/bsmeter`
- [ ] Push this ARCHITECTURE.md + README stub + LICENSE + .gitignore
- [ ] Set up file structure (empty files with comments marking ownership)
- [ ] Set up GitHub Actions CI (test + lint on push)
- [ ] npm package.json setup
- [ ] CONTRIBUTING.md
- [ ] Final README polish

### Claude Code Pro — Core Engine + Web App + CLI
- [ ] `src/core/` — scorer.ts, density.ts, quality.ts, style.ts + all types
- [ ] `src/signals/` — all signal implementations
- [ ] `src/domains/` — all domain configs
- [ ] `src/data/` — AI template/pattern databases
- [ ] `src/web/` — Next.js app (API + UI)
- [ ] `src/cli/` — CLI tool
- [ ] Tests for core + signals + domains

### Codex — Data Collection + Templates + Tests
- [ ] `data/bake-off/code-review/` — collect 40 GitHub PRs (20 slop/20 clean)
- [ ] `data/bake-off/content-seo/` — collect 40 blog posts (20 slop/20 clean)
- [ ] `data/bake-off/social-news/` — collect 40 news articles (20 slop/20 clean)
- [ ] `src/data/ai-templates.json` — AI phrase/structure pattern database
- [ ] `src/data/hedging-phrases.json` — hedging phrase lexicon
- [ ] `src/data/clickbait-patterns.json` — clickbait headline patterns
- [ ] `src/data/subjectivity-lexicon.json` — Wiebe et al. subjectivity words
- [ ] `scripts/collect-*.ts` — data collection scripts
- [ ] `scripts/run-bakeoff.ts` — bake-off runner + confusion matrix generator
- [ ] Integration + smoke tests

### SCOUT — Research + Tracking + Gap Analysis
- [ ] Track all build progress in STATE.md
- [ ] Log decisions in LOG.md
- [ ] Research additional signals/approaches on demand
- [ ] Flag gaps and risks
- [ ] Competitive intel (what other teams might build)
- [ ] Draft demo script for Boss

---

## Tech Stack Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Language | TypeScript | Same language for engine + web + CLI. Vercel native. |
| Web framework | Next.js 14 | Vercel deploy, API routes built-in |
| NLP (lightweight) | compromise.js | POS tagging, sentence splitting — runs in browser + Node |
| NLP (entropy) | @xenova/transformers or pre-computed | GPT-2 for token entropy. Fallback to n-gram if too heavy. |
| Charts | recharts | Radar chart + gauge. Simple, works with Next.js. |
| Styling | Tailwind CSS | Fast to build, dark theme out of box |
| Testing | vitest | Fast, TypeScript native, good for signals |
| CI | GitHub Actions | Standard, free for public repos |
| Package | npm (primary) | `bsmeter` CLI. pip optional if time. |

---

## What NOT to Build (Explicitly Out of Scope)

1. ❌ Em-dash / punctuation counters (hackathon says no)
2. ❌ GPTZero / Originality.ai wrappers (hackathon says no)
3. ❌ "Ask an LLM if it's AI" (hackathon says no, ICLR paper shows it fails)
4. ❌ Tools that shame people for using AI (hackathon says no)
5. ❌ Ideas too big to demo in 72h (keep scope tight)
6. ❌ Browser extension (CUT if not started by hour 40)
7. ❌ pip package (CUT if npm + web app aren't done first)
8. ❌ Image/video analysis (text only — stay focused)