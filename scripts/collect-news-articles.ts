import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

type Seed = { url: string; title: string; label: "slop" | "clean" };

function textFromHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const seedFile = process.argv[2] ?? "data/seeds/news-articles.json";
  const seeds = JSON.parse(await readFile(seedFile, "utf8")) as Seed[];
  const out = join(process.cwd(), "data", "bake-off", "social-news");
  await mkdir(join(out, "slop"), { recursive: true });
  await mkdir(join(out, "clean"), { recursive: true });

  let count = 0;
  for (const seed of seeds) {
    const response = await fetch(seed.url);
    if (!response.ok) throw new Error(`${seed.url}: ${response.status}`);
    const body = textFromHtml(await response.text());
    const name = new URL(seed.url).hostname.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + `-${count}.json`;
    await writeFile(join(out, seed.label, name), JSON.stringify({ ...seed, body }, null, 2));
    count += 1;
  }
  console.log(`Wrote ${count} news samples from ${seedFile}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
