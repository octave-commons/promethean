import * as path from "node:path";
import * as fs from "node:fs/promises";

import test from "ava";

import { runPurge } from "../00-purge.js";

const withTmpDir = async (
  fn: (dir: string) => Promise<void>,
): Promise<void> => {
  const base = path.join(
    process.cwd(),
    "test-tmp",
    `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await fs.mkdir(base, { recursive: true });
  try {
    await fn(base);
  } finally {
    await fs.rm(base, { recursive: true, force: true }).catch(() => undefined);
  }
};

test("runPurge processes only requested files with scanFiles", async (t) => {
  await withTmpDir(async (dir) => {
    const target = path.join(dir, "include.md");
    const other = path.join(dir, "skip.md");
    await fs.writeFile(
      target,
      "---\nvalue: 1\n---\nHello [link](https://example.com)\n",
      "utf8",
    );
    await fs.writeFile(other, "---\nvalue: 2\n---\nKeep this text\n", "utf8");

    const progress: Array<{ done: number; total: number }> = [];
    await runPurge({ dir: dir, files: [target] }, ({ done, total }) =>
      progress.push({ done, total }),
    );

    const included = await fs.readFile(target, "utf8");
    const skipped = await fs.readFile(other, "utf8");

    t.true(included.startsWith("Hello"));
    t.false(included.includes("http"));
    t.true(skipped.includes("Keep this text"));
    t.deepEqual(
      progress.map(({ done, total }) => [done, total]),
      [[1, 1]],
    );
  });
});
