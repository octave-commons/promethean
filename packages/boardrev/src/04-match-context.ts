/* eslint-disable */
import * as path from "path";
import { promises as fs } from "fs";

import matter from "gray-matter";
import { cosine, parseArgs, ollamaEmbed, writeText } from "@promethean/utils";

import { listTaskFiles } from "./utils.js";
import type { RepoDoc, Embeddings, TaskContext } from "./types.js";

export async function matchContext({
  tasks,
  index,
  emb,
  embedModel,
  k,
  out,
}: Readonly<{
  tasks: string;
  index: string;
  emb: string;
  embedModel: string;
  k: number;
  out: string;
}>) {
  const tasksDir = path.resolve(tasks);
  const files = await listTaskFiles(tasksDir);

  const repoIndex: { docs: RepoDoc[] } = JSON.parse(
    await fs.readFile(path.resolve(index), "utf-8"),
  );
  const repoEmb: Embeddings = JSON.parse(
    await fs.readFile(path.resolve(emb), "utf-8"),
  );

  const outData: TaskContext[] = [];

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const gm = matter(raw);
    const text = [
      `TITLE: ${gm.data?.title ?? ""}`,
      `STATUS: ${gm.data?.status ?? ""}  PRIORITY: ${gm.data?.priority ?? ""}`,
      gm.content,
    ].join("\n");
    const vec = await ollamaEmbed(embedModel, text);

    const scored = repoIndex.docs
      .map((d) => ({
        path: d.path,
        kind: d.kind,
        excerpt: d.excerpt,
        score: cosine(vec, repoEmb[d.path] ?? []),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);

    const links = Array.from(raw.matchAll(/\[[^\]]*?\]\(([^)]+)\)/g))
      .map((m) => m[1])
      .filter((x): x is string => Boolean(x));

    outData.push({ taskFile: f.replace(/\\/g, "/"), hits: scored, links });
  }

  await writeText(
    path.resolve(out),
    JSON.stringify({ contexts: outData }, null, 2),
  );
  console.log(`boardrev: matched context for ${outData.length} task(s)`);
}

if (import.meta.main) {
  const args = parseArgs({
    "--tasks": "docs/agile/tasks",
    "--index": ".cache/boardrev/repo-index.json",
    "--emb": ".cache/boardrev/repo-embeddings.json",
    "--embed-model": "nomic-embed-text:latest",
    "--k": "8",
    "--out": ".cache/boardrev/context.json",
  });
  matchContext({
    tasks: args["--tasks"],
    index: args["--index"],
    emb: args["--emb"],
    embedModel: args["--embed-model"],
    k: Number(args["--k"]),
    out: args["--out"],
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
