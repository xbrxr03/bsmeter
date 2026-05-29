# BS Meter 🚨

> Not whether it's AI — whether it's worth reading.

BS Meter scores information quality in text. It doesn't ask "was this made with AI?" — it asks "did a human actually check this before hitting publish?"

Built for [SLOP SCAN](https://slopscan.dev/) hackathon (May 29 – Jun 1, 2026).

## Tracks

- **Code Review** — Detect hollow PR descriptions, diff-restating commits, filler code comments
- **Content & SEO** — Flag blog posts that rank but say nothing
- **Social & News** — Catch AI-generated news, clickbait headlines, engagement bait

## Install

```bash
npm install -g bsmeter
```

## Use

```bash
bsmeter scan "Your text here"
bsmeter pr https://github.com/owner/repo/pull/123
bsmeter file ./README.md
```

## How It Works

BS Meter uses a 4-layer detection engine grounded in academic research (Shaib et al., ICLR 2026):

1. **Information Utility** — Does the text say anything? (token entropy, idea density, compression ratio)
2. **Information Quality** — Is it specific and accurate? (hedging density, specificity score, source grounding)
3. **Style Quality** — Is the expression natural? (template rate, sentence variance, lexical diversity, readability)
4. **Domain Specific** — Per-track checks (diff overlap, headline divergence, clickbait patterns)

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full detection approach and API contract.

## License

MIT