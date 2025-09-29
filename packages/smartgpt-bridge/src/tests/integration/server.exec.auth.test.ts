/* eslint-disable functional/no-try-statements, functional/immutable-data, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import path from "node:path";

import test from "ava";

import { withServer } from "../helpers/server.js";
import { captureEnv, restoreEnv } from "../helpers/env.js";

const ROOT = path.join(process.cwd(), "tests", "fixtures");

test.serial(
  "exec requires auth when enabled and allows with token",
  async (t) => {
    const prev = captureEnv([
      "AUTH_ENABLED",
      "AUTH_MODE",
      "AUTH_TOKENS",
      "EXEC_ENABLED",
      "EXEC_SHELL",
    ]);
    try {
      t.timeout(180000);
      process.env.AUTH_ENABLED = "true";
      process.env.AUTH_MODE = "static";
      process.env.AUTH_TOKENS = "secret-token";
      process.env.EXEC_ENABLED = "true";
      process.env.EXEC_SHELL = "true";

      await withServer(ROOT, async (req) => {
        // Missing token blocked
        await req
          .post("/v0/exec/run")
          .send({ command: "echo hello" })
          .expect(401);

        // With token succeeds
        const ok = await req
          .post("/v0/exec/run")
          .set("Authorization", "Bearer secret-token")
          .send({ command: "echo hello" })
          .expect(200);
        t.true(ok.body.ok);
        t.regex(String(ok.body.stdout || ""), /hello/);

        // Guard blocks dangerous command
        const blocked = await req
          .post("/v0/exec/run")
          .set("Authorization", "Bearer secret-token")
          .send({ command: "rm -rf /tmp" })
          .expect(200);
        t.false(blocked.body.ok);
        t.regex(String(blocked.body.error || ""), /blocked by guard/i);
      });
    } finally {
      restoreEnv(prev);
    }
  },
);
