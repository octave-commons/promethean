import test from "ava";

import { createServer } from "../index.js";

async function build() {
  const app = await createServer();
  return app;
}

test("health route responds", async (t) => {
  const app = await build();
  const res = await app.inject("/health");
  t.is(res.statusCode, 200);
});

test("diagnostics route responds", async (t) => {
  const app = await build();
  const res = await app.inject("/diagnostics");
  t.is(res.statusCode, 200);
});

test("serves existing frontend assets", async (t) => {
  const app = await build();
  const res = await app.inject("/piper/main.js");
  t.is(res.statusCode, 200);
});
