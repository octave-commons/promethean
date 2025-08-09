import { Collection, Db } from "mongodb";
import { OutboxRecord, OutboxStore } from "./types";

export class MongoOutbox<T = any> implements OutboxStore<T> {
  private coll: Collection<OutboxRecord<T>>;
  constructor(db: Db, collectionName = "outbox") {
    this.coll = db.collection(collectionName);
  }
  static async ensureIndexes(db: Db, name = "outbox") {
    const c = db.collection(name);
    await c.createIndex({ status: 1, lease_until: 1 });
    await c.createIndex({ ts: 1 });
  }
  async add({
    id,
    topic,
    payload,
    headers,
  }: {
    id: string;
    topic: string;
    payload: T;
    headers?: Record<string, string>;
  }) {
    const doc: OutboxRecord<T> = {
      _id: id,
      topic,
      payload,
      headers,
      status: "pending",
      ts: Date.now(),
      attempts: 0,
    };
    await this.coll.insertOne(doc as any);
  }
  async claimBatch(
    n: number,
    leaseMs: number,
    workerId: string,
  ): Promise<OutboxRecord<T>[]> {
    const now = Date.now();
    const docs: OutboxRecord<T>[] = [];
    for (let i = 0; i < n; i++) {
      const res = await this.coll.findOneAndUpdate(
        { status: "pending" },
        {
          $set: {
            status: "claimed",
            claimed_by: workerId,
            lease_until: now + leaseMs,
          },
          $inc: { attempts: 1 },
        },
        { sort: { ts: 1 }, returnDocument: "after" },
      );
      const doc = (res as any)?.value as OutboxRecord<T> | undefined;
      if (!doc) break;
      docs.push(doc);
    }
    return docs;
  }
  async markSent(id: string) {
    await this.coll.updateOne(
      { _id: id },
      { $set: { status: "sent" }, $unset: { claimed_by: "", lease_until: "" } },
    );
  }
  async markError(id: string, err: string) {
    await this.coll.updateOne(
      { _id: id },
      {
        $set: { status: "error", last_err: err },
        $unset: { claimed_by: "", lease_until: "" },
      },
    );
  }
  async requeueExpired(now = Date.now()) {
    const res = await this.coll.updateMany(
      { status: "claimed", lease_until: { $lt: now } },
      {
        $set: { status: "pending" },
        $unset: { claimed_by: "", lease_until: "" },
      },
    );
    return res.modifiedCount ?? 0;
  }
}
