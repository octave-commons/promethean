import test from "ava";
import express from "express";
import request from "supertest";
import { start, stop } from "../index.js";

let backendServer;
let proxy;

test.before(async () => {
  const app = express();
  app.get("/hello", (req, res) => res.json({ ok: true }));
  backendServer = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = backendServer.address().port;
  proxy = await start(0, { "/api": `http://127.0.0.1:${port}` });
});

test.after.always(async () => {
  if (backendServer) await new Promise((r) => backendServer.close(r));
  await stop();
});

test("proxies requests", async (t) => {
  const res = await request(proxy).get("/api/hello").expect(200);
  t.deepEqual(res.body, { ok: true });
});
