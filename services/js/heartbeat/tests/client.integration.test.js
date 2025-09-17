// integration
import test from "ava";
import { installInMemoryPersistence } from "@shared/ts/dist/test-utils/persistence.js";
import path from "path";
import { fileURLToPath } from "url";
// No real broker; use memory broker via BrokerClient memory:// scheme
import { start, stop } from "../index.js";
import { HeartbeatClient } from "../../../../shared/js/heartbeat/index.js";

let pers;
let brokerPort;

if (process.env.SKIP_NETWORK_TESTS === "1") {
  test("heartbeat client network tests skipped in sandbox", (t) => t.pass());
} else {
  test.before(async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    process.env.ECOSYSTEM_CONFIG = path.resolve(
      __dirname,
      "test-ecosystem.config.cjs",
    );
    pers = installInMemoryPersistence();
    process.env.HEARTBEAT_TIMEOUT = "1000";
    process.env.CHECK_INTERVAL = "500";
    process.env.BROKER_URL = "memory://hb";
    await start();
  });

  test.after.always(async () => {
    await stop();
    if (pers) pers.dispose();
  });

  test("heartbeat client posts pid", async (t) => {
    const url = process.env.BROKER_URL;
    const client = new HeartbeatClient({ url, pid: 999, name: "test-app" });
    await client.sendOnce();
    const mongoClient = pers.mongo;
    let doc = null;
    for (let i = 0; i < 10 && !doc; i++) {
      doc = (
        await mongoClient
          .db("heartbeat_db")
          .collection("heartbeats")
          .find()
          .toArray()
      ).find((d) => d.pid === 999);
      if (!doc) {
        await new Promise((r) => setTimeout(r, 50));
      }
    }
    t.truthy(doc);
    t.is(doc.name, "test-app");
    t.is(typeof doc.cpu, "number");
  });

  test("heartbeat client invokes callback", async (t) => {
    const url = process.env.BROKER_URL;
    await new Promise((resolve) => {
      const client = new HeartbeatClient({
        url,
        pid: 1000,
        name: "test-app",
        interval: 50,
        onHeartbeat(data) {
          t.is(data.pid, 1000);
          client.stop();
          resolve(null);
        },
      });
      client.start();
    });
  });

  test("heartbeat client requires name", (t) => {
    const url = process.env.BROKER_URL;
    const err = t.throws(() => new HeartbeatClient({ url, pid: 1 }));
    t.regex(err.message, /name required/);
  });
}
