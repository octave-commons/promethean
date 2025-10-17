import test from "ava";
import { parseArgs } from "@promethean/utils";

import { parseTsc, sanitizeBranch } from "../utils.js";

test("parseArgs overrides defaults with CLI values", (t) => {
  const out = parseArgs({ "--foo": "baz", "--flag": false }, [
    "--foo",
    "bar",
    "--flag",
  ]);
  t.is(out["--foo"], "bar");
  t.is(out["--flag"], true);
});

test("parseTsc extracts diagnostics", (t) => {
  const sample = "/path/file.ts(10,20): error TS1234: Example message";
  const res = parseTsc(sample);
  t.deepEqual(res, [
    {
      file: "/path/file.ts",
      line: 10,
      col: 20,
      code: "TS1234",
      message: "Example message",
    },
  ]);
});

test("sanitizeBranch removes invalid characters", (t) => {
  const branch = sanitizeBranch("feat/Bad*Branch!?Name");
  t.is(branch, "feat/Bad-Branch-Name");
});