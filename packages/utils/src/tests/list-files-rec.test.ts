import * as path from "path";
import * as fs from "fs/promises";

import test from "ava";

import { listFilesRec } from "../list-files-rec.js";

async function withTmp(fn: (dir: string) => Promise<void> | void) {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    String(Date.now()) + "-" + Math.random().toString(36).slice(2),
  );
  await fs.mkdir(dir, { recursive: true });
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test("listFilesRec filters by extension and skips ignored paths", async (t) => {
  await withTmp(async (dir) => {
    const root = path.join(dir, "root");
    await fs.mkdir(path.join(root, "node_modules"), { recursive: true });
    await fs.mkdir(path.join(root, "dist"), { recursive: true });
    await fs.mkdir(path.join(root, "sub"), { recursive: true });
    await fs.writeFile(path.join(root, "a.md"), "# A", "utf8");
    await fs.writeFile(path.join(root, "b.txt"), "B", "utf8");
    await fs.writeFile(path.join(root, ".#lock.md"), "LOCK", "utf8");
    await fs.writeFile(path.join(root, "node_modules", "c.md"), "C", "utf8");
    await fs.writeFile(path.join(root, "dist", "d.txt"), "D", "utf8");
    await fs.writeFile(path.join(root, "sub", "e.md"), "E", "utf8");

    const files = await listFilesRec(root, new Set([".md", ".txt"]));
    t.true(files.some((p) => p.endsWith("a.md")));
    t.true(files.some((p) => p.endsWith("b.txt")));
    t.true(files.some((p) => p.endsWith(path.join("sub", "e.md"))));
    t.false(files.some((p) => p.includes("node_modules")));
    t.false(files.some((p) => p.includes("dist")));
    t.false(files.some((p) => path.basename(p).startsWith(".#")));
  });
});
