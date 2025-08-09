import type { Db, Collection } from "mongodb";
import type { EventBus, EventRecord } from "../event/types";

export interface ChangelogOpts<T = any> {
  topic: string;
  collection: string;
  keyOf: (event: EventRecord<T>) => string;
  map: (event: EventRecord<T>) => Record<string, any>;
  tombstone?: (event: EventRecord<T>) => boolean;
  indexes?: { keys: Record<string, 1 | -1>; unique?: boolean }[];
  versionOf?: (event: EventRecord<T>) => number | undefined;
}

export async function startChangelogProjector<T>(
  db: Db,
  bus: EventBus,
  opts: ChangelogOpts<T>,
) {
  const coll: Collection = db.collection(opts.collection);
  await coll.createIndex({ _key: 1 }, { unique: true });
  for (const idx of opts.indexes ?? [])
    await coll.createIndex(idx.keys as any, { unique: !!idx.unique });

  const isTomb = (e: EventRecord<any>) => {
    const p = e.payload as any;
    return p == null || p?._deleted === true || opts.tombstone?.(e) === true;
  };

  async function handle(e: EventRecord<T>) {
    const _key = opts.keyOf(e);
    if (!_key) return;

    if (isTomb(e)) {
      await coll.deleteOne({ _key });
      return;
    }

    const base = opts.map(e);
    const version = opts.versionOf?.(e);
    if (version != null) {
      await coll.updateOne(
        { _key, $or: [{ _v: { $lt: version } }, { _v: { $exists: false } }] },
        { $set: { ...base, _key, _v: version, _ts: e.ts } },
        { upsert: true },
      );
    } else {
      await coll.updateOne(
        { _key },
        { $set: { ...base, _key, _ts: e.ts } },
        { upsert: true },
      );
    }
  }

  const stop = await bus.subscribe(
    opts.topic,
    `changelog:${opts.collection}`,
    async (e) => {
      await handle(e as EventRecord<T>);
    },
    { from: "earliest", batchSize: 500, manualAck: false },
  );

  return stop;
}
