/* eslint-disable functional/no-try-statements, functional/immutable-data, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import path from "node:path";

import test from "ava";

import { withServer } from "../helpers/server.js";
import { captureEnv, restoreEnv } from "../helpers/env.js";

const ROOT = path.join(process.cwd(), "tests", "fixtures");

test.serial("auth disabled by default allows access", async (t) => {
  t.timeout(180000);
  const prev = captureEnv(["AUTH_ENABLED"]);
  try {
    delete process.env.AUTH_ENABLED;
    await withServer(ROOT, async (req) => {
      const res = await req
        .get("/v0/files/view")
        .query({ path: "readme.md", line: 1, context: 1 })
        .expect(200);
      t.true(res.body.ok);
    });
  } finally {
    restoreEnv(prev);
  }
});

test.serial("auth static token blocks/permits access", async (t) => {
  const prev = captureEnv(["AUTH_ENABLED", "AUTH_MODE", "AUTH_TOKENS"]);
  try {
    t.timeout(180000);
    process.env.AUTH_ENABLED = "true";
    process.env.AUTH_MODE = "static";
    process.env.AUTH_TOKENS = "secret-token";

    await withServer(ROOT, async (req) => {
      await req
        .get("/v0/files/view")
        .query({ path: "readme.md", line: 1, context: 1 })
        .expect(401);

      const ok = await req
        .get("/v0/files/view")
        .set("Authorization", "Bearer secret-token")
        .query({ path: "readme.md", line: 1, context: 1 })
        .expect(200);
      t.true(ok.body.ok);
    });
  } finally {
    restoreEnv(prev);
  }
});
