// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
import test from "ava";
import path from "node:path";
import { withServer } from "../helpers/server.js";

const ROOT = path.join(process.cwd(), "src", "tests", "fixtures");

test.serial("auth disabled by default allows access", async (t) => {
  delete process.env.AUTH_ENABLED;
  await withServer(ROOT, async (req) => {
    const res = await req
      .get("/v0/files/view")
      .query({ path: "readme.md", line: 1, context: 1 })
      .expect(200);
    t.true(res.body.ok);
  });
});

test.serial("auth static token blocks/permits access", async (t) => {
  const prev = {
    AUTH_ENABLED: process.env.AUTH_ENABLED,
    AUTH_MODE: process.env.AUTH_MODE,
    AUTH_TOKENS: process.env.AUTH_TOKENS,
  };
  try {
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
    process.env.AUTH_ENABLED = prev.AUTH_ENABLED;
    process.env.AUTH_MODE = prev.AUTH_MODE;
    process.env.AUTH_TOKENS = prev.AUTH_TOKENS;
  }
});
