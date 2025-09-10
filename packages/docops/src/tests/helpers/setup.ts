import test from "ava";

import { ensureServices } from "./services.js";

test.before(async () => {
  await ensureServices();
});

export {};
