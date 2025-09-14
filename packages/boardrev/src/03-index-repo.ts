/* eslint-disable */
import * as path from "path";
import { promises as fs } from "fs";

import { globby } from "globby";
import { ollamaEmbed, parseArgs, writeText } from "@promethean/utils";

import type { RepoDoc, Embeddings } from "./types.js";

export async function indexRepo({
  globs,
  maxBytes,
  maxLines,
  embedModel,
  outIndex,
  outEmb,
}: Readonly<{
  globs: string;
  maxBytes: number;
  maxLines: number;
  embedModel: string;
  outIndex: string;
  outEmb: string;
}>) {
  const files = await globby(globs.split(",").map((s) => s.trim()));
  const index: RepoDoc[] = [];
  const embeddings: Embeddings = {};

  for (const f of files) {
    const st = await fs.stat(f);
    if (st.size > maxBytes) continue;
    const raw = await fs.readFile(f, "utf-8");
    const excerpt = raw.split(/\r?\n/).slice(0, maxLines).join("\n");
    const kind = /\.(md|mdx)$/i.test(f) ? "doc" : "code";
    index.push({ path: f.replace(/\\/g, "/"), size: st.size, kind, excerpt });
  }

  for (const d of index) {
    const key = d.path;
    if (!embeddings[key]) {
      const text = `PATH: ${d.path}\nKIND: ${d.kind}\n---\n${d.excerpt}`;
      embeddings[key] = await ollamaEmbed(embedModel, text);
    }
  }

  await writeText(
    path.resolve(outIndex),
    JSON.stringify({ docs: index }, null, 2),
  );
  await writeText(path.resolve(outEmb), JSON.stringify(embeddings));
  console.log(`boardrev: indexed ${index.length} repo docs`);
}

import { pathToFileURL } from "url";
if (import.meta.url === pathToFileURL(process.argv[1]!).href) {
  const args = parseArgs({
    "--globs":
      "{README.md,docs/**/*.md,packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}}",
    "--max-bytes": "200000",
    "--max-lines": "400",
    "--embed-model": "nomic-embed-text:latest",
    "--out-index": ".cache/boardrev/repo-index.json",
    "--out-emb": ".cache/boardrev/repo-embeddings.json",
  });
  indexRepo({
    globs: args["--globs"],
    maxBytes: Number(args["--max-bytes"]),
    maxLines: Number(args["--max-lines"]),
    embedModel: args["--embed-model"],
    outIndex: args["--out-index"],
    outEmb: args["--out-emb"],
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
