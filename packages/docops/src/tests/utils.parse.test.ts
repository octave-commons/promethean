import * as path from "path";
import * as fs from "fs/promises";

import test from "ava";
import { cosine } from "@promethean/utils";

import {
  parseMarkdownChunks,
  injectAnchors,
  anchorId,
  relMdLink,
  writeJSONArrayStream,
  writeNDJSON,
  safeReplacer,
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

test("parseMarkdownChunks extracts text and code with headings", (t) => {
  const md = [
    "# Title",
    "",
    "Paragraph one. Another sentence.",
    "",
    "- list item 1",
    "- list item 2",
    "",
    "```js",
    "console.log('x')",
    "```",
  ].join("\n");
  const chunks = parseMarkdownChunks(md);
  t.true(chunks.length >= 3);
  t.true(chunks.some((c) => c.kind === "code"));
  t.true(chunks.some((c) => c.kind === "text"));
  // ensure headings captured as titles on following chunks
  const titled = chunks.filter((c) => c.title === "Title");
  t.true(titled.length > 0, "chunks after heading should carry title");
  // positions are 1-based lines
  t.true(chunks.every((c) => c.startLine >= 1 && c.endLine >= c.startLine));
});

test("computeFenceMap and injectAnchors avoid code fences", (t) => {
  const md = ["# H", "text line", "```", "code line", "```", "after"].join(
    "\n",
  );
  const anchors = [
    { line: 4, id: "ref-uuid-4-1" },
    { line: 6, id: "ref-uuid-6-1" },
  ];
  const out = injectAnchors(md, anchors);
  // the anchor for line 4 should be placed outside fence (after fence ends)
  t.false(out.includes("^ref-uuid-4-1\ncode line"));
  t.true(out.includes("^ref-uuid-6-1"));
});

test("anchorId and relMdLink basics", (t) => {
  const id = anchorId("abc123456789", 10, 2);
  t.true(id.startsWith("ref-abc12345-10-2"));
  const from = "/root/docs/a/b/file.md";
  const to = "/root/docs/a/other.md";
  const rel = relMdLink(from, to);
  t.is(rel, "../other.md");
});

test("cosine similarity sanity", (t) => {
  const a = [1, 0, 0];
  const b = [1, 0, 0];
  const c = [0, 1, 0];
  t.is(cosine(a, b), 1);
  t.is(cosine(a, c), 0);
});

test.serial(
  "writeJSONArrayStream and writeNDJSON produce valid files",
  async (t) => {
    await withTmp(async (dir: string) => {
      const arrPath = path.join(dir, "arr.json");
      await writeJSONArrayStream(arrPath, [1, 2, 3], safeReplacer());
      const arrRaw = await fs.readFile(arrPath, "utf8");
      t.deepEqual(JSON.parse(arrRaw), [1, 2, 3]);

      const ndjsonPath = path.join(dir, "out.ndjson");
      await writeNDJSON(ndjsonPath, [{ a: 1 }, { b: 2 }], safeReplacer());
      const lines = (await fs.readFile(ndjsonPath, "utf8")).trim().split(/\n+/);
      t.deepEqual(
        lines.map((l) => JSON.parse(l)),
        [{ a: 1 }, { b: 2 }],
      );
    });
  },
);
