import { promises as fs } from "fs";
import * as os from "os";
import * as path from "path";

import test, { type ExecutionContext } from "ava";

import { ollamaJSON, readJSON, readMaybe, rel, writeJSON } from "../utils.js";

async function createTempDir(
  t: Readonly<Pick<ExecutionContext, "teardown">>,
  prefix: string = "testgap-",
): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  t.teardown(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });
  return tmpDir;
}

test("writeJSON creates parent directories and writes formatted data", async (t) => {
  const tmpDir = await createTempDir(t);
  const filePath = path.join(tmpDir, "nested", "data.json");
  const payload = { value: 42 };

  await writeJSON(filePath, payload);

  const raw = await fs.readFile(filePath, "utf-8");
  t.is(raw, JSON.stringify(payload, null, 2));
});

test("readJSON returns parsed JSON data", async (t) => {
  const tmpDir = await createTempDir(t);
  const filePath = path.join(tmpDir, "config.json");
  const payload = { message: "hello" };
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload), "utf-8");

  const result = await readJSON<typeof payload>(filePath);
  t.deepEqual(result, payload);
});

test("readMaybe returns undefined when the file does not exist", async (t) => {
  const tmpDir = await createTempDir(t);
  const missingPath = path.join(tmpDir, "missing.txt");

  const result = await readMaybe(missingPath);

  t.is(result, undefined);
});

test("readMaybe returns file contents when the file exists", async (t) => {
  const tmpDir = await createTempDir(t);
  const filePath = path.join(tmpDir, "note.txt");
  const payload = "remember";
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, payload, "utf-8");

  const result = await readMaybe(filePath);

  t.is(result, payload);
});

test.serial("ollamaJSON parses fenced JSON responses", async (t) => {
  const responsePayload = { response: '```json\n{"status":"ok"}\n```' };
  const stub: typeof fetch = async () =>
    new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  const result = await ollamaJSON("model", "prompt", stub);

  if (typeof result !== "object" || result === null || !("status" in result)) {
    t.fail("ollamaJSON did not return an object with a status field");
    return;
  }

  t.deepEqual(result, { status: "ok" });
});

test("rel strips the current working directory prefix", (t) => {
  const absolutePath = path.join(
    process.cwd(),
    "packages",
    "testgap",
    "file.ts",
  );

  const result = rel(absolutePath);

  t.is(result, "packages/testgap/file.ts");
});
