import test from "ava";

import { runJSFunction } from "../fsutils.js";

test("runJSFunction restores globals on timeout", async (t) => {
  const origStdout = process.stdout.write;
  const origStderr = process.stderr.write;
  const origEnv = process.env.TEST_VAR;
  const fn = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  };
  const res = await runJSFunction(fn, {}, { TEST_VAR: "changed" }, 10);
  t.is(res.code, 124);
  t.is(process.stdout.write, origStdout);
  t.is(process.stderr.write, origStderr);
  t.is(process.env.TEST_VAR, origEnv);
});
