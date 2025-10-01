import * as path from "node:path";
import * as fs from "node:fs/promises";

import test from "ava";
import esmock from "esmock";
import matter from "gray-matter";

import { openDB } from "../db.js";

type FrontmatterModule = typeof import("../01-frontmatter.js");

type TmpHandler = (dir: string) => Promise<void> | void;

async function withTmp(fn: TmpHandler) {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await fs.mkdir(dir, { recursive: true });
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test.serial("runFrontmatter falls back when Ollama is offline", async (t) => {
  await withTmp(async (tmp) => {
    const docsDir = path.join(tmp, "docs");
    await fs.mkdir(docsDir, { recursive: true });
    const file = path.join(docsDir, "sample.md");
    await fs.writeFile(file, "# Sample\n\nBody text.\n", "utf8");

    const db = await openDB(path.join(tmp, ".cache/offline.level"));

    const modulePath = new URL("../01-frontmatter.js", import.meta.url)
      .pathname;
    const mocked = (await esmock<FrontmatterModule>(modulePath, {
      ollama: {
        default: {
          async generate() {
            throw new Error("connect ECONNREFUSED");
          },
        },
      },
    })) as FrontmatterModule;

    await t.notThrowsAsync(() =>
      mocked.runFrontmatter(
        {
          dir: docsDir,
          genModel: "offline:test",
        },
        db,
      ),
    );

    const raw = await fs.readFile(file, "utf8");
    const parsed = matter(raw);
    const fm = parsed.data as {
      description?: string;
      tags?: string[];
      filename?: string;
    };

    t.is(fm.filename, "sample");
    t.is(fm.description, "DocOps summary for sample");
    t.true(Array.isArray(fm.tags));
    t.true(fm.tags?.includes("docops"));

    await db.root.close();
  });
});
