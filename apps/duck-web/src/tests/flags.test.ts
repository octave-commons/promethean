import test from "ava";

import { parseBool } from "../flags.js";

test("parseBool returns default for non-string values", (t) => {
  t.false(parseBool(undefined, false));
  t.true(parseBool(undefined, true));
  t.false(parseBool(0, false));
});

test("parseBool trims whitespace and matches true/false", (t) => {
  t.true(parseBool("  true  ", false));
  t.false(parseBool("\nfalse\t", true));
});

test("parseBool handles mixed case and falls back to default", (t) => {
  t.true(parseBool("TrUe", false));
  t.false(parseBool("FaLsE", true));
  t.true(parseBool("maybe", true));
  t.false(parseBool("maybe", false));
});
