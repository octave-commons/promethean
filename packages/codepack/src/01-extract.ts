// src/01-extract.ts
import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import { openLevelCache } from "@promethean/level-cache";
import { parseArgs, relPath, sha1 } from "./utils.js";
import { extractCodeBlocksWithContext, detectFilenameHint } from "./utils.js";
import { listFilesRec } from "@promethean/utils";
import type { CodeBlock } from "./types.js";

const args = parseArgs({
  "--dir": "docs/unique",
  "--ext": ".md,.mdx,.txt",
  "--cache": ".cache/codepack/blocks",
});

const ROOT = path.resolve(args["--dir"]);
const EXTS = new Set(
  args["--ext"].split(",").map((s) => s.trim().toLowerCase()),
);
const CACHE = path.resolve(args["--cache"]);

async function main() {
  const files = await listFilesRec(ROOT, EXTS);
  const blocks: CodeBlock[] = [];

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const { content } = matter(raw); // ignore frontmatter, operate on content
    const found = extractCodeBlocksWithContext(content);
    const rel = relPath(ROOT, f);

    found.forEach((b, idx) => {
      const id = sha1([f, b.startLine, b.endLine, sha1(b.value)].join("|"));
      blocks.push({
        id,
        srcPath: f,
        relPath: rel,
        lang: b.lang,
        startLine: b.startLine,
        endLine: b.endLine,
        code: b.value,
        contextBefore: b.beforeText,
        contextAfter: b.afterText,
        hintedName: detectFilenameHint(b),
      });
    });
  }

  const cache = await openLevelCache<CodeBlock>({
    path: CACHE,
    namespace: "blocks",
  });
  await cache.batch(
    blocks.map((b) => ({ type: "put" as const, key: b.id, value: b })),
  );
  await cache.close();
  console.log(
    `extracted ${blocks.length} code blocks -> ${path.relative(
      process.cwd(),
      CACHE,
    )}`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
