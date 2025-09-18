import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";

import { scanFiles } from "../scan-files.js";

async function withTmp(fn: (dir: string) => Promise<void> | void) {
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

test("scanFiles skips directories listed in ignoreDirs", async (t) => {
  await withTmp(async (dir) => {
    const root = path.join(dir, "root");
    await fs.mkdir(path.join(root, "include", "sub"), { recursive: true });
    await fs.mkdir(path.join(root, "skip", "nested"), { recursive: true });

    await fs.writeFile(path.join(root, "include", "a.txt"), "A", "utf8");
    await fs.writeFile(path.join(root, "include", "sub", "b.txt"), "B", "utf8");
    await fs.writeFile(path.join(root, "skip", "nested", "c.txt"), "C", "utf8");

    const seen: string[] = [];
    const result = await scanFiles({
      root,
      exts: [".txt"],
      ignoreDirs: ["skip"],
      onFile: async ({ path: filePath }) => {
        seen.push(path.relative(root, filePath));
      },
    });

    seen.sort();
    t.deepEqual(seen, [
      path.join("include", "a.txt"),
      path.join("include", "sub", "b.txt"),
    ]);
    t.is(result.total, 2);
    t.is(result.processed, 2);
    t.true(result.durationMs >= 0);
  });
});

test("scanFiles filters by extensions and returns content when requested", async (t) => {
  await withTmp(async (dir) => {
    const root = path.join(dir, "root");
    await fs.mkdir(root, { recursive: true });

    await fs.writeFile(path.join(root, "keep.md"), "# Title", "utf8");
    await fs.writeFile(path.join(root, "skip.txt"), "ignore", "utf8");

    const files: Array<{ path: string; content: string | undefined }> = [];
    const result = await scanFiles({
      root,
      exts: ["md"],
      readContent: true,
      onFile: async (file) => {
        files.push({
          path: path.relative(root, file.path),
          content: file.content,
        });
      },
    });

    t.deepEqual(files, [{ path: "keep.md", content: "# Title" }]);
    t.is(result.total, 1);
    t.is(result.processed, 1);
    t.is(result.files, undefined);
  });
});

test("scanFiles batches callbacks and reports progress", async (t) => {
  await withTmp(async (dir) => {
    const root = path.join(dir, "root");
    await fs.mkdir(root, { recursive: true });

    await Promise.all(
      ["one.txt", "two.txt", "three.txt"].map((name, idx) =>
        fs.writeFile(path.join(root, name), `file-${idx}`, "utf8"),
      ),
    );

    const batchSizes: number[] = [];
    const progressFromBatches: number[] = [];
    const progressFromCallback: number[] = [];
    const contentMap = new Map<string, string | undefined>();

    const result = await scanFiles({
      root,
      exts: [".txt"],
      batchSize: 2,
      readContent: async (filePath) => filePath.endsWith("two.txt"),
      onBatch: async (batch, progress) => {
        batchSizes.push(batch.length);
        progressFromBatches.push(progress.processed);
        for (const entry of batch) {
          contentMap.set(path.basename(entry.path), entry.content);
        }
      },
      onProgress: (progress) => {
        progressFromCallback.push(progress.processed);
      },
    });

    t.deepEqual(batchSizes, [2, 1]);
    t.deepEqual(progressFromBatches, [2, 3]);
    t.deepEqual(progressFromCallback, [1, 2, 3]);
    t.is(contentMap.get("two.txt"), "file-1");
    t.is(contentMap.get("one.txt"), undefined);
    t.is(contentMap.get("three.txt"), undefined);
    t.is(result.total, 3);
    t.is(result.processed, 3);
  });
});
