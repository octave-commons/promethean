import path from "node:path";

import test from "ava";

import { grep } from "../../grep.js";

const ROOT = path.join(process.cwd(), "tests", "fixtures");

test("grep: maxMatches limits results", async (t) => {
  const results = await grep(ROOT, {
    pattern: ".",
    flags: "g",
    paths: ["**/*.md", "**/*.ts"],
    maxMatches: 1,
    context: 0,
  });
  t.is(results.length, 1);
});

test("grep: invalid maxMatches falls back to default", async (t) => {
  const baseOptions = {
    pattern: ".",
    flags: "g",
    paths: ["**/*.md", "**/*.ts"],
    context: 0,
  } as const;
  const [baseline, invalid] = await Promise.all([
    grep(ROOT, baseOptions),
    grep(ROOT, { ...baseOptions, maxMatches: Number.NaN }),
  ]);
  const normalize = (
    matches: ReadonlyArray<(typeof baseline)[number]>,
  ): ReadonlyArray<(typeof baseline)[number]> =>
    [...matches].sort((left, right) => {
      if (left.path === right.path) {
        return left.line - right.line;
      }
      return left.path.localeCompare(right.path);
    });
  t.deepEqual(normalize(invalid), normalize(baseline));
});
