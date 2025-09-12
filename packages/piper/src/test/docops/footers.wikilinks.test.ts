import * as fs from "node:fs/promises";
import * as path from "node:path";

import test from "ava";

import { runFooters } from "@promethean/docops/dist/index.js";
import { openDB } from "@promethean/docops/dist/db.js";

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = await fs.mkdtemp(path.join(process.cwd(), "test-tmp-"));
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test("runFooters emits wiki links", async (t) => {
  await withTmp(async (dir) => {
    const docBPath = path.join(dir, "docB.md");
    await fs.writeFile(
      docBPath,
      ["# DocB", "", "Some text", "", "^b1", "More text"].join("\n"),
      "utf8",
    );
    const docAPath = path.join(dir, "docA.md");
    await fs.writeFile(
      docAPath,
      ["# DocA", "", "See [[DocB]]", "", "^a1", "Text", "^a2", "More"].join(
        "\n",
      ),
      "utf8",
    );

    const db = await openDB(path.join(dir, "db"));
    try {
      await t.notThrowsAsync(() =>
        runFooters({ dir, includeRelated: true, includeSources: true }, db),
      );
    } finally {
      await db.root.close();
    }
  });
});
