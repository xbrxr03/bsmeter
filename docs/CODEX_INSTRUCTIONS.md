# Codex — Build Instructions

**Your job:** Collect data, build pattern databases, write collection scripts, create bake-off datasets, write tests.

## Setup

1. Clone the repo: `git clone https://github.com/xbrxr03/bsmeter.git && cd bsmeter`
2. Read `docs/ARCHITECTURE.md` for the full picture.

## What You Build

All files marked `[CODEX]` in the repo are yours:

### Priority 1: Pattern Databases (src/data/)

These are JSON files that the detection engine loads at runtime. They MUST be real, comprehensive, and useful.

**src/data/ai-templates.json** — Known AI phrase/structure patterns
Format:
```json
{
  "phrases": ["In conclusion", "It's important to note", "Furthermore", "Moreover", "It's worth noting that", ...],
  "structures": ["intro-body-conclusion in <200 words", "bulleted summary of what was just said", ...]
}
```
Aim for 100+ phrases and 20+ structural patterns. Source these from real AI-generated content — GPT output, Claude output, etc.

**src/data/hedging-phrases.json** — Hedging phrase lexicon
Format:
```json
{
  "phrases": ["it seems", "arguably", "in many ways", "it could be said", "one might argue", "it appears", "potentially", "possibly", "some might say", ...]
}
```
Aim for 50+ phrases.

**src/data/subjectivity-lexicon.json** — Wiebe et al. subjectivity words
Format:
```json
{
  "subjective": ["abandon", "absurd", "abuse", ...],
  "objective": ["acknowledge", "acquire", "add", ...]
}
```
Use the Wiebe et al. (2004) subjectivity lexicon. This is a well-known NLP resource. Include at least 200 words per category.

**src/data/clickbait-patterns.json** — Clickbait headline patterns
Format:
```json
{
  "patterns": ["You won't believe", "This one trick", "X things about Y", "Number reasons why", "What happens when", ...],
  "sensationalist_words": ["shocking", "unbelievable", "mind-blowing", "incredible", ...]
}
```
Aim for 50+ patterns and 30+ sensationalist words.

### Priority 2: Bake-Off Data Collection (scripts/ + data/)

**scripts/collect-github-prs.ts** — Script to scrape GitHub PRs
- Use GitHub API to fetch PR descriptions from known AI-heavy repos vs mature OSS repos
- AI-heavy repos: garrytan/gstack, FullAgent/fulling, redwoodjs/agent-ci (from slop-scan benchmarks)
- Mature OSS repos: vitejs/vite, withastro/astro, pmndrs/zustand, sindresorhus/execa
- Save as JSON: `{ repo, pr_number, title, body, diff?, label: "slop"|"clean" }`
- Collect 20 slop + 20 clean

**scripts/collect-blog-posts.ts** — Script to scrape blog posts
- Find AI-generated SEO blog posts (Medium, Dev.to, etc.) vs human-written quality content
- Save as JSON: `{ url, title, body, label: "slop"|"clean" }`
- Collect 20 slop + 20 clean

**scripts/collect-news-articles.ts** — Script to scrape news articles
- Find AI-generated news (sites known for AI content) vs real journalism (Reuters, AP, etc.)
- Save as JSON: `{ url, title, body, label: "slop"|"clean" }`
- Collect 20 slop + 20 clean

**scripts/run-bakeoff.ts** — Run bake-off and generate confusion matrix
- Import bsScore from src/core
- Score all items in data/bake-off/
- Calculate: accuracy, precision, recall, F1
- Generate confusion matrix
- Output to docs/BAKE_OFF.md

**data/bake-off/** — Place collected data here
- `code-review/slop/` — 20 slop PRs (individual JSON files)
- `code-review/clean/` — 20 clean PRs
- `content-seo/slop/` — 20 slop blog posts
- `content-seo/clean/` — 20 clean blog posts
- `social-news/slop/` — 20 slop news articles
- `social-news/clean/` — 20 clean news articles

### Priority 3: Tests (tests/)

Write vitest tests for:

**tests/core/scorer.test.ts** — Test the composite scorer
- Test that bsScore returns valid BSResult with all fields
- Test verdict thresholds (0-30 = clean, 31-60 = suspect, 61-100 = bs)
- Test that scores are between 0-100
- Test with known slop text vs known clean text

**tests/core/density.test.ts** — Test information utility signals
- Test compression ratio with known repetitive vs diverse text
- Test idea density with concrete vs abstract text

**tests/core/quality.test.ts** — Test information quality signals
- Test hedging density with hedged vs direct text
- Test specificity score with vague vs specific text

**tests/core/style.test.ts** — Test style quality signals
- Test template rate with templated vs natural text
- Test sentence variance with uniform vs varied text
- Test lexical diversity with repetitive vs diverse vocabulary

**tests/signals/entropy.test.ts** — Test token entropy signal
**tests/signals/compression.test.ts** — Test compression ratio signal

**tests/domains/code-review.test.ts** — Test code-review domain config
**tests/domains/content-seo.test.ts** — Test content-seo domain config
**tests/domains/social-news.test.ts** — Test social-news domain config

## Critical Rules

1. **Pattern databases must be real and comprehensive.** Don't stub them with 5 entries. These power the actual detection.
2. **Bake-off data must be real.** Not synthetic. Scrape real content from real sources.
3. **Label honestly.** If you're unsure whether something is slop or clean, skip it.
4. **Don't use LLMs to generate test data.** That's circular.
5. **Tests must actually verify signal behavior.** Not just "it doesn't crash."

## When Done

1. All pattern databases have real, comprehensive data
2. All collection scripts work and produce valid JSON
3. Bake-off data is collected and placed in data/bake-off/
4. Tests pass: `npm test`
5. Commit to main with descriptive messages