import * as path from "node:path";
import * as fs from "node:fs/promises";

import test from "ava";

import { collectSourceFiles } from "../01-scan.js";

const withTmp = async (fn: (dir: string) => Promise<void>) => {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    `simtask-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await fs.mkdir(dir, { recursive: true });
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
};

test("collectSourceFiles returns absolute paths for matching extensions", async (t) => {
  await withTmp(async (dir) => {
    const keepTs = path.join(dir, "keep.ts");
    const keepTsx = path.join(dir, "component.tsx");
    const skipJs = path.join(dir, "skip.js");
    await Promise.all([
      fs.writeFile(keepTs, "export const foo = () => 42;", "utf8"),
      fs.writeFile(keepTsx, "export const Bar = () => null;", "utf8"),
      fs.writeFile(skipJs, "export const nope = 0;", "utf8"),
    ]);

    const found = await collectSourceFiles(dir, new Set([".ts", ".tsx"]));
    const normalized = [...found].sort();
    t.deepEqual(normalized, [keepTs, keepTsx].sort());
  });
});
