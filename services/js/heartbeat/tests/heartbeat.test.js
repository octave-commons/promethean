import test from "ava";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { spawn } from "child_process";
import { start, stop } from "../index.js";

let server;
let mongo;

test.before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URL = mongo.getUri();
  process.env.HEARTBEAT_TIMEOUT = "100";
  process.env.CHECK_INTERVAL = "50";
  server = await start(0);
});

test.after.always(async () => {
  await stop();
  if (mongo) await mongo.stop();
});

test("stale process is killed", async (t) => {
  const child = spawn("node", ["-e", "setInterval(()=>{},1000)"]);
  t.teardown(() => {
    if (!child.killed) {
      try {
        child.kill();
      } catch {}
    }
  });
  await request(server).post("/heartbeat").send({ pid: child.pid });
  const exit = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("not killed")), 2000);
    child.on("exit", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal });
    });
  });
  t.is(exit.signal, "SIGKILL");
});
