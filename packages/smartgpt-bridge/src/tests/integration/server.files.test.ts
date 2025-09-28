import path from "node:path";

import test from "ava";

import { withServer } from "../helpers/server.js";

const ROOT = path.join(process.cwd(), "tests", "fixtures");
const windowsOnlyTest = process.platform === "win32" ? test : test.skip;

test("GET /v0/files/view returns snippet", async (t) => {
  await withServer(ROOT, async (req) => {
    const res = await req
      .get("/v0/files/view")
      .query({ path: "readme.md", line: 3, context: 1 })
      .expect(200);
    t.true(res.body.ok);
    t.is(res.body.path, "readme.md");
    t.true(typeof res.body.snippet === "string");
  });
});

test("POST /grep returns match and respects flags", async (t) => {
  await withServer(ROOT, async (req) => {
    // Case-sensitive should fail for 'heading'
    const resCase = await req
      .post("/v0/grep")
      .send({ pattern: "heading", flags: "g", paths: ["**/*.md"], context: 1 })
      .expect(200);
    t.true(resCase.body.ok);
    t.true(Array.isArray(resCase.body.results));
    t.is(resCase.body.results.length, 0);

    // Case-insensitive should succeed
    const res = await req
      .post("/v0/grep")
      .send({ pattern: "heading", flags: "i", paths: ["**/*.md"], context: 1 })
      .expect(200);
    t.true(res.body.ok);
    t.true(res.body.results.length >= 1);
    t.is(res.body.results[0].path, "readme.md");

    // Context window around the match
    const m = res.body.results[0];
    t.is(m.line, 5);
    t.is(m.startLine, 4);
    t.is(m.endLine, 6);
  });
});

test("POST /stacktrace/locate resolves file:line:col", async (t) => {
  const trace = `${path.join(ROOT, "hello.ts")}:2:10`;
  await withServer(ROOT, async (req) => {
    const res = await req
      .post("/v0/stacktrace/locate")
      .send({ text: trace, context: 1 })
      .expect(200);
    t.true(res.body.ok);
    t.true(res.body.results.length >= 1);
    t.true(res.body.results[0].resolved);
    t.true(res.body.results[0].snippet.length > 0);
  });
});

windowsOnlyTest(
  "POST /stacktrace/locate resolves Windows drive paths",
  async (t) => {
    const trace = `${path.resolve(ROOT, "hello.ts")}:2:10`;
    await withServer(ROOT, async (req) => {
      const res = await req
        .post("/v0/stacktrace/locate")
        .send({ text: trace, context: 1 })
        .expect(200);
      t.true(res.body.ok);
      t.true(res.body.results.length >= 1);
      t.true(res.body.results[0].resolved);
      t.true(res.body.results[0].snippet.length > 0);
    });
  },
);

test("POST /grep invalid or missing pattern returns 400", async (t) => {
  await withServer(ROOT, async (req) => {
    const badRx = await req
      .post("/v0/grep")
      .send({ pattern: "(*invalid", paths: ["**/*.md"] })
      .expect(400);
    t.false(badRx.body.ok);
    const missing = await req.post("/v0/grep").send({}).expect(400);
    t.regex(missing.body.message || "", /pattern/);
  });
});

test("GET /files/view with missing file returns 404", async (t) => {
  await withServer(ROOT, async (req) => {
    const res = await req
      .get("/v0/files/view")
      .query({ path: "nope.md", line: 1, context: 1 })
      .expect(404);
    t.false(res.body.ok);
  });
});
