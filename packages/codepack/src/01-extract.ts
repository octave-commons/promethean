// src/01-extract.ts
import { promises as fs } from "fs";
import * as path from "path";
import { pathToFileURL } from "url";

import matter from "gray-matter";

import { openLevelCache } from "@promethean/level-cache";
import { scanFiles } from "@promethean/file-indexer";
import type { IndexedFile } from "@promethean/file-indexer";
import { parseArgs, relPath, sha1 } from "./utils.js";
import { extractCodeBlocksWithContext, detectFilenameHint } from "./utils.js";
import type { CodeBlock } from "./types.js";

export type ExtractOptions = Readonly<{
  root: string;
  exts: readonly string[];
}>;

const toExtSet = (exts: readonly string[]) =>
  new Set(
    exts
      .map((raw) => raw.trim())
      .filter((value) => value.length > 0)
      .map((value) =>
        value.startsWith(".") ? value.toLowerCase() : `.${value.toLowerCase()}`,
      ),
  );

export async function collectCodeBlocks(
  options: ExtractOptions,
): Promise<readonly CodeBlock[]> {
  const root = path.resolve(options.root);
  const extSet = toExtSet(options.exts);
  const blocks: CodeBlock[] = [];
  await scanFiles({
    root,
    exts: extSet,
    readContent: true,
    onFile: async (file: IndexedFile) => {
      const abs = path.isAbsolute(file.path)
        ? path.resolve(file.path)
        : path.resolve(root, file.path);
      const raw = file.content ?? (await fs.readFile(abs, "utf-8"));
      const { content } = matter(raw);
      const rel = relPath(root, abs);
      const extracted = extractCodeBlocksWithContext(content).map((block) => {
        const hintedName = detectFilenameHint(block);
        const base: CodeBlock = {
          id: sha1(
            [abs, block.startLine, block.endLine, sha1(block.value)].join("|"),
          ),
          srcPath: abs,
          relPath: rel,
          startLine: block.startLine,
          endLine: block.endLine,
          code: block.value,
          contextBefore: block.beforeText,
          contextAfter: block.afterText,
          ...(block.lang ? { lang: block.lang } : {}),
          ...(hintedName ? { hintedName } : {}),
        };
        return base;
      });
      blocks.push(...extracted);
    },
  });
  return blocks;
}

type CacheOptions = Readonly<{
  root: string;
  exts: readonly string[];
  cachePath: string;
}>;

export async function extractAndCache(options: CacheOptions): Promise<number> {
  const blocks = await collectCodeBlocks({
    root: options.root,
    exts: options.exts,
  });
  const cache = await openLevelCache<CodeBlock>({
    path: options.cachePath,
    namespace: "blocks",
  });
  await cache.batch(
    blocks.map((b) => ({ type: "put" as const, key: b.id, value: b })),
  );
  await cache.close();
  return blocks.length;
}

const isDirect =
  !!process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirect) {
  const args = parseArgs({
    "--dir": "docs/unique",
    "--ext": ".md,.mdx,.txt",
    "--cache": ".cache/codepack/blocks",
  });
  const root = path.resolve(args["--dir"] ?? "docs/unique");
  const exts = (args["--ext"] ?? ".md,.mdx,.txt").split(",");
  const cachePath = path.resolve(args["--cache"] ?? ".cache/codepack/blocks");
  extractAndCache({ root, exts, cachePath })
    .then((count) => {
      console.log(
        `extracted ${count} code blocks -> ${path.relative(
          process.cwd(),
          cachePath,
        )}`,
      );
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
