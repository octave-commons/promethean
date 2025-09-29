import { mkdtemp, writeFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import test from "ava";

import { findBrokenImageLinks, fixBrokenImageLinks } from "../image-links.js";

test("finds broken markdown and org image links", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "img-test-"));
  await writeFile(
    path.join(dir, "doc.md"),
    [
      "![cat](cat.png)",
      "![space](<cat picture.png>)",
      '![escaped](cat\\ image.png "title")',
    ].join("\n"),
  );
  await writeFile(path.join(dir, "doc.org"), "[[file:dog.png][dog]]");
  const links = await findBrokenImageLinks(dir);
  t.deepEqual(links.map((l) => l.url).sort(), [
    "cat image.png",
    "cat picture.png",
    "cat.png",
    "dog.png",
  ]);
});

test("fixBrokenImageLinks generates files using provided generator", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "img-test-"));
  await writeFile(path.join(dir, "doc.md"), "![cat](cat.png)");
  const generator = async (_prompt: string, outPath: string): Promise<void> => {
    t.is(outPath, path.join(dir, "cat.png"));
    await writeFile(outPath, "fake-image");
  };
  const links = await fixBrokenImageLinks(dir, generator);
  t.is(links.length, 1);
  const fileExists = await stat(path.join(dir, "cat.png"))
    .then(() => true)
    .catch(() => false);
  t.true(fileExists);
});
