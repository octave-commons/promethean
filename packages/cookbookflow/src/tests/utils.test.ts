import { promises as fs } from "fs";
import os from "os";
import path from "path";

import test from "ava";

import { readMaybe, writeJSON, writeText, execShell } from "../utils.js";

const tempRoot = path.join(os.tmpdir(), "cookbookflow-tests");

async function makeTempDir() {
  await fs.mkdir(tempRoot, { recursive: true });
  return fs.mkdtemp(path.join(tempRoot, "run-"));
}

test("readMaybe returns undefined for missing files", async (t) => {
  const dir = await makeTempDir();
  const missingFile = path.join(dir, "missing.txt");

  const result = await readMaybe(missingFile);

  t.is(result, undefined);
});

test("writeText writes file content", async (t) => {
  const dir = await makeTempDir();
  const file = path.join(dir, "notes.txt");
  const expected = "hello world";

  await writeText(file, expected);
  const actual = await fs.readFile(file, "utf-8");

  t.is(actual, expected);
});

test("writeJSON writes structured data", async (t) => {
  const dir = await makeTempDir();
  const file = path.join(dir, "data.json");
  const payload = { foo: "bar" };

  await writeJSON(file, payload);
  const raw = await fs.readFile(file, "utf-8");

  t.deepEqual(JSON.parse(raw), payload);
});

test("readMaybe reads file content when present", async (t) => {
  const dir = await makeTempDir();
  const file = path.join(dir, "note.txt");
  await fs.writeFile(file, "hello", "utf-8");

  const result = await readMaybe(file);

  t.is(result, "hello");
});

test("execShell captures stdout and exit code", async (t) => {
  const dir = await makeTempDir();
  const { code, stdout, stderr } = await execShell(
    process.execPath,
    ["-e", "process.stdout.write('ok')"],
    dir,
  );

  t.is(code, 0);
  t.is(stdout, "ok");
  t.is(stderr, "");
});

test("execShell reports failures", async (t) => {
  const dir = await makeTempDir();
  const { code, stdout } = await execShell(
    process.execPath,
    ["-e", "process.exit(5)"],
    dir,
  );

  t.is(code, 5);
  t.is(stdout, "");
});
