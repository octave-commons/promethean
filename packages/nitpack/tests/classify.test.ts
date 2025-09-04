import test from "ava";
import { classifyComments } from "../src/classify.js";

test("classify detects REL_JS_SUFFIX", (t) => {
  const c = ['please append .js to relative import from "./foo"'];
  const got = classifyComments(c);
  t.true(got.has("REL_JS_SUFFIX"));
});
