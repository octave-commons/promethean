// @ts-nocheck
import test from "ava";
import path from "node:path";
import { withServer } from "../helpers/server.js";

const ROOT = path.join(process.cwd(), "src", "tests", "fixtures");

test.serial(
  "POST /exec/run returns 403 when EXEC_ENABLED is false",
  async (t) => {
    const prev = { EXEC_ENABLED: process.env.EXEC_ENABLED };
    try {
      delete process.env.EXEC_ENABLED;
      await withServer(ROOT, async (req) => {
        const res = await req
          .post("/v0/exec/run")
          .send({ command: "echo hello" })
          .expect(403);
        t.false(res.body.ok);
        t.regex(res.body.error || "", /exec disabled/i);
      });
    } finally {
      if (prev.EXEC_ENABLED === undefined) delete process.env.EXEC_ENABLED;
      else process.env.EXEC_ENABLED = prev.EXEC_ENABLED;
    }
  },
);
