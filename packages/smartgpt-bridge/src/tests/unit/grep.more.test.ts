import test from "ava";

import { grep } from "../../grep.js";
import { FIXTURES_ROOT } from "../helpers/fixtures.js";

const ROOT = FIXTURES_ROOT;

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
