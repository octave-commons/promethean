import test from "ava";

import { runQuery } from "@promethean/docops/dist/index.js";

test("runQuery exported", (t) => {
  t.is(typeof runQuery, "function");
});
