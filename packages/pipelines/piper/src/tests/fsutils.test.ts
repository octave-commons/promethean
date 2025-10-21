import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";

import { listOutputsExist } from "../fsutils.js";

async function withTmp(fn: { (dir: any): Promise<void>; (arg0: string): any }) {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    String(Date.now()) + "-" + Math.random().toString(36).slice(2),
  );
  await fs.mkdir(dir, { recursive: true });
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test("listOutputsExist returns true when any pattern has matches", async (t) => {
  await withTmp(async (dir) => {
    const outDir = path.join(dir, "build");
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, "out.txt"), "x", "utf8");
    const ok = await listOutputsExist(["build/*.txt"], dir);
    t.true(ok);
    const no = await listOutputsExist(["dist/*.js"], dir);
    t.false(no);
  });
});
