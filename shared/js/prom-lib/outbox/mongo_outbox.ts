import { Collection } from "mongodb";
import { BusClient } from "../bus/client";

export interface OutboxRow {
  _id: string;
  topic: string;
  key?: string;
  headers?: Record<string, string>;
  payload: any;
  createdTs: number;
  sentTs?: number;
  attempts?: number;
}

export async function drainOutbox(
  col: Collection<OutboxRow>,
  bus: BusClient,
  { batch = 100, maxAttempts = 10 } = {},
) {
  const rows = await col
    .find({
      $or: [{ sentTs: { $exists: false } }, { attempts: { $lt: maxAttempts } }],
    })
    .limit(batch)
    .toArray();
  for (const r of rows) {
    try {
      bus.publish(r.topic, r.payload, r.key, r.headers);
      await col.updateOne(
        { _id: r._id },
        { $set: { sentTs: Date.now() }, $inc: { attempts: 1 } },
      );
    } catch {
      await col.updateOne({ _id: r._id }, { $inc: { attempts: 1 } });
    }
  }
}
