import * as fs from "fs/promises";
import * as path from "path";

import test, { type ExecutionContext } from "ava";
import type { ReadonlyDeep } from "type-fest";

import { scanFiles } from "../scan-files.js";

type TeardownContext = ReadonlyDeep<Pick<ExecutionContext, "teardown">>;

async function createTmp(t: TeardownContext): Promise<string> {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await fs.mkdir(dir, { recursive: true });
  t.teardown(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });
  return dir;
}

const insertSorted = (
  ordered: ReadonlyArray<string>,
  value: string,
): ReadonlyArray<string> => {
  const index = ordered.findIndex(
    (candidate) => value.localeCompare(candidate) < 0,
  );
  if (index < 0) {
    return [...ordered, value];
  }
  return [...ordered.slice(0, index), value, ...ordered.slice(index)];
};

const sortStrings = (values: ReadonlyArray<string>): ReadonlyArray<string> =>
  values.reduce<ReadonlyArray<string>>(insertSorted, []);

test("scanFiles skips directories listed in ignoreDirs", async (t) => {
  const dir = await createTmp(t);
  const root = path.join(dir, "root");
  await fs.mkdir(path.join(root, "include", "sub"), { recursive: true });
  await fs.mkdir(path.join(root, "skip", "nested"), { recursive: true });

  await fs.writeFile(path.join(root, "include", "a.txt"), "A", "utf8");
  await fs.writeFile(path.join(root, "include", "sub", "b.txt"), "B", "utf8");
  await fs.writeFile(path.join(root, "skip", "nested", "c.txt"), "C", "utf8");

  const result = await scanFiles({
    root,
    exts: [".txt"],
    ignoreDirs: ["skip"],
  });

  const seen = (result.files ?? []).map((file) =>
    path.relative(root, file.path),
  );
  const expected = [
    path.join("include", "a.txt"),
    path.join("include", "sub", "b.txt"),
  ];
  t.deepEqual(sortStrings(seen), sortStrings(expected));
  t.is(result.total, 2);
  t.is(result.processed, 2);
  t.true(result.durationMs >= 0);
});

test("scanFiles filters by extensions and returns content when requested", async (t) => {
  const dir = await createTmp(t);
  const root = path.join(dir, "root");
  await fs.mkdir(root, { recursive: true });

  await fs.writeFile(path.join(root, "keep.md"), "# Title", "utf8");
  await fs.writeFile(path.join(root, "skip.txt"), "ignore", "utf8");

  const result = await scanFiles({
    root,
    exts: ["md"],
    readContent: true,
  });

  const files = (result.files ?? []).map((file) => ({
    path: path.relative(root, file.path),
    content: file.content,
  }));
  t.deepEqual(files, [{ path: "keep.md", content: "# Title" }]);
  t.is(result.total, 1);
  t.is(result.processed, 1);
  t.is(result.files, undefined);
});

test("scanFiles batches callbacks and reports progress", async (t) => {
  t.plan(17);
  const dir = await createTmp(t);
  const root = path.join(dir, "root");
  await fs.mkdir(root, { recursive: true });

  await Promise.all(
    ["one.txt", "two.txt", "three.txt"].map((name, idx) =>
      fs.writeFile(path.join(root, name), `file-${idx}`, "utf8"),
    ),
  );

  const result = await scanFiles({
    root,
    exts: [".txt"],
    batchSize: 2,
    readContent: async (filePath) => filePath.endsWith("two.txt"),
    onBatch: async (batch, progress) => {
      if (progress.processed === 2) {
        t.is(batch.length, 2);
        t.deepEqual(
          sortStrings(batch.map((entry) => path.basename(entry.path))),
          sortStrings(["one.txt", "two.txt"]),
        );
        t.is(
          batch.find((entry) => entry.path.endsWith("two.txt"))?.content,
          "file-1",
        );
      } else if (progress.processed === 3) {
        t.is(batch.length, 1);
        t.deepEqual(
          batch.map((entry) => path.basename(entry.path)),
          ["three.txt"],
        );
        t.is(batch.at(0)?.content, undefined);
      } else {
        t.fail(`unexpected batch progress ${progress.processed}`);
      }
    },
    onProgress: (progress) => {
      t.true(progress.processed >= 1 && progress.processed <= 3);
      t.is(progress.total, 3);
      t.is(progress.percentage, progress.processed / progress.total);
    },
  });

  t.is(result.total, 3);
  t.is(result.processed, 3);
});
