import test from "ava";

import { runQuery } from "@promethean/docops/dist/index.js";

test("runQuery is a function", (t) => {
  t.is(typeof runQuery, "function");
});
