import type { Db, ClientSession } from "mongodb";
import type { EventBus, EventRecord } from "../event/types";

export interface TxnProjectorOpts<E = any> {
  topic: string;
  group: string;
  handler: (e: EventRecord<E>, db: Db, s: ClientSession) => Promise<void>;
  from?: "earliest" | "latest";
  retries?: number;
}

export async function startTransactionalProjector<E = any>(
  bus: EventBus,
  db: Db,
  opts: TxnProjectorOpts<E>,
) {
  const from = opts.from ?? "earliest";
  const retries = opts.retries ?? 3;

  return bus.subscribe(
    opts.topic,
    opts.group,
    async (e) => {
      for (let i = 0; i <= retries; i++) {
        const s = db.client.startSession();
        try {
          await s.withTransaction(
            async () => {
              await opts.handler(e, db, s);
            },
            { writeConcern: { w: "majority" } },
          );
          // success → exit retry loop
          return;
        } catch (err) {
          if (i === retries) throw err;
          await new Promise((r) => setTimeout(r, 100 * (i + 1)));
        } finally {
          await s.endSession();
        }
      }
    },
    { from, manualAck: false, batchSize: 200 },
  );
}
