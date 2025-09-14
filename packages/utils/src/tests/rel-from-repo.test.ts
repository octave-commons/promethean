import * as path from "path";

import test from "ava";

import { relFromRepo } from "../path.js";

test("relFromRepo normalizes separators", (t) => {
  const abs = path.join(process.cwd(), "foo", "bar", "baz.txt");
  const rel = relFromRepo(abs);
  t.is(rel, "foo/bar/baz.txt");
});
