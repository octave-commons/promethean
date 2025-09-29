import * as path from "node:path";
import * as fs from "node:fs/promises";

import test from "ava";

import { collectSourceFiles } from "../01-scan.js";

const withTmp = async (fn: (dir: string) => Promise<void>) => {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    `symdocs-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await fs.mkdir(dir, { recursive: true });
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
};

test("collectSourceFiles respects extension filters", async (t) => {
  await withTmp(async (dir) => {
    const files = [
      path.join(dir, "keep.ts"),
      path.join(dir, "skip.tsx"),
      path.join(dir, "notes.md"),
    ] as const;
    const [keepFile, skipFile, notesFile] = files;
    await Promise.all([
      fs.writeFile(keepFile, "export const keep = 1;", "utf8"),
      fs.writeFile(skipFile, "export const skip = 2;", "utf8"),
      fs.writeFile(notesFile, "# notes", "utf8"),
    ]);

    const found = await collectSourceFiles(dir, new Set([".ts"]));
    t.deepEqual(found.sort(), [keepFile].sort());
  });
});
