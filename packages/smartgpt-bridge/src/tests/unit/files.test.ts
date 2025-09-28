import path from "node:path";

import test from "ava";

import { viewFile, resolvePath } from "../../files.js";
import { FIXTURES_ROOT } from "../helpers/fixtures.js";

const ROOT = FIXTURES_ROOT;

test("viewFile: returns correct window around line", async (t) => {
  const out = await viewFile(ROOT, "readme.md", 3, 2);
  t.log({
    totalLines: out.totalLines,
    startLine: out.startLine,
    endLine: out.endLine,
  });
  t.is(out.path, "readme.md");
  t.is(out.focusLine, 3);
  t.is(out.startLine, 1);
  t.true(out.endLine >= 3);
  t.true(out.snippet.includes("tiny readme"));
});

test("resolvePath: fuzzy by basename", async (t) => {
  const p = await resolvePath(ROOT, "hello.ts");
  t.log({ resolved: p });
  t.truthy(p);
  t.true((p as string).endsWith(path.join("tests", "fixtures", "hello.ts")));
});
