import * as path from "path";
import * as fs from "fs/promises";

import test from "ava";
import matter from "gray-matter";

import { openDB } from "../db.js";
import { computePreview } from "../preview-front.js";
import { parseMarkdownChunks } from "../utils.js";

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

// Minimal smoke for computePreview path when no qhits exist (ensures guards)
test.serial("computePreview tolerates empty qhits and chunks", async (t) => {
  await withTmp(async (tmp: string) => {
    // create a doc with frontmatter uuid and some content
    const file = path.join(tmp, "doc.md");
    const fm = { uuid: "u-1", filename: "Doc" };
    const body = "# T\nHello world.";
    const raw = matter.stringify(body, fm);
    await fs.writeFile(file, raw, "utf8");

    const db = await openDB(path.join(tmp, ".cache/test.level"));
    // seed docs and chunks for our uuid
    await db.docs.put("u-1", { path: file, title: "Doc" });
    await db.chunks.put(
      "u-1",
      Object.freeze(
        parseMarkdownChunks(body).map((c, i) => ({
          ...c,
          id: `u-1:${i}`,
          docUuid: "u-1",
          docPath: file,
        })),
      ),
    );

    const res = await computePreview(
      { file },
      { dir: tmp, docThreshold: 0.8, refThreshold: 0.9 },
      db,
    );
    t.is(res.uuid, "u-1");
    t.is(res.title, "Doc");
    t.truthy(res.front);

    await db.root.close();
  });
});
