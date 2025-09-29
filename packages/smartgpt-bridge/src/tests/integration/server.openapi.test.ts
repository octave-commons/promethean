import path from "node:path";

import test from "ava";

import { withServer } from "../helpers/server.js";

const ROOT = path.join(process.cwd(), "tests", "fixtures");

test("GET /openapi.json includes servers, schemas, and paths", async (t) => {
  const prev = process.env.PUBLIC_BASE_URL;
  process.env.PUBLIC_BASE_URL = "https://funnel.example.ts.net";
  try {
    t.timeout(180000);
    await withServer(ROOT, async (req) => {
      const res = await req.get("/openapi.json").expect(200);
      t.is(res.body.openapi, "3.1.0");
      t.truthy(res.body.components?.schemas?.GrepRequest);
      t.true(Array.isArray(res.body.servers));
      t.is(res.body.servers[0].url, process.env.PUBLIC_BASE_URL);
      t.truthy(res.body.paths?.["/v0/grep"]?.post);
    });
  } finally {
    if (prev === undefined) delete process.env.PUBLIC_BASE_URL;
    else process.env.PUBLIC_BASE_URL = prev;
  }
});
