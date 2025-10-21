import path from "path";

import test from "ava";

import { hashSignature, parseArgsFromList, rel } from "../utils.js";

test("parseArgs merges CLI flags without mutating defaults", (t) => {
  const defaults = {
    "--foo": "one",
    "--flag": "false",
  } as const satisfies Record<string, string>;
  const result = parseArgsFromList(defaults, ["--foo", "two", "--flag"]);

  t.is(result["--foo"], "two");
  t.is(result["--flag"], "true");
  t.deepEqual(defaults, {
    "--foo": "one",
    "--flag": "false",
  });
});

test("hashSignature produces stable hashes", (t) => {
  t.is(hashSignature("alpha"), hashSignature("alpha"));
  t.not(hashSignature("alpha"), hashSignature("beta"));
});

test("rel normalizes path separators relative to cwd", (t) => {
  const nested = path.join(process.cwd(), "foo", "bar", "baz.txt");
  t.is(rel(nested), "foo/bar/baz.txt");
});
