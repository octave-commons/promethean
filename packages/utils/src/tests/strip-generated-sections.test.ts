import test from "ava";

import {
  stripGeneratedSections,
  START_MARK,
  END_MARK,
} from "../strip-generated-sections.js";

test("stripGeneratedSections removes generated sections", (t) => {
  const s = ["top", START_MARK, "stuff", END_MARK, "tail"].join("\n");
  const out = stripGeneratedSections(s, START_MARK, END_MARK);
  t.is(out, "top");
  const out2 = stripGeneratedSections("no markers\n", START_MARK, END_MARK);
  t.is(out2, "no markers\n");
});
