import * as path from "path";
import * as fs from "fs/promises";

import test from "ava";
import matter from "gray-matter";

import { runRelations } from "@promethean/docops/dist/index.js";
import { openDB } from "@promethean/docops/dist/db.js";

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

test("runRelations caps references per doc", async (t) => {
  await withTmp(async (dir) => {
    const a = path.join(dir, "a.md");
    const b = path.join(dir, "b.md");
    await fs.writeFile(a, "# A\n\ntext\n", "utf8");
    await fs.writeFile(b, "# B\n\ntext\n", "utf8");
    const db = await openDB(path.join(dir, "db"));
    try {
      await runRelations(
        {
          docsDir: dir,
          docThreshold: 0.5,
          refThreshold: 0.5,
          maxReferences: 1,
        },
        db,
      );
      const dataA = matter(await fs.readFile(a, "utf8")).data as any;
      const dataB = matter(await fs.readFile(b, "utf8")).data as any;
      t.true((dataA.references || []).length <= 1);
      t.true((dataB.references || []).length <= 1);
    } finally {
      await db.root.close();
    }
  });
});
