import { Collection, Db, MongoClient } from "mongodb";
import { EventRow, GroupOffset, TopicConfig } from "../types";

export class MongoStorage {
  private events!: Collection<EventRow>;
  private counters!: Collection<{ _id: string; nextOffset: number }>;
  private offsets!: Collection<GroupOffset>;
  private topicConfigs!: Collection<TopicConfig>;

  constructor(private db: Db) {}

  static async connect(url: string, dbName: string) {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const store = new MongoStorage(db);
    await store.init();
    return store;
  }

  async init() {
    this.events = this.db.collection("events");
    this.counters = this.db.collection("counters");
    this.offsets = this.db.collection("group_offsets");
    this.topicConfigs = this.db.collection("topic_configs");
    await this.events.createIndex(
      { topic: 1, partition: 1, offset: 1 },
      { unique: true },
    );
    await this.events.createIndex({ topic: 1, partition: 1, ts: 1 });
    await this.offsets.createIndex(
      { topic: 1, partition: 1, group: 1 },
      { unique: true },
    );
  }

  async getConfig(topic: string): Promise<TopicConfig> {
    return (
      (await this.topicConfigs.findOne({ topic })) || { topic, partitions: 1 }
    );
  }

  async nextOffset(topic: string, partition: number): Promise<number> {
    const id = `${topic}:${partition}`;
    const res = await this.counters.findOneAndUpdate(
      { _id: id },
      { $inc: { nextOffset: 1 } },
      { upsert: true, returnDocument: "after" },
    );
    return (res as any)?.value?.nextOffset ?? (res as any)?.nextOffset ?? 0;
  }

  async insertEvent(row: EventRow) {
    await this.events.insertOne(row);
  }

  async readFrom(
    topic: string,
    partition: number,
    offset: number,
    limit: number,
  ) {
    return await this.events
      .find({ topic, partition, offset: { $gte: offset } })
      .sort({ offset: 1 })
      .limit(limit)
      .toArray();
  }

  async committed(
    topic: string,
    partition: number,
    group: string,
  ): Promise<number> {
    const g = await this.offsets.findOne({ topic, partition, group });
    return g?.lastCommitted ?? 0;
  }

  async commit(
    topic: string,
    partition: number,
    group: string,
    offset: number,
  ) {
    await this.offsets.updateOne(
      { topic, partition, group },
      { $max: { lastCommitted: offset }, $set: { updatedTs: Date.now() } },
      { upsert: true },
    );
  }
}
