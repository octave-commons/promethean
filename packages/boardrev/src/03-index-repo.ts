// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable no-console */
import * as path from "path";
import { promises as fs } from "fs";
import { globby } from "globby";
import { parseArgs, ollamaEmbed, writeText } from "./utils.js";
import type { RepoDoc, Embeddings } from "./types.js";

const args = parseArgs({
  "--globs": "{README.md,docs/**/*.md,packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}}",
  "--max-bytes": "200000",
  "--max-lines": "400",
  "--embed-model": "nomic-embed-text:latest",
  "--out-index": ".cache/boardrev/repo-index.json",
  "--out-emb": ".cache/boardrev/repo-embeddings.json"
});

async function main() {
  const files = await globby(args["--globs"].split(",").map(s => s.trim()));
  const maxB = Number(args["--max-bytes"]), maxL = Number(args["--max-lines"]);
  const index: RepoDoc[] = [];
  const embeddings: Embeddings = {};

  for (const f of files) {
    const st = await fs.stat(f); if (st.size > maxB) continue;
    const raw = await fs.readFile(f, "utf-8");
    const excerpt = raw.split(/\r?\n/).slice(0, maxL).join("\n");
    const kind = /\.(md|mdx)$/i.test(f) ? "doc" : "code";
    index.push({ path: f.replace(/\\/g,"/"), size: st.size, kind, excerpt });
  }

  // embed
  for (const d of index) {
    const key = d.path;
    if (!embeddings[key]) {
      const text = `PATH: ${d.path}\nKIND: ${d.kind}\n---\n${d.excerpt}`;
      embeddings[key] = await ollamaEmbed(args["--embed-model"], text);
    }
  }

  await writeText(path.resolve(args["--out-index"]), JSON.stringify({ docs: index }, null, 2));
  await writeText(path.resolve(args["--out-emb"]), JSON.stringify(embeddings));
  console.log(`boardrev: indexed ${index.length} repo docs`);
}

main().catch(e => { console.error(e); process.exit(1); });
