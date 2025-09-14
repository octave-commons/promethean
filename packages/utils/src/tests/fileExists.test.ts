import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import test from "ava";

import { fileExists } from "../fs.js";

test("fileExists detects existing and missing files", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "file-exists-"));
  const file = path.join(dir, "temp.txt");
  await fs.writeFile(file, "hi", "utf8");

  t.true(await fileExists(file));
  t.false(await fileExists(path.join(dir, "missing.txt")));
});
