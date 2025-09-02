/* eslint-disable no-console */
import * as path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";
import { parseArgs, listTaskFiles, ollamaEmbed, cosine, writeText } from "./utils.js";
import type { RepoDoc, Embeddings, TaskContext } from "./types.js";

const args = parseArgs({
  "--tasks": "docs/agile/tasks",
  "--index": ".cache/boardrev/repo-index.json",
  "--emb": ".cache/boardrev/repo-embeddings.json",
  "--embed-model": "nomic-embed-text:latest",
  "--k": "8",
  "--out": ".cache/boardrev/context.json"
});

async function main() {
  const tasksDir = path.resolve(args["--tasks"]!);
  const files = await listTaskFiles(tasksDir);

  const index: { docs: RepoDoc[] } = JSON.parse(await fs.readFile(path.resolve(args["--index"]!), "utf-8"));
  const repoEmb: Embeddings = JSON.parse(await fs.readFile(path.resolve(args["--emb"]!), "utf-8"));
  const k = Number(args["--k"]);

  const out: TaskContext[] = [];

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const gm = matter(raw);
    const text = [
      `TITLE: ${gm.data?.title ?? ""}`,
      `STATUS: ${gm.data?.status ?? ""}  PRIORITY: ${gm.data?.priority ?? ""}`,
      gm.content
    ].join("\n");
    const vec = await ollamaEmbed(args["--embed-model"]!, text);

    const scored = index.docs.map(d => ({
      path: d.path, kind: d.kind, excerpt: d.excerpt,
      score: cosine(vec, repoEmb[d.path] ?? [])
    }))
    .filter(x => x.score > 0)
    .sort((a,b)=>b.score-a.score)
    .slice(0, k);

    const links = Array.from(raw.matchAll(/\[[^\]]*?\]\(([^)]+)\)/g))
      .map(m => m[1])
      .filter((x): x is string => Boolean(x));

    out.push({ taskFile: f.replace(/\\/g,"/"), hits: scored, links });
  }

  await writeText(path.resolve(args["--out"]!), JSON.stringify({ contexts: out }, null, 2));
  console.log(`boardrev: matched context for ${out.length} task(s)`);
}

main().catch(e => { console.error(e); process.exit(1); });
