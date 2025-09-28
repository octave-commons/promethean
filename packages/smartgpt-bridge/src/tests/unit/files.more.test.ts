import path from "node:path";

import test from "ava";

import {
  locateStacktrace,
  resolvePath,
  viewFile,
  normalizeToRoot,
} from "../../files.js";
import { FIXTURES_ROOT, packageRoot } from "../helpers/fixtures.js";

const ROOT = FIXTURES_ROOT;
const PKG_ROOT = packageRoot();

test("locateStacktrace: Node style with function (nodeB)", async (t) => {
  const p = path.join(ROOT, "hello.ts");
  const trace = `Error at Greeter.greet (${p}:2:5)`;
  const res = await locateStacktrace(ROOT, trace, 1);
  t.true(res.length >= 1);
  t.true(res[0].resolved);
  t.is(res[0].path.endsWith("hello.ts"), true);
});

test("locateStacktrace: Python File:line unresolved", async (t) => {
  const res = await locateStacktrace(
    ROOT,
    'File "/no/such/file.py", line 12',
    1,
  );
  t.true(res.length >= 1);
  t.false(res[0].resolved);
});

test("locateStacktrace: Go file:line unresolved", async (t) => {
  const res = await locateStacktrace(ROOT, "cmd/main.go:45", 1);
  t.true(res.length >= 1);
  t.false(res[0].resolved);
});

test("resolvePath returns null for non-existent", async (t) => {
  const p = await resolvePath(ROOT, "nope.txt");
  t.is(p, null);
});

test("resolvePath rejects absolute paths outside root", async (t) => {
  const outside = path.resolve(ROOT, "..", "outside.txt");
  const p = await resolvePath(ROOT, outside);
  t.is(p, null);
});

test("viewFile throws when file missing", async (t) => {
  await t.throwsAsync(() => viewFile(ROOT, "nope.txt", 1, 1));
});

test("normalizeToRoot treats leading slash as repo root", (t) => {
  const p1 = normalizeToRoot(PKG_ROOT, "tests/fixtures/readme.md");
  const p2 = normalizeToRoot(PKG_ROOT, "/tests/fixtures/readme.md");
  t.is(p1, p2);
});

test('normalizeToRoot resolves "/" to repo root', (t) => {
  const p = normalizeToRoot(PKG_ROOT, "/");
  t.is(p, path.resolve(PKG_ROOT));
});

test("normalizeToRoot allows absolute paths inside root", (t) => {
  const abs = path.join(PKG_ROOT, "tests", "fixtures", "hello.ts");
  const normalized = normalizeToRoot(PKG_ROOT, abs);
  t.is(normalized, abs);
});
