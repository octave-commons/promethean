import * as path from "node:path";
import { promises as fs } from "node:fs";

import test from "ava";
import { openLevelCache } from "@promethean/level-cache";

const TMP = path.join(".cache", "readmeflow-test");

test("level cache read/write", async (t) => {
  const cache = await openLevelCache<{ msg: string }>({ path: TMP });
  await cache.set("greeting", { msg: "hi" });
  const val = await cache.get("greeting");
  t.deepEqual(val, { msg: "hi" });
  await cache.del("greeting");
  await cache.close();
  await fs.rm(TMP, { recursive: true, force: true });
});
