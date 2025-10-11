import { ObjectId, Collection } from 'mongodb';
import { AGENT_NAME } from '@promethean/legacy/env.js';
import { HeartbeatClient } from '@promethean/legacy/heartbeat/index.js';
import { ContextStore, getMongoClient } from '@promethean/persistence';

// Schema for raw discord messages awaiting embedding
type DiscordMessage = {
  _id: ObjectId;
  created_at: number;
  author: number;
  channel: number;
  channel_name: string;
  author_name: string;
  content: string | null;
  embedding_status?: Record<string, 'processing' | 'done' | 'error'>;
};

const EMBED_VERSION = process.env.EMBED_VERSION || new Date().toISOString().slice(0, 10);
const EMBEDDING_DRIVER = process.env.EMBEDDING_DRIVER || 'ollama';
const EMBEDDING_FUNCTION = process.env.EMBEDDING_FUNCTION || 'nomic-embed-text';
const EMBED_DIMS = Number(process.env.EMBED_DIMS || 768);

(async () => {
  const hb = new HeartbeatClient();
  await hb.sendOnce().catch(() => process.exit(1));
  hb.start();

  const mongoClient = await getMongoClient();
  const db = mongoClient.db('database');

  const family = `${AGENT_NAME}_discord_messages`;
  const discordMessagesCollection: Collection<DiscordMessage> = db.collection(family);

  // dual store + context manager
  const ctxStore = new ContextStore();
  const store = await ctxStore.createCollection('discord_messages', 'content', 'created_at');

  await discordMessagesCollection.createIndex({
    [`embedding_status.${EMBED_VERSION}`]: 1,
    content: 1,
  });

  while (true) {
    await new Promise((res) => setTimeout(res, 1000));

    const messages = (await discordMessagesCollection
      .find({
        [`embedding_status.${EMBED_VERSION}`]: { $ne: 'done' },
        content: { $nin: [null, ''], $not: /^\s*$/ },
      })
      .limit(100)
      .toArray()) as Array<DiscordMessage & { content: string }>;

    if (messages.length === 0) {
      console.log(`[${family}] No pending for version ${EMBED_VERSION}. Sleeping 1 minute…`);
      await new Promise((res) => setTimeout(res, 60_000));
      continue;
    }

    const ids = messages.map((m) => m._id);
    console.log(`Embedding ${messages.length} messages → ${store.name}`);

    await discordMessagesCollection.updateMany(
      { _id: { $in: ids } },
      { $set: { [`embedding_status.${EMBED_VERSION}`]: 'processing' } },
    );

    try {
      for (const m of messages) {
        await store.addEntry({
          id: m._id.toHexString(),
          content: m.content || '',
          created_at: new Date(m.created_at).toISOString(),
          metadata: {
            timeStamp: new Date(m.created_at).toISOString(),
            userName: m.author_name,
            version: EMBED_VERSION,
            driver: EMBEDDING_DRIVER,
            fn: EMBEDDING_FUNCTION,
            dims: EMBED_DIMS,
          },
        } as any);
      }

      await discordMessagesCollection.updateMany(
        { _id: { $in: ids } },
        { $set: { [`embedding_status.${EMBED_VERSION}`]: 'done' } },
      );
    } catch (e) {
      console.error('Upsert failed', e);
      await discordMessagesCollection.updateMany(
        { _id: { $in: ids } },
        { $set: { [`embedding_status.${EMBED_VERSION}`]: 'error' } },
      );
    }
  }
})();
