import { fileURLToPath } from "node:url";

import test from "ava";

import { withServer } from "../helpers/server.js";

const ROOT = fileURLToPath(new URL("../../../tests/fixtures", import.meta.url));

test("GET /v1/files/ returns flat file list", async (t) => {
  await withServer(ROOT, async (req) => {
    const res = await req.get("/v1/files/").expect(200);
    t.true(res.body.ok);
    t.true(Array.isArray(res.body.entries));
  });
});

test("GET /v1/files/?tree=true returns directory tree", async (t) => {
  await withServer(ROOT, async (req) => {
    const res = await req
      .get("/v1/files/")
      .query({ tree: true, depth: 2 })
      .expect(200);
    t.true(res.body.ok);
    t.truthy(res.body.tree);
    t.is(res.body.base, ".");
  });
});

test("GET /v1/files/readme.md returns file snippet", async (t) => {
  await withServer(ROOT, async (req) => {
    const res = await req
      .get("/v1/files/readme.md")
      .query({ line: 3, context: 1 })
      .expect(200);
    t.true(res.body.ok);
    t.is(res.body.path, "readme.md");
    t.true(typeof res.body.snippet === "string");
  });
});

test.serial("POST /v1/exec/run uses stubbed runner", async (t) => {
  const prev = { EXEC_ENABLED: process.env.EXEC_ENABLED };
  try {
    t.timeout(180000);
    process.env.EXEC_ENABLED = "true";
    await withServer(ROOT, async (req) => {
      const ok = await req
        .post("/v1/exec/run")
        .send({ command: "echo hello" })
        .expect(200);
      t.true(ok.body.ok);
      t.is(ok.body.stdout, "hello");

      const blocked = await req
        .post("/v1/exec/run")
        .send({ command: "rm -rf /tmp" })
        .expect(200);
      t.false(blocked.body.ok);
      t.regex(blocked.body.error || "", /blocked by guard/i);
    });
  } finally {
    if (prev.EXEC_ENABLED === undefined) delete process.env.EXEC_ENABLED;
    else process.env.EXEC_ENABLED = prev.EXEC_ENABLED;
  }
});
