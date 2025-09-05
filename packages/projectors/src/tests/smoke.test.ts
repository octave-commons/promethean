import test from "ava";

import { startTransactionalProjector } from "../transactional.js";

test("smoke: package loads", (t) => {
    t.truthy(startTransactionalProjector);
});
