import test from "ava";
import { classifyComments } from "../src/classify.js";

test("classify detects REL_JS_SUFFIX", (t) => {
  const c = ['please append .js to relative import from "./foo"'];
  const got = classifyComments(c);
  t.true(got.has("REL_JS_SUFFIX"));
});

test("classify ignores unrelated comments", (t) => {
  const got = classifyComments(["no issues here"]);
  t.is(got.size, 0);
});

test("classify aggregates multiple hits", (t) => {
  const c = [
    'use from "./foo" somewhere',
    'also from "../bar" required',
  ];
  const got = classifyComments(c);
  t.is(got.get("REL_JS_SUFFIX")?.length, 2);
});
