import * as path from "node:path";
import * as fs from "node:fs/promises";

import test from "ava";

import { gatherRepoFiles } from "../../indexer.js";
import { symbolsIndex } from "../../symbols.js";

const withTmp = async (fn: (dir: string) => Promise<void>) => {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    `smartgpt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await fs.mkdir(dir, { recursive: true });
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
};

test("gatherRepoFiles honors include and exclude patterns", async (t) => {
  await withTmp(async (dir) => {
    const root = path.join(dir, "repo");
    const docs = path.join(root, "docs");
    const skip = path.join(root, "skip");
    const nodeModules = path.join(root, "node_modules", "pkg");
    await Promise.all([
      fs.mkdir(docs, { recursive: true }),
      fs.mkdir(skip, { recursive: true }),
      fs.mkdir(nodeModules, { recursive: true }),
    ]);
    const keepMd = path.join(docs, "keep.md");
    const keepTxt = path.join(root, "notes.txt");
    const skipMd = path.join(skip, "ignored.md");
    const skipPkg = path.join(nodeModules, "module.md");
    const codeTs = path.join(root, "code.ts");
    await Promise.all([
      fs.writeFile(keepMd, "# keep", "utf8"),
      fs.writeFile(keepTxt, "notes", "utf8"),
      fs.writeFile(skipMd, "# ignore", "utf8"),
      fs.writeFile(skipPkg, "# node_modules", "utf8"),
      fs.writeFile(codeTs, "export const code = 1;", "utf8"),
    ]);

    const include = ["**/*.{md,txt}"] as const;
    const exclude = [
      "node_modules/**",
      ".git/**",
      "dist/**",
      "build/**",
      ".obsidian/**",
      "skip/**",
    ] as const;

    const { files, fileInfo } = await gatherRepoFiles(root, {
      include,
      exclude,
    });
    const sorted = [...files].sort();
    const expected = ["docs/keep.md", "notes.txt"].sort();
    t.deepEqual(sorted, expected);
    t.true(sorted.every((rel) => (fileInfo[rel]?.size ?? 0) > 0));
  });
});

test("gatherRepoFiles rejects oversized glob inputs", async (t) => {
  await withTmp(async (dir) => {
    const root = path.join(dir, "repo");
    await fs.mkdir(root, { recursive: true });
    const longSegment = "a".repeat(1001);
    await t.throwsAsync(
      gatherRepoFiles(root, {
        include: [`**/${longSegment}.ts`],
      }),
      { message: /maximum length/i },
    );

    const manyPatterns = Array.from({ length: 501 }, (_, i) => `file${i}.ts`);
    await t.throwsAsync(
      gatherRepoFiles(root, {
        include: manyPatterns,
      }),
      { message: /too many glob patterns/i },
    );
  });
});

test.serial("symbolsIndex skips excluded directories", async (t) => {
  await withTmp(async (dir) => {
    const root = path.join(dir, "repo");
    const src = path.join(root, "src");
    const skip = path.join(root, "skip");
    await Promise.all([
      fs.mkdir(src, { recursive: true }),
      fs.mkdir(skip, { recursive: true }),
    ]);
    const keepTs = path.join(src, "keep.ts");
    const skipTs = path.join(skip, "ignored.ts");
    await Promise.all([
      fs.writeFile(keepTs, "export const keep = 1;", "utf8"),
      fs.writeFile(skipTs, "export const ignore = 2;", "utf8"),
    ]);

    const result = await symbolsIndex(root, {
      paths: ["**/*.ts"],
      exclude: [
        "node_modules/**",
        ".git/**",
        "dist/**",
        "build/**",
        ".obsidian/**",
        "skip/**",
      ],
    });
    t.is(result.files, 1);
    t.true(result.symbols >= 1);
  });
});

test("symbolsIndex enforces glob limits", async (t) => {
  await withTmp(async (dir) => {
    const root = path.join(dir, "repo");
    await fs.mkdir(root, { recursive: true });
    const longSegment = "b".repeat(2000);
    await t.throwsAsync(
      symbolsIndex(root, { paths: [`**/${longSegment}.ts`] }),
      { message: /maximum length/i },
    );

    const manyPatterns = Array.from({ length: 600 }, (_, i) => `file${i}.ts`);
    await t.throwsAsync(symbolsIndex(root, { paths: manyPatterns }), {
      message: /too many glob patterns/i,
    });
  });
});
