// @ts-nocheck
import test from "ava";
import fs from "node:fs/promises";
import path from "node:path";
import { withServer } from "../helpers/server.js";

const ROOT = path.join(process.cwd(), "src", "tests", "fixtures");
const TEST_FILE = "putfile.test.txt";
const TEST_PATH = path.join(ROOT, TEST_FILE);

// Clean up before/after
async function cleanup() {
  try {
    await fs.unlink(TEST_PATH);
  } catch {}
}

test.beforeEach(cleanup);
test.afterEach.always(cleanup);

test("PUT /v1/files writes full file", async (t) => {
  await withServer(ROOT, async (req) => {
    const content = "hello\nworld";
    const res = await req
      .put("/v1/files")
      .send({ path: TEST_FILE, content })
      .expect(200);
    t.true(res.body.ok);
    const file = await fs.readFile(TEST_PATH, "utf8");
    t.is(file, content);
  });
});

test("PUT /v1/files edits specific lines", async (t) => {
  await fs.writeFile(TEST_PATH, "a\nb\nc\nd\ne", "utf8");
  await withServer(ROOT, async (req) => {
    const res = await req
      .put("/v1/files")
      .send({ path: TEST_FILE, lines: ["X", "Y"], startLine: 2 })
      .expect(200);
    t.true(res.body.ok);
    const file = await fs.readFile(TEST_PATH, "utf8");
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
  await withServer(ROOT, async (req) => {
    const res = await req
      .put("/v1/files")
      .send({ path: TEST_FILE })
      .expect(400);
    t.false(res.body.ok);
  });
});
