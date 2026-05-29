import { clamp, makeSignal, words } from "./text";

const contentSuffixes = /(ed|ing|ize|ise|ate|ify|ous|ive|al|ic|ful|less|ly)$/;
const contentWords = new Set([
  "because", "during", "after", "before", "while", "through", "against", "between",
  "under", "over", "using", "build", "fix", "change", "measure", "report", "verify",
  "ship", "deploy", "collect", "score", "compare", "fetch", "parse", "render",
]);

export function ideaDensity(text: string): number {
  const tokens = words(text);
  if (!tokens.length) return 0;
  const ideas = tokens.filter((token) => contentWords.has(token) || contentSuffixes.test(token));
  return ideas.length / tokens.length;
}

export function ideaDensitySignal(text: string, weight = 1) {
  const density = ideaDensity(text);
  const normalized = clamp((0.35 - density) * 220);
  return makeSignal("idea_density", density, normalized, weight);
}
