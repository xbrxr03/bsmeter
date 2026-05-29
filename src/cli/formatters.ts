import type { BSResult } from "../core/types";

function verdictColor(verdict: string): string {
  switch (verdict) {
    case "clean": return "\x1b[32m"; // green
    case "suspect": return "\x1b[33m"; // yellow
    case "bs": return "\x1b[31m"; // red
    default: return "\x1b[0m";
  }
}

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

function bar(score: number, width = 20): string {
  const filled = Math.round((score / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

export function formatHuman(result: BSResult): string {
  const { score, verdict, dimensions, domainSpecific, signals, meta } = result;
  const color = verdictColor(verdict);

  const lines: string[] = [];
  lines.push("");
  lines.push(`${BOLD}BS METER RESULT${RESET}`);
  lines.push(`${"─".repeat(40)}`);
  lines.push(`${BOLD}Score:${RESET}   ${color}${BOLD}${score}/100${RESET}  ${bar(score)}`);
  lines.push(`${BOLD}Verdict:${RESET} ${color}${BOLD}${verdict.toUpperCase()}${RESET}`);
  lines.push("");
  lines.push(`${BOLD}Dimensions:${RESET}`);
  lines.push(`  Utility  [${bar(dimensions.utility.score, 15)}] ${dimensions.utility.score}/100`);
  lines.push(`  Quality  [${bar(dimensions.quality.score, 15)}] ${dimensions.quality.score}/100`);
  lines.push(`  Style    [${bar(dimensions.style.score, 15)}] ${dimensions.style.score}/100`);
  lines.push(`  Domain   [${bar(domainSpecific.score, 15)}] ${domainSpecific.score}/100`);
  lines.push("");
  lines.push(`${BOLD}Signals:${RESET}`);
  for (const sig of signals) {
    const flag = sig.flag ? " ⚠" : "  ";
    lines.push(`${flag} ${sig.name.padEnd(28)} ${DIM}${sig.normalized}/100${RESET}`);
  }
  lines.push("");
  lines.push(`${DIM}Text: ${meta.textLength} chars  |  Time: ${meta.processingTimeMs}ms  |  Model: ${meta.model}${RESET}`);
  lines.push("");

  return lines.join("\n");
}

export function formatJson(result: BSResult): string {
  return JSON.stringify(result, null, 2);
}
