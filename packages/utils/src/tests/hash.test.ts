import test from "ava";

import { sha1 } from "../hash.js";

test("sha1 hashes text to hex digest", (t) => {
  t.is(sha1("test"), "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3");
});
