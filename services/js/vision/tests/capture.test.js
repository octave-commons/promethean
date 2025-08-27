import test from "ava";
import request from "supertest";

process.env.NODE_ENV = "test";
import { app, setCaptureFn, stop } from "../index.js";

test.after.always(async () => {
  await stop();
});

test("capture endpoint returns png buffer", async (t) => {
  const fake = Buffer.from("fake");
  setCaptureFn(async () => fake);
  const res = await request(app).get("/capture");
  t.is(res.status, 200);
  t.is(res.headers["content-type"], "image/png");
  t.true(Buffer.compare(res.body, fake) === 0);
});
