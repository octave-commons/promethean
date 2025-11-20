import type { EventStore, EventRecord, CursorPosition } from './types.js';

export class MongoEventStore implements EventStore {
  constructor(private collection: any) {}

  async insert<T>(e: EventRecord<T>): Promise<void> {
    await this.collection.insertOne(e);
  }

  async scan(
    topic: string,
    params: { afterId?: string; ts?: number; limit?: number },
  ): Promise<EventRecord[]> {
    const query: any = { topic };

    if (params.afterId) {
      query._id = { $gt: params.afterId };
    } else if (params.ts) {
      query.ts = { $gte: params.ts };
    }

    const cursor = this.collection
      .find(query)
      .sort({ ts: 1, _id: 1 })
      .limit(params.limit || 100);

    return await cursor.toArray();
  }

  async latestByKey(
    topic: string,
    keys: string[],
  ): Promise<Record<string, EventRecord | undefined>> {
    const docs = await this.collection
      .find({ topic, key: { $in: keys } })
      .sort({ ts: -1 })
      .limit(keys.length)
      .toArray();

    const result: Record<string, EventRecord | undefined> = {};
    for (const doc of docs) {
      if (doc.key) {
        result[doc.key] = doc;
      }
    }

    return result;
  }
}

export class MongoCursorStore {
  constructor(private collection: any) {}

  async get(topic: string, group: string): Promise<CursorPosition | null> {
    const doc = await this.collection.findOne({ topic, group });
    return doc || null;
  }

  async set(topic: string, group: string, cursor: CursorPosition): Promise<void> {
    await this.collection.updateOne({ topic, group }, { $set: cursor }, { upsert: true });
  }
}
