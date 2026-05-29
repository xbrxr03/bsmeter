import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const slopRepos = ["garrytan/gstack", "FullAgent/fulling", "redwoodjs/agent-ci"];
const cleanRepos = ["vitejs/vite", "withastro/astro", "pmndrs/zustand", "sindresorhus/execa"];
const token = process.env.GITHUB_TOKEN;

async function github<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${await response.text()}`);
  return response.json() as Promise<T>;
}

async function collectRepo(repo: string, label: "slop" | "clean", limit: number) {
  const pulls = await github<Array<{ number: number; title: string; body: string | null }>>(`/repos/${repo}/pulls?state=closed&per_page=${limit}`);
  return pulls.filter((pr) => pr.body?.trim()).slice(0, limit).map((pr) => ({
    repo,
    pr_number: pr.number,
    title: pr.title,
    body: pr.body ?? "",
    label,
  }));
}

async function main() {
  const out = join(process.cwd(), "data", "bake-off", "code-review");
  await mkdir(join(out, "slop"), { recursive: true });
  await mkdir(join(out, "clean"), { recursive: true });

  const slop = (await Promise.all(slopRepos.map((repo) => collectRepo(repo, "slop", 10)))).flat().slice(0, 20);
  const clean = (await Promise.all(cleanRepos.map((repo) => collectRepo(repo, "clean", 8)))).flat().slice(0, 20);

  for (const item of [...slop, ...clean]) {
    const file = join(out, item.label, `${item.repo.replace("/", "__")}-${item.pr_number}.json`);
    await writeFile(file, JSON.stringify(item, null, 2));
  }
  console.log(`Wrote ${slop.length} slop and ${clean.length} clean PR samples.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
