// src/01-extract.ts
import { promises as fs } from "fs";
import * as path from "path";

import matter from "gray-matter";
import { listFilesRec } from "@promethean/utils";

import {
  parseArgs,
  relPath,
  sha1,
  extractCodeBlocksWithContext,
  detectFilenameHint,
} from "./utils.js";
import type { BlockManifest, CodeBlock } from "./types.js";

const args = parseArgs({
  "--dir": "docs/unique",
  "--ext": ".md,.mdx,.txt",
  "--out": ".cache/codepack/blocks.json",
});

const ROOT = path.resolve(args["--dir"]);
const EXTS = new Set(
  args["--ext"].split(",").map((s) => s.trim().toLowerCase()),
);
const OUT = path.resolve(args["--out"]);

async function main() {
  const files = await listFilesRec(ROOT, EXTS);
  const blocks = (
    await Promise.all(
      files.map(async (f) => {
        const raw = await fs.readFile(f, "utf-8");
        const { content } = matter(raw); // ignore frontmatter, operate on content
        const found = extractCodeBlocksWithContext(content);
        const rel = relPath(ROOT, f);

        return found.map((b) => {
          const id = sha1([f, b.startLine, b.endLine, sha1(b.value)].join("|"));
          return {
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
          } satisfies CodeBlock;
        });
      }),
    )
  ).flat();

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  const manifest = { blocks } as const satisfies BlockManifest;
  await fs.writeFile(OUT, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(
    `extracted ${blocks.length} code blocks -> ${path.relative(
      process.cwd(),
      OUT,
    )}`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
