import * as path from "path";
import * as fs from "fs/promises";

import test from "ava";

import {
  parseArgs,
  slugify,
  extnamePrefer,
  dedupe,
  readJSON,
  writeJSON,
  stripGeneratedSections,
  frontToYAML,
} from "@promethean/docops/dist/utils.js";

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

test("slugify and extnamePrefer", (t) => {
  t.is(slugify("Hello World!"), "hello-world");
  t.is(extnamePrefer("a.md"), ".md");
});

test("dedupe removes duplicates", (t) => {
  t.deepEqual(dedupe([1, 1, 2]), [1, 2]);
});

test("parseArgs merges defaults", (t) => {
  const prev = process.argv;
  process.argv = ["node", "script", "--a", "1", "--b"] as any;
  t.deepEqual(parseArgs({ "--a": "0" }), { "--a": "1", "--b": "true" });
  process.argv = prev;
});

test("readJSON and writeJSON roundtrip", async (t) => {
  await withTmp(async (dir) => {
    const file = path.join(dir, "a.json");
    await writeJSON(file, { a: 1 });
    t.deepEqual(await readJSON(file, {}), { a: 1 });
  });
});

test("stripGeneratedSections removes markers", (t) => {
  const s = stripGeneratedSections(
    "a\n<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->\nX\n<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->\n",
  );
  t.is(s, "a");
});

test("frontToYAML serializes", (t) => {
  t.regex(frontToYAML({ title: "hi" }), /title: hi/);
});
