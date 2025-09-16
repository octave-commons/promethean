import test from "ava";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { openLevelCache } from "@promethean/level-cache";

const run = (args, options = {}) => {
  const res = spawnSync("node", args, {
    cwd: path.resolve("."),
    encoding: "utf8",
    ...options,
  });
  if (res.status !== 0) throw new Error(res.stderr || res.stdout);
  return res;
};

test("dedupe-versions caches plan and read command retrieves it", async (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dedupe-"));
  fs.writeFileSync(path.join(tmp, "a.md"), "one");
  fs.writeFileSync(path.join(tmp, "a v2.md"), "two");
  const board = path.join(tmp, "board.md");
  fs.writeFileSync(board, "- [ ] [[a]]");
  const key = `test-${Date.now()}`;

  run([
    "scripts/dedupe-versions.mjs",
    tmp,
    "--plan",
    key,
    "--ext",
    "md",
    "--board",
    board,
  ]);

  const cachePath = path.join(process.cwd(), ".cache", "dedupe-versions");
  const cache = await openLevelCache({ path: cachePath });
  const plan = await cache.get(key);
  await cache.close();
  t.truthy(plan);
  t.is(plan[0].drops.length, 1);

  const out = run(["scripts/dedupe-versions-plan.mjs", key]);
  const parsed = JSON.parse(out.stdout);
  t.deepEqual(parsed, plan);

  const cache2 = await openLevelCache({ path: cachePath });
  await cache2.del(key);
  await cache2.close();
});
