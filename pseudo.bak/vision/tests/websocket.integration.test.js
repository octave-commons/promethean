// integration
import test from "ava";
import { WebSocket } from "ws";
import { start, setCaptureFn, stop } from "../index.js";

let server;

test.before(async () => {
  process.env.NODE_ENV = "test";
  setCaptureFn(async () => Buffer.from("fake"));
  server = await start(0);
});

test.after.always(async () => {
  await stop();
});

test("capture via websocket", async (t) => {
  const port = server.address().port;
  const ws = new WebSocket(`ws://127.0.0.1:${port}/capture`);
  const data = await new Promise((resolve, reject) => {
    ws.on("open", () => ws.send("go"));
    ws.on("message", (msg) => resolve(msg));
    ws.on("error", reject);
  });
  t.true(Buffer.compare(data, Buffer.from("fake")) === 0);
  await new Promise((resolve) => {
    ws.on("close", resolve);
    ws.close();
  });
});
