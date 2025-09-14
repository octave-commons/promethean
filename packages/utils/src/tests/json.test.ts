import * as path from "path";
import * as fs from "fs/promises";
import test from "ava";

import { readJSON, writeJSON } from "../json.js";

async function tmpFile(name: string) {
  const dir = path.join(process.cwd(), "test-tmp", Date.now().toString());
  await fs.mkdir(dir, { recursive: true });
  return { dir, file: path.join(dir, name) };
}

test("readJSON returns fallback for missing", async (t) => {
  const { file, dir } = await tmpFile("missing.json");
  const fb = { a: 1 };
  const res = await readJSON<typeof fb>(file, fb);
  t.deepEqual(res, fb);
  await fs.rm(dir, { recursive: true, force: true });
});

test("writeJSON writes data and readJSON reads it", async (t) => {
  const { file, dir } = await tmpFile("data.json");
  const data = { x: 1 };
  await writeJSON(file, data);
  const got = await readJSON<typeof data>(file);
  t.deepEqual(got, data);
  await fs.rm(dir, { recursive: true, force: true });
});
