import * as path from "path";
import * as fs from "fs/promises";

import test from "ava";

import {
  injectAnchors,
  anchorId,
  relMdLink,
  cosine,
  writeJSONArrayStream,
  writeNDJSON,
  safeReplacer,
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

test("anchorId derives ids", (t) => {
  t.is(anchorId("doc", 1, 2), "ref-doc-1-2");
});

test("relMdLink builds relative links", (t) => {
  t.is(relMdLink("/a/b.md", "/a/c.md"), "c.md");
});

test("cosine similarity", (t) => {
  t.true(cosine([1, 0], [1, 0]) > cosine([1, 0], [0, 1]));
});

test("writeJSONArrayStream writes array", async (t) => {
  await withTmp(async (dir) => {
    const file = path.join(dir, "a.json");
    await writeJSONArrayStream(file, [1, 2, 3]);
    const txt = await fs.readFile(file, "utf8");
    t.is(txt, "[1,2,3]");
  });
});

test("writeNDJSON writes lines", async (t) => {
  await withTmp(async (dir) => {
    const file = path.join(dir, "a.jsonl");
    await writeNDJSON(file, [1, 2]);
    const txt = await fs.readFile(file, "utf8");
    t.is(txt.trim(), "1\n2");
  });
});

test("injectAnchors inserts ids", (t) => {
  const out = injectAnchors("hello\nworld", [{ line: 2, id: "x" }]);
  t.regex(out, /world \^x/);
});

test("safeReplacer handles cycles", (t) => {
  const a: any = {};
  a.self = a;
  t.is(JSON.stringify(a, safeReplacer()), '{"self":"__CYCLE__"}');
});
