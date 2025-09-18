import test from "ava";
import { installInMemoryPersistence } from "@promethean/test-utils/persistence.js";
import { start, stop, monitor } from "../index.js";

test("monitor marks stale processes killed without OS signals (unit)", async (t) => {
  const pers = installInMemoryPersistence();
  try {
    process.env.BROKER_URL = "memory://hb-unit";
    process.env.HEARTBEAT_TIMEOUT = "100";
    process.env.CHECK_INTERVAL = "1000";
    await start();

    const now = Date.now();
    const heartbeats = pers.mongo.db("heartbeat_db").collection("heartbeats");
    await heartbeats.insertOne({
      pid: 12345,
      name: "unit",
      last: now - 200,
      sessionId: "s",
    });

    await monitor(now);

    const docs = await heartbeats.find().toArray();
    const doc = docs.find((d) => d.pid === 12345);
    t.truthy(doc?.killedAt);
  } finally {
    await stop();
  }
});
