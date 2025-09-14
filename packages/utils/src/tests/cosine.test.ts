import test from "ava";

import { cosine } from "../cosine.js";

test("cosine similarity basics", (t) => {
  t.is(cosine([1, 0], [0, 1]), 0);
  t.true(Math.abs(cosine([1, 1], [1, 1]) - 1) < 1e-9);
});
