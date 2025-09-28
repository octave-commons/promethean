import test from "ava";

import { FIXTURES_ROOT } from "../helpers/fixtures.js";
import { withServer } from "../helpers/server.js";

const ROOT = FIXTURES_ROOT;

test.serial("exec run blocks cwd outside root", async (t) => {
  const prev = { EXEC_ENABLED: process.env.EXEC_ENABLED };
  try {
    t.timeout(180000);
    process.env.EXEC_ENABLED = "true";
    await withServer(ROOT, async (req) => {
      const res = await req
        .post("/v0/exec/run")
        .send({ command: "pwd", cwd: "/" })
        .expect(200);
      t.false(res.body.ok);
      t.regex(res.body.error || "", /cwd outside root/i);
    });
  } finally {
    process.env.EXEC_ENABLED = prev.EXEC_ENABLED;
  }
});
