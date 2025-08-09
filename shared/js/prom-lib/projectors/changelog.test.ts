import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { InMemoryEventBus } from "../event/memory";
import { startChangelogProjector } from "./changelog";

test.skip("changelog projector upserts and tombstones", async () => {
  const m = await MongoMemoryServer.create();
  const uri = m.getUri();
  const client = await MongoClient.connect(uri);
  const db = client.db("test");
  const bus = new InMemoryEventBus();

  await startChangelogProjector(db, bus, {
    topic: "t",
    collection: "c",
    keyOf: (e) => String(e.key),
    map: (e) => ({ value: (e.payload as any).value }),
  });

  await bus.publish("t", { value: 1 }, { key: "a" });
  await new Promise((r) => setTimeout(r, 50));
  let doc = await db.collection("c").findOne({ _key: "a" });
  expect(doc?.value).toBe(1);

  await bus.publish("t", null, { key: "a" });
  await new Promise((r) => setTimeout(r, 50));
  doc = await db.collection("c").findOne({ _key: "a" });
  expect(doc).toBeNull();

  await client.close();
  await m.stop();
}, 20000);
