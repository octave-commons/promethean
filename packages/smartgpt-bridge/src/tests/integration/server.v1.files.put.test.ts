import fs from "node:fs/promises";
import path from "node:path";

import test from "ava";

import { withServer } from "../helpers/server.js";

const ROOT = path.join(process.cwd(), "tests", "fixtures");
const FILE_WRITE = "putfile.write.test.txt";
const FILE_EDIT = "putfile.edit.test.txt";
const FILE_MISSING = "putfile.missing.test.txt";

async function removeFile(fileName: string) {
  const target = path.join(ROOT, fileName);
  try {
    await fs.unlink(target);
  } catch {}
}

test("PUT /v1/files writes full file", async (t) => {
  const targetPath = path.join(ROOT, FILE_WRITE);
  await removeFile(FILE_WRITE);
  t.teardown(() => removeFile(FILE_WRITE));

  await withServer(ROOT, async (req) => {
    const content = "hello\nworld";
    const res = await req
      .put("/v1/files")
      .send({ path: FILE_WRITE, content })
      .expect(200);
    t.true(res.body.ok);
    const file = await fs.readFile(targetPath, "utf8");
    t.is(file, content);
  });
});

test("PUT /v1/files edits specific lines", async (t) => {
  const targetPath = path.join(ROOT, FILE_EDIT);
  await removeFile(FILE_EDIT);
  await fs.writeFile(targetPath, "a\nb\nc\nd\ne", "utf8");
  t.teardown(() => removeFile(FILE_EDIT));

  await withServer(ROOT, async (req) => {
    const res = await req
      .put("/v1/files")
      .send({ path: FILE_EDIT, lines: ["X", "Y"], startLine: 2 })
      .expect(200);
    t.true(res.body.ok);
    const file = await fs.readFile(targetPath, "utf8");
    t.is(file, "a\nX\nY\nd\ne");
  });
});

test("PUT /v1/files returns 400 for missing path", async (t) => {
  await withServer(ROOT, async (req) => {
    const res = await req
      .put("/v1/files")
      .send({ content: "nope" })
      .expect(400);
    t.false(res.body.ok);
  });
});

test("PUT /v1/files returns 400 for missing content/lines", async (t) => {
  await removeFile(FILE_MISSING);
  t.teardown(() => removeFile(FILE_MISSING));
  await withServer(ROOT, async (req) => {
    const res = await req
      .put("/v1/files")
      .send({ path: FILE_MISSING })
      .expect(400);
    t.false(res.body.ok);
  });
});
