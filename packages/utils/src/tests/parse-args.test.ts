import test from "ava";

import { parseArgs } from "../parse-args.js";

test("overrides defaults with cli values", (t) => {
  const out = parseArgs({ "--foo": "bar" }, ["--foo", "baz"]);
  t.deepEqual(out, { "--foo": "baz" });
});

test("parses boolean flags", (t) => {
  const defaults = { "--flag": false };
  t.is(parseArgs(defaults, [])["--flag"], false);
  t.is(parseArgs(defaults, ["--flag"])["--flag"], true);
  t.is(parseArgs(defaults, ["--flag", "false"])["--flag"], false);
});
