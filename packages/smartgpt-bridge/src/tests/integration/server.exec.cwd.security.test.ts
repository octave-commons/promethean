/* eslint-disable functional/no-try-statements, functional/immutable-data, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import path from "node:path";

import test from "ava";

import { withServer } from "../helpers/server.js";
import { captureEnv, restoreEnv } from "../helpers/env.js";

const ROOT = path.join(process.cwd(), "tests", "fixtures");

test.serial("exec run blocks cwd outside root", async (t) => {
  const prev = captureEnv(["EXEC_ENABLED"]);
  try {
    t.timeout(180000);
    process.env.EXEC_ENABLED = "true";
    await withServer(ROOT, async (req) => {
      const res = await req
        .post("/v0/exec/run")
        .send({ command: "pwd", cwd: "/" })
        .expect(200);
      t.false(res.body.ok);
      t.regex(String(res.body.error || ""), /cwd outside root/i);
    });
  } finally {
    restoreEnv(prev);
  }
});
