import test from "ava";
import { mkAliasRewriter, mkRelativeToJs } from "../rewrite.js";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

test("alias rewrite", (t) => {
  const r = mkAliasRewriter("@old", "@new-");
  t.is(r("@old/logger"), "@new-logger");
  t.is(r("@old/utils/path/to/x"), "@new-utils/path/to/x");
  t.is(r("lodash"), null);
});

test("relative -> .js", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "alias-"));
  const from = join(dir, "src/a.ts");
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(from, "");
  writeFileSync(join(dir, "src/b.ts"), "");
  const f = mkRelativeToJs(from);
  t.is(f("./b"), "./b.js");
});

test("folder -> index.js if present", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "alias-"));
  const from = join(dir, "src/a.ts");
  mkdirSync(join(dir, "src/foo"), { recursive: true });
  writeFileSync(from, "");
  writeFileSync(join(dir, "src/foo/index.ts"), "");
  const f = mkRelativeToJs(from);
  t.is(f("./foo"), "./foo/index.js");
});
