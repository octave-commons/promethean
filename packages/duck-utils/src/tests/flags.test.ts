import test from "ava";

import { parseBool } from "../flags.js";

test("parseBool returns default for undefined values", (t) => {
  t.false(parseBool(undefined, false));
  t.true(parseBool(undefined, true));
});

test("parseBool trims whitespace and normalizes case", (t) => {
  t.true(parseBool(" true\n", false));
  t.false(parseBool("\tFALSE  ", true));
});

test("parseBool falls back to the provided default for unknown strings", (t) => {
  t.true(parseBool("on", true));
  t.false(parseBool("on", false));
});
