# SLOP SCAN — Full Build Plan

**Created:** 2026-05-29 15:24 EDT
**Deadline:** Jun 1, 17:00 UTC (1:00 PM EDT) — ~69h remaining
**Status:** PRE-BUILD — Boss reviewing plan before starting

---

## 🧠 Research Foundation

### Key Academic Paper: "Measuring AI Slop in Text" (Shaib et al., ICLR 2026)
This is THE paper on slop measurement. Their framework gives us legit, defensible signals — not hacks.

**Their 3 Dimensions:**

| Dimension | What it measures | Automatable metrics |
|-----------|-----------------|---------------------|
| **Information Utility** | Does the text convey meaningful info? | Token entropy (GPT-2), propositional idea density, relevance scoring |
| **Information Quality** | Is it accurate and appropriately subjective? | Subjectivity lexicon (Wiebe et al.), factuality checks |
| **Style Quality** | Is the expression natural and readable? | Compression ratios, template rate, sentence length, Gunning-Fog, Flesch-Kincaid |

**Their key findings:**
- Binary "slop" judgments are subjective but **correlate with Density, Relevance, and Tone** (strongest predictors)
- Current automatic metrics capture some signal but aren't sufficient alone (AUPRC 0.52-0.55)
- LLMs-as-judges (GPT-5, Deepseek, o3-mini) performed POORLY at slop detection — κ ≈ 0
- **This means: don't use an LLM to detect slop. Build real metrics.**
- The best approach: combine multiple signals from different dimensions

### Existing Tool: modem-dev/slop-scan (169⭐)
- **Scope:** Only code repos (JS/TS). Only structural patterns (empty catches, pass-through wrappers, etc.)
- **Limitation:** It's a linter, not a text quality analyzer. Doesn't analyze PR descriptions, docs, or any natural language.
- **Opportunity:** We go where they can't — natural language slop across domains.

### Existing Submission: SlopChop (Devpost)
- **Approach:** Browser extension that wraps 2 AI text detection models + 1 AI image detection model
- **Problem:** This is exactly what SLOP SCAN says NOT to do ("not a GPTZero wrapper")
- **Opportunity:** Our approach is fundamentally different — we measure quality, not AI-ness

---

## 🎯 Project Definition

### Tool Name: **BS Meter**
### Tagline: "Information quality scoring for AI-generated text — not whether it's AI, but whether it's worth reading."

### The Key Insight (differentiator)
Everyone else will build "is this AI?" detectors. **We build "is this worth reading?" scorers.**

The hackathon explicitly says: "We're not against AI. We're against the lazy defaults." Our tool doesn't ask "was this made with AI?" — it asks "did a human actually check this before hitting publish?"

This is philosophically aligned with the hackathon AND academically grounded.

### Primary Track: A — Code Review
### Cross-Tracks: E (Content & SEO) + H (Social & News)

---

## 🔬 Detection Engine — The Core

### Architecture: Multi-Signal Slop Scorer

```
slop-score(text, { domain, context? }) → {
  overall: 0-100,        // composite score
  verdict: "clean" | "likely-slop" | "slop",
  dimensions: {
    density: { score, signals[] },    // Information Utility
    quality: { score, signals[] },     // Information Quality
    style: { score, signals[] },       // Style Quality
  },
  domain_specific: { score, signals[] }, // Track-specific checks
  highlights: [{ start, end, reason }] // Where the slop is
}
```

### Signal Stack (from ICLR paper + our additions)

**Layer 1: Information Utility (automated)**
| Signal | Method | What it catches |
|--------|--------|----------------|
| Token entropy | GPT-2 small forward pass, measure mean H(X) | Low entropy = predictable/templated text |
| Idea density | POS tag count (verbs, adjectives, adverbs, prepositions, conjunctions per sentence) | Sentences that say nothing |
| Compression ratio | gzip(text) / len(text) | Repetitive/redundant text compresses well |
| Diff-restating score | For PRs: semantic overlap between diff and description | PR description just restates the code changes |

**Layer 2: Information Quality (automated)**
| Signal | Method | What it catches |
|--------|--------|----------------|
| Subjectivity ratio | Wiebe lexicon / total words | Overly objective corporate-speak or overly subjective rants |
| Source grounding | For news: extract claims, check if verifiable entities present | Unverifiable claims |
| Hedging density | Count hedging phrases ("it seems", "arguably", "in many ways") | AI hedging patterns |
| Specificity score | Count proper nouns, numbers, dates, URLs per paragraph | Vague claims without specifics |

**Layer 3: Style Quality (automated)**
| Signal | Method | What it catches |
|--------|--------|----------------|
| Template rate | N-gram overlap with known AI templates | Formulaic structure ("In conclusion", "It's important to note") |
| Sentence length variance | Std dev of sentence lengths | AI text has uniform sentence length |
| Lexical diversity | Type-token ratio + hapax legomena ratio | Small vocabulary, repeated phrases |
| Readability swing | Flesch-Kincaid + Gunning-Fog | Unnecessarily complex vocabulary |
| Paragraph structure | Detect intro-body-conclusion pattern in short text | AI template applied to trivial content |

**Layer 4: Domain-Specific (per track)**
| Track | Specific checks |
|-------|----------------|
| **Code Review** | PR description vs diff overlap, commit message pattern analysis, code comment density vs code substance |
| **Content & SEO** | Title-body divergence, keyword stuffing ratio, listicle pattern detection, paragraph-to-substance ratio |
| **Social & News** | Headline sensationalism score, source citation presence, engagement-bait pattern detection, claim verifiability |

### Why This Works
1. **Multiple orthogonal signals** — no single metric catches everything, but together they're powerful
2. **Explainable** — every flag has a reason, not a black box
3. **Not an LLM wrapper** — all signals are computed deterministically
4. **Academically grounded** — directly based on ICLR 2026 paper's framework
5. **Honest** — we report where it fails, not just where it succeeds

---

## 🏗️ Delivery Surfaces

### 1. Web App (Vercel) — PRIMARY DEMO
- Paste text or URL → get slop score with breakdown
- Visual: radar chart of 3 dimensions, highlighted text, signal list
- Domain selector: "Code Review", "Blog/SEO", "News/Social"
- For Code Review: paste GitHub PR URL → auto-analyze

### 2. CLI Tool (npm/pip) — OPEN SOURCE READY
- `bsmeter scan "text"` → score in terminal
- `bsmeter pr <github-pr-url>` → analyze a PR
- `bsmeter file <path>` → analyze a file
- `bsmeter batch <dir>` → score all files
- JSON output for CI integration

### 3. Browser Extension (if time allows) — LIVE FIRE DEMO
- Overlay on any webpage showing slop scores
- Highlight problematic sections inline
- This is the "wow factor" for the demo

---

## 📊 Bonus Points Strategy

### +5 Bake-Off
- **Dataset:** Collect 40 items per track (20 slop / 20 clean)
  - Code Review: GitHub PRs from AI-heavy repos vs mature OSS
  - Content/SEO: AI-generated blog posts vs human-written
  - News/Social: AI-generated news vs real journalism
- Publish confusion matrix, accuracy, precision, recall per dimension
- **Who does it:** Codex (data collection) + You (labeling)

### +5 Live Fire
- During demo: run tool against live GitHub PRs, live blog posts, live news articles
- Show it catching slop in real-time from the wild
- **Who does it:** You (demo) + Claude Code (integration)

### +3 Open Source Ready
- npm package + pip package
- GitHub repo with CI (GitHub Actions)
- Full README with detection approach explained
- CONTRIBUTING.md
- **Who does it:** DEV agent (CI/docs) + Claude Code (packaging)

### +3 Cross-Track Scanner
- Same `slop-score()` engine, different `domain` configs
- Demo shows all 3 tracks working from one tool
- **Who does it:** Built into the core architecture from day 1

**Total bonus: +16 points**

---

## 👥 Parallel Execution Plan

### Who Does What

| Worker | Strengths | Assignments |
|--------|-----------|-------------|
| **Abrar (Boss)** | Architecture decisions, integration, final quality, demo | Core engine architecture, integration, web app polish, demo video |
| **Claude Code Pro** | Deep coding, complex logic, refactoring | Core detection engine (all 3 layers), web app backend + frontend, CLI tool |
| **Codex (500 credits)** | Parallel tasks, boilerplate, data collection | Data collection for bake-off, template/pattern databases, CI setup, test suites |
| **DEV Agent** | Independent execution on defined tasks | npm/pip packaging, README, CONTRIBUTING.md, GitHub Actions CI, documentation |
| **SCOUT (me)** | Research, tracking, gap analysis | Competitive intel, research papers, tracking progress, flagging issues |

### Task Distribution

**PHASE 1: Foundation (Hours 0-8)**
| # | Task | Who | Priority |
|---|------|-----|----------|
| 1 | Design `slop-score()` API contract + architecture doc | Boss | P0 |
| 2 | Build Layer 1 signals (entropy, idea density, compression ratio) | Claude Code | P0 |
| 3 | Build Layer 3 signals (template rate, sentence variance, lexical diversity, readability) | Claude Code | P0 |
| 4 | Collect AI template/pattern database (common AI phrases, structures) | Codex | P1 |
| 5 | Scrape GitHub PRs for bake-off dataset (20 slop repos, 20 clean repos) | Codex | P1 |
| 6 | Set up repo structure, initialize project | Boss | P0 |

**PHASE 2: Engine + Surfaces (Hours 8-20)**
| # | Task | Who | Priority |
|---|------|-----|----------|
| 7 | Build Layer 2 signals (subjectivity, hedging, specificity, source grounding) | Claude Code | P0 |
| 8 | Build Layer 4 domain configs (Code Review, Content/SEO, News/Social) | Claude Code | P0 |
| 9 | Build web app (Vercel) — text input, radar chart, highlighted output | Claude Code | P0 |
| 10 | Build CLI tool | Claude Code | P1 |
| 11 | Collect blog posts + news articles for bake-off dataset | Codex | P1 |
| 12 | Label all bake-off data (slop/clean) | Boss | P0 |
| 13 | Build diff-restating detector for PR analysis | Claude Code | P1 |

**PHASE 3: Polish + Bonus Points (Hours 20-40)**
| # | Task | Who | Priority |
|---|------|-----|----------|
| 14 | Run bake-off: score dataset, generate confusion matrix | Claude Code | P0 |
| 15 | Live Fire testing — run on real content, document results | Boss | P0 |
| 16 | Package as npm + pip | DEV Agent | P1 |
| 17 | Set up GitHub Actions CI | DEV Agent | P1 |
| 18 | Write README (detection approach, honest numbers, where it fails) | DEV Agent | P1 |
| 19 | Write CONTRIBUTING.md | DEV Agent | P2 |
| 20 | Browser extension (if time) | Claude Code | P2 |
| 21 | Tune thresholds based on bake-off results | Boss + Claude Code | P0 |

**PHASE 4: Demo + Submit (Hours 40-69)**
| # | Task | Who | Priority |
|---|------|-----|----------|
| 22 | Record 2-3 min demo video | Boss | P0 |
| 23 | Final README polish with honest failure analysis | Boss | P0 |
| 24 | Deploy web app to Vercel (production) | Claude Code | P0 |
| 25 | Final testing + bug fixes | All | P0 |
| 26 | Submit | Boss | P0 |

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| GPT-2 model too large for Vercel deployment | Can't deploy web app | Pre-compute reference distributions; use lightweight entropy approximation |
| Bake-off dataset too small to be meaningful | Weak Bake-Off score | Minimum 20 per track is defensible; cite ICLR paper's approach |
| Too many false positives | Judges penalize accuracy | Tune thresholds on bake-off data; document failure cases honestly |
| Browser extension eats too much time | Miss other deliverables | CUT if not started by hour 40 |
| Cross-track feels bolted on | Don't get cross-track bonus | Same engine, different configs from DAY 1 — not added later |
| LLM-as-judge temptation | Explicitly out of scope | NEVER use LLM to classify slop. Only for optional post-processing explanations. |
| Running out of time for demo video | Required deliverable | Start drafting demo script at hour 35, record at hour 40 |

---

## 🏆 What "Winning" Looks Like

**Sharpest Signal award** (best detection approach):
- Our multi-signal approach is novel, grounded, and explainable
- Cite the ICLR 2026 paper as theoretical foundation
- Show confusion matrix + honest failure analysis

**Detection Accuracy (30%):**
- Multiple orthogonal signals > single metric
- Honest about where we fail (judges reward this)

**Practical Usefulness (25%):**
- CLI + web app + (maybe) browser extension = people can actually use this
- GitHub PR integration = dev teams would run this in CI

**Innovation (15%):**
- "Not whether it's AI, but whether it's worth reading" = philosophically distinct
- Academic grounding = credible, not just vibes
- Cross-domain = nobody else will do this

**Presentation (10%):**
- Live demo catching real slop from the wild
- Radar chart visualization
- 2-3 min video showing the "aha" moments

---

## 📋 Decision Log

| When | Decision | Why |
|------|----------|-----|
| 15:17 EDT | Boss coding with Claude Code + Codex, not DEV agent | Boss wants direct control + quality |
| 15:17 EDT | SCOUT tracks, doesn't build | Domain boundaries |
| 15:04 EDT | Primary track = Code Review, cross = Content/SEO + Social/News | Data availability, domain knowledge, cross-track bonus |
| 15:14 EDT | Target ALL 4 bonuses | Maximum quality output, first hackathon together |