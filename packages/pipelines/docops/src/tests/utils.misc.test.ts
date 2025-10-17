import * as path from "path";
import * as fs from "fs/promises";

import test from "ava";
import { listFilesRec } from "@promethean/utils";

import {
  parseArgs,
  randomUUID,
  slugify,
  extnamePrefer,
  dedupe,
  readJSON,
  writeJSON,
  stripGeneratedSections,
  START_MARK,
  END_MARK,
  frontToYAML,
} from "../utils.js";

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

test("parseArgs respects defaults, flags, and value overrides", (t) => {
  const old = process.argv.slice();
  try {
    process.argv = ["node", "script", "--foo", "bar", "--flag"]; // flag sets true
    const out = parseArgs({ "--foo": "x", "--flag": "false", "--other": "1" });
    t.is(out["--foo"], "bar");
    t.is(out["--flag"], "true");
    t.is(out["--other"], "1");
  } finally {
    process.argv = old;
  }
});

test.serial(
  "listFilesRec filters by extension and skips Emacs lockfiles",
  async (t) => {
    await withTmp(async (dir) => {
      const docs = path.join(dir, "docs/nested");
      await fs.mkdir(docs, { recursive: true });
      await fs.writeFile(path.join(docs, "a.md"), "# A", "utf8");
      await fs.writeFile(path.join(docs, "b.txt"), "B", "utf8");
      await fs.writeFile(path.join(docs, ".#lock.md"), "LOCK", "utf8");
      const files = await listFilesRec(
        path.join(dir, "docs"),
        new Set([".md", ".txt"]),
      );
      t.true(files.some((p) => p.endsWith("a.md")));
      t.true(files.some((p) => p.endsWith("b.txt")));
      t.false(files.some((p) => path.basename(p).startsWith(".#")));
    });
  },
);

test("randomUUID returns unique-like ids", (t) => {
  const ids = new Set<string>();
  Array.from({ length: 10 }).forEach(() => ids.add(randomUUID()));
  t.is(ids.size, 10);
});

test("slugify basic rules", (t) => {
  t.is(slugify(" Hello, World! "), "hello-world");
  t.is(slugify("O'Reilly"), "oreilly");
});

test("extnamePrefer falls back to .md", (t) => {
  t.is(extnamePrefer("/x/y/z"), ".md");
  t.is(extnamePrefer("/x/y/z.txt"), ".txt");
});

test("dedupe removes duplicates and preserves order", (t) => {
  t.deepEqual(dedupe([1, 2, 2, 3, 1]), [1, 2, 3]);
});

test.serial(
  "readJSON returns fallback for missing then writeJSON persists",
  async (t) => {
    await withTmp(async (dir) => {
      const file = path.join(dir, "data.json");
      const fb = { a: 1, b: "" };
      const got = await readJSON(file, fb);
      t.deepEqual(got, fb);
      const data = { a: 2, b: "x" };
      await writeJSON(file, data);
      const got2 = await readJSON<typeof data>(file, fb);
      t.deepEqual(got2, data);
    });
  },
);

test("stripGeneratedSections removes markers and keeps above", (t) => {
  const s = ["top", START_MARK, "stuff", END_MARK, "tail"].join("\n");
  const out = stripGeneratedSections(s, START_MARK, END_MARK);
  t.is(out, "top");
  const out2 = stripGeneratedSections("no markers\n", START_MARK, END_MARK);
  t.is(out2, "no markers\n");
});

test("frontToYAML serializes with simple keys", (t) => {
  const y = frontToYAML({ uuid: "u", title: "T", tags: ["a", "b"] });
  t.true(/uuid:\s*u/.test(y));
  t.true(/title:\s*T/.test(y));
  t.true(/-\s*a/.test(y));
});
