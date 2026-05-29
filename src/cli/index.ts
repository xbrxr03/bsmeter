#!/usr/bin/env node
import { readFileSync } from "fs";
import { resolve } from "path";
import { Command } from "commander";
import { bsScore } from "../core/index";
import type { BSMeterOptions } from "../core/types";
import { formatHuman, formatJson } from "./formatters";

const program = new Command();

program
  .name("bsmeter")
  .description("Information quality scoring — not whether it's AI, whether it's worth reading.")
  .version("0.1.0");

program
  .command("scan <text>")
  .description("Score a text string")
  .option("-d, --domain <domain>", "Domain: code-review | content-seo | social-news", "content-seo")
  .option("-j, --json", "Output JSON")
  .option("--title <title>", "Title/headline for context")
  .option("--diff <diff>", "PR diff for code-review domain")
  .action((text: string, opts: { domain: string; json: boolean; title?: string; diff?: string }) => {
    const options: BSMeterOptions = {
      domain: opts.domain as BSMeterOptions["domain"],
      context: {
        title: opts.title,
        diff: opts.diff,
      },
    };
    const result = bsScore(text, options);
    console.log(opts.json ? formatJson(result) : formatHuman(result));
    process.exit(result.verdict === "clean" ? 0 : result.verdict === "suspect" ? 1 : 2);
  });

program
  .command("file <path>")
  .description("Score a text file")
  .option("-d, --domain <domain>", "Domain: code-review | content-seo | social-news", "content-seo")
  .option("-j, --json", "Output JSON")
  .option("--title <title>", "Title/headline for context")
  .action((filePath: string, opts: { domain: string; json: boolean; title?: string }) => {
    const text = readFileSync(resolve(filePath), "utf-8");
    const options: BSMeterOptions = {
      domain: opts.domain as BSMeterOptions["domain"],
      context: { title: opts.title },
    };
    const result = bsScore(text, options);
    console.log(opts.json ? formatJson(result) : formatHuman(result));
    process.exit(result.verdict === "clean" ? 0 : result.verdict === "suspect" ? 1 : 2);
  });

program
  .command("batch <dir>")
  .description("Score all .txt and .md files in a directory")
  .option("-d, --domain <domain>", "Domain", "content-seo")
  .option("-j, --json", "Output JSON")
  .action((dir: string, opts: { domain: string; json: boolean }) => {
    const { readdirSync } = require("fs");
    const files = readdirSync(resolve(dir)) as string[];
    const textFiles = files.filter((f: string) => f.endsWith(".txt") || f.endsWith(".md"));
    for (const file of textFiles) {
      const text = readFileSync(resolve(dir, file), "utf-8");
      const result = bsScore(text, { domain: opts.domain as BSMeterOptions["domain"] });
      if (opts.json) {
        console.log(JSON.stringify({ file, ...result }));
      } else {
        console.log(`\n📄 ${file}`);
        console.log(formatHuman(result));
      }
    }
  });

program.parse();
