import * as path from "path";
import * as fs from "fs/promises";

import test from "ava";

import { convertWikilinks } from "../convert-wikilinks.js";

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    String(Date.now()) + "-" + Math.random().toString(36).slice(2),
  );
  await fs.mkdir(dir, { recursive: true });
  await fn(dir).finally(() =>
    fs.rm(dir, { recursive: true, force: true }).catch(() => {}),
  );
}

test("convertWikilinks replaces wikilinks", async (t) => {
  await withTmp(async (dir) => {
    const file = path.join(dir, "a.md");
    await fs.writeFile(file, "See [[Foo Bar]] and [[target|alias]]", "utf8");
    await convertWikilinks(file);
    const out = await fs.readFile(file, "utf8");
    t.is(out, "See [Foo Bar](Foo%20Bar.md) and [alias](target.md)");
  });
});

test("convertWikilinks preserves anchors", async (t) => {
  await withTmp(async (dir) => {
    const file = path.join(dir, "anchors.md");
    await fs.writeFile(
      file,
      "See [[promethean-notes#^anchor]] and [[promethean-notes#^anchor|alias]]",
      "utf8",
    );
    await convertWikilinks(file);
    const out = await fs.readFile(file, "utf8");
    t.is(
      out,
      "See [promethean-notes](promethean-notes.md#^anchor) and [alias](promethean-notes.md#^anchor)",
    );
  });
});

test("convertWikilinks no change leaves file intact", async (t) => {
  await withTmp(async (dir) => {
    const file = path.join(dir, "b.md");
    const content = "No links here";
    await fs.writeFile(file, content, "utf8");
    await convertWikilinks(file);
    const out = await fs.readFile(file, "utf8");
    t.is(out, content);
  });
});
