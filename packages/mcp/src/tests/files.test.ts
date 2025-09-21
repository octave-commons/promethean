import test, { type ExecutionContext } from "ava";
import fs from "node:fs/promises";
import path from "node:path";

import * as files from "../files.js";

type TestCtx = ExecutionContext<unknown>;

const makeTmp = async (t: TestCtx) => {
  const tmp = path.resolve(
    process.cwd(),
    "test",
    `.tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await fs.mkdir(tmp, { recursive: true });
  t.teardown(async () => {
    try {
      await fs.rm(tmp, { recursive: true, force: true });
    } catch {}
  });
  return tmp;
};

test.serial("normalizeToRoot prevents escaping", async (t) => {
  const root = await makeTmp(t);
  const target = path.join(root, "a.txt");
  await fs.writeFile(target, "x", "utf8");
  t.true(files.isInsideRoot(root, "a.txt"));
  t.false(files.isInsideRoot(root, "../a.txt"));
  t.throws(() => files.normalizeToRoot(root, "../a.txt"));
});

test.serial("writeFileContent + viewFile roundtrip", async (t) => {
  const root = await makeTmp(t);
  const rel = "hello/world.txt";
  const text = ["line1", "line2", "line3"].join("\n");
  await files.writeFileContent(root, rel, text);
  const view = await files.viewFile(root, rel, 2, 1);
  t.is(view.focusLine, 2);
  t.true(view.snippet.includes("line2"));
  t.is(view.startLine, 1);
  t.is(view.endLine, 3);
});

test.serial(
  "listDirectory hides dotfiles by default and sorts dirs first",
  async (t) => {
    const root = await makeTmp(t);
    await fs.mkdir(path.join(root, "dirA"));
    await fs.writeFile(path.join(root, "b.txt"), "b", "utf8");
    await fs.writeFile(path.join(root, ".secret"), "r", "utf8");
    const res = await files.listDirectory(root, ".");
    t.true(res.ok);
    const names = res.entries.map((entry) => entry.name);
    t.is(names[0], "dirA");
    t.false(names.includes(".secret"));
  },
);

test.serial("treeDirectory respects depth", async (t) => {
  const root = await makeTmp(t);
  await fs.mkdir(path.join(root, "d1/d2"), { recursive: true });
  await fs.writeFile(path.join(root, "d1/file.txt"), "x", "utf8");
  const tree1 = await files.treeDirectory(root, ".", { depth: 1 });
  t.true(Array.isArray(tree1.tree));
  const d1 = tree1.tree.find((n) => n.name === "d1");
  t.truthy(d1);
  t.falsy(d1?.children);
  const tree2 = await files.treeDirectory(root, ".", { depth: 2 });
  const d1b = tree2.tree.find((n) => n.name === "d1");
  t.true(Array.isArray(d1b?.children));
});

test.serial("writeFileLines inserts at position", async (t) => {
  const root = await makeTmp(t);
  const rel = "f.txt";
  await files.writeFileContent(root, rel, ["a", "b", "d"].join("\n"));
  await files.writeFileLines(root, rel, ["X", "Y"], 2);
  const content = await fs.readFile(path.join(root, rel), "utf8");
  t.is(content, ["a", "X", "Y", "b", "d"].join("\n"));
});
