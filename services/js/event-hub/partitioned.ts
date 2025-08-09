import { MongoClient } from "mongodb";
import {
  MongoEventBus,
  MongoEventStore,
  MongoCursorStore,
} from "../../shared/js/prom-lib/event/mongo";
import { SchemaRegistry } from "../../shared/js/prom-lib/schema/registry";
import { withSchemaValidation } from "../../shared/js/prom-lib/schema/enforce";
import { subscribePartitioned } from "../../shared/js/prom-lib/partition/subscribe";
import { PartitionCoordinator } from "../../shared/js/prom-lib/partition/coordinator";
import { startProcessChangelog } from "../../shared/js/prom-lib/examples/process/changelog";
import { startProcessProjector } from "../../shared/js/prom-lib/examples/process/projector";
import { reg as topicSchemas } from "../../shared/js/prom-lib/schema/topics";

async function main() {
  const client = await MongoClient.connect(
    process.env.MONGO_URL || "mongodb://127.0.0.1:27017/prom",
  );
  const db = client.db();

  const rawBus = new MongoEventBus(
    new MongoEventStore(db),
    new MongoCursorStore(db),
  );
  const reg =
    topicSchemas instanceof SchemaRegistry
      ? topicSchemas
      : new SchemaRegistry();
  const bus = withSchemaValidation(rawBus, reg);

  await startProcessProjector(bus);
  await startProcessChangelog(db, bus);

  const coord = new PartitionCoordinator({ ttlMs: 10_000 });
  const memberId = `worker-${Math.random().toString(16).slice(2)}`;

  await subscribePartitioned(
    bus,
    "process.state",
    async (e) => {
      void e;
    },
    coord,
    { group: "analyzers", memberId, partitions: 8, rebalanceEveryMs: 2500 },
  );

  console.log("[partitioned] up");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
