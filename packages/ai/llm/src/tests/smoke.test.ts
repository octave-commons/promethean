import test from "ava";

import { generate } from "../index.js";

test("smoke: package loads", (t) => {
    t.truthy(generate);
});
