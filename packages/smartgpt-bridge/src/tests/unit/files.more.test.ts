import path from "node:path";
import { fileURLToPath } from "node:url";

import test from "ava";

import {
  locateStacktrace,
  resolvePath,
  viewFile,
  normalizeToRoot,
} from "../../files.js";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TEST_DIR, "../../../tests/fixtures");

type StacktraceHit = {
  resolved: boolean;
  path?: string;
};

test("locateStacktrace: Node style with function (nodeB)", async (t) => {
  const p = path.join(ROOT, "hello.ts");
  const trace = `Error at Greeter.greet (${p}:2:5)`;
  const res = (await locateStacktrace(ROOT, trace, 1)) as StacktraceHit[];
  t.true(res.length >= 1);
  const first = res[0];
  if (!first) {
    t.fail("expected stacktrace result");
    return;
  }
  t.true(first.resolved);
  t.is(Boolean(first.path && first.path.endsWith("hello.ts")), true);
});

test("locateStacktrace: Python File:line unresolved", async (t) => {
  const res = (await locateStacktrace(
    ROOT,
    'File "/no/such/file.py", line 12',
    1,
  )) as StacktraceHit[];
  t.true(res.length >= 1);
  const first = res[0];
  if (!first) {
    t.fail("expected stacktrace result");
    return;
  }
  t.false(first.resolved);
});

test("locateStacktrace: Go file:line unresolved", async (t) => {
  const res = (await locateStacktrace(
    ROOT,
    "cmd/main.go:45",
    1,
  )) as StacktraceHit[];
  t.true(res.length >= 1);
  const first = res[0];
  if (!first) {
    t.fail("expected stacktrace result");
    return;
  }
  t.false(first.resolved);
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
  const p1 = normalizeToRoot(process.cwd(), "tests/fixtures/readme.md");
  const p2 = normalizeToRoot(process.cwd(), "/tests/fixtures/readme.md");
  t.is(p1, p2);
});

test('normalizeToRoot resolves "/" to repo root', (t) => {
  const p = normalizeToRoot(process.cwd(), "/");
  t.is(p, path.resolve(process.cwd()));
});

test("normalizeToRoot allows absolute paths inside root", (t) => {
  const abs = path.join(process.cwd(), "tests", "fixtures", "hello.ts");
  const normalized = normalizeToRoot(process.cwd(), abs);
  t.is(normalized, abs);
});
