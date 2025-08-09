import { MongoClient } from "mongodb";
import {
  MongoEventBus,
  MongoEventStore,
  MongoCursorStore,
} from "../../shared/js/prom-lib/event/mongo";
import { withDualWrite } from "../../shared/js/prom-lib/schema/dualwrite";
import { SchemaRegistry } from "../../shared/js/prom-lib/schema/registry";
import { reg as topicSchemas } from "../../shared/js/prom-lib/schema/topics";
import { UpcastChain } from "../../shared/js/prom-lib/schema/upcast";
import { withDLQ } from "../../shared/js/prom-lib/dlq/subscribe";
import { startMongoChangefeed } from "../../shared/js/prom-lib/changefeed/mongo";
import { tokenStore } from "../../shared/js/prom-lib/changefeed/resume.mongo";

async function main() {
  const client = await MongoClient.connect(
    process.env.MONGO_URL || "mongodb://127.0.0.1:27017/prom",
  );
  const db = client.db();

  const store = new MongoEventStore(db);
  const rawBus = new MongoEventBus(store, new MongoCursorStore(db));

  // schema registry + upcasters
  const reg = topicSchemas as SchemaRegistry;
  const up = new UpcastChain();
  // example upcaster: heartbeat v1 -> v2 rename mem_mb->mem_mib
  up.add("heartbeat.received", 1, (e) => {
    const p: any = e.payload;
    return {
      ...e,
      payload: { ...p, mem_mib: p.mem_mb, mem_mb: undefined },
      headers: { ...(e.headers || {}), "x-upcasted-from": "1" },
    };
  });

  const bus = withDualWrite(rawBus, reg);

  // consumer with normalize + DLQ
  const subscribeWithDLQ = withDLQ(bus, {
    group: "hb-consumers",
    maxAttempts: 3,
  });
  await subscribeWithDLQ(
    "heartbeat.received",
    async (e) => {
      const norm = up.toLatest("heartbeat.received", e, reg);
      reg.validate("heartbeat.received", norm.payload);
      // ... handle ...
    },
    { from: "earliest" },
  );

  // changefeed: mirror 'processes' collection -> topic 'processes.changed'
  await startMongoChangefeed(db, bus, {
    collection: "processes",
    topic: "processes.changed",
    fullDocument: "updateLookup",
    resumeTokenStore: tokenStore(db, "cf:processes"),
    map: (doc) => ({ id: String(doc._id), ...doc }),
  });

  console.log("[evolve] up");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
