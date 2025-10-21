import * as path from "node:path";
import * as fs from "node:fs/promises";

import test from "ava";

import { collectCodeBlocks } from "../01-extract.js";

const withTmp = async (fn: (dir: string) => Promise<void>) => {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    `codepack-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await fs.mkdir(dir, { recursive: true });
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
};

test("collectCodeBlocks uses scanFiles filters", async (t) => {
  await withTmp(async (dir) => {
    const md = path.join(dir, "note.md");
    const txt = path.join(dir, "ignore.txt");
    await fs.writeFile(
      md,
      "---\ntitle: Example\n---\n```ts\nconst x = 1;\n```\n",
      "utf8",
    );
    await fs.writeFile(txt, "no code", "utf8");

    const blocks = await collectCodeBlocks({ root: dir, exts: [".md"] });
    t.is(blocks.length, 1);
    t.is(blocks[0]?.relPath, path.relative(dir, md));
    t.true(blocks[0]?.code.includes("const x"));
  });
});
