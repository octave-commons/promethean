/* eslint-disable functional/no-try-statements, functional/immutable-data, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import path from "node:path";

import test from "ava";

import { withServer } from "../helpers/server.js";
import { captureEnv, restoreEnv } from "../helpers/env.js";

const ROOT = path.join(process.cwd(), "tests", "fixtures");

test.serial("openapi shows bearer security when auth enabled", async (t) => {
  const prev = captureEnv(["AUTH_ENABLED", "AUTH_MODE", "OPENAPI_PUBLIC"]);
  process.env.AUTH_ENABLED = "true";
  process.env.AUTH_MODE = "static";
  process.env.OPENAPI_PUBLIC = "true";
  try {
    t.timeout(180000);
    await withServer(ROOT, async (req) => {
      const res = await req.get("/openapi.json").expect(200);
      t.truthy(res.body.components?.securitySchemes?.bearerAuth);
      t.true(Array.isArray(res.body.security));
      t.deepEqual(res.body.security, [{ bearerAuth: [] }]);
    });
  } finally {
    restoreEnv(prev);
  }
});

test.serial("/auth/me requires valid token when enabled", async (t) => {
  const prev = captureEnv(["AUTH_ENABLED", "AUTH_MODE"]);
  process.env.AUTH_ENABLED = "true";
  process.env.AUTH_MODE = "static";
  try {
    t.timeout(180000);
    await withServer(ROOT, async (req) => {
      await req.get("/auth/me").expect(401);
      const res = await req
        .get("/auth/me")
        .set("Authorization", "Bearer secret")
        .expect(401);
      t.false(res.body.ok);
    });
  } finally {
    restoreEnv(prev);
  }
});

test.serial("/auth/me enforces per-IP rate limiting", async (t) => {
  const prev = captureEnv(["AUTH_ENABLED", "AUTH_MODE", "AUTH_TOKEN", "AUTH_TOKENS"]);
  process.env.AUTH_ENABLED = "true";
  process.env.AUTH_MODE = "static";
  process.env.AUTH_TOKEN = "secret";
  delete process.env.AUTH_TOKENS;
  try {
    t.timeout(180000);
    await withServer(ROOT, async (req) => {
      for (let i = 0; i < 10; i++) {
        const res = await req
          .get("/auth/me")
          .set("Authorization", "Bearer secret")
          .expect(200);
        t.true(res.body.ok);
      }
      const limited = await req
        .get("/auth/me")
        .set("Authorization", "Bearer secret")
        .expect(429);
      t.is(limited.status, 429);
    });
  } finally {
    restoreEnv(prev);
  }
});
