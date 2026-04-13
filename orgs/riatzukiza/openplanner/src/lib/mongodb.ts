/**
 * MongoDB Storage Backend for OpenPlanner
 *
 * Provides the same interface as DuckDB but with MongoDB as the storage layer.
 * Enables horizontal scaling, better JSON handling, and real-time subscriptions.
 *
 * TTL Indexes:
 *   - Events can auto-expire after a configurable retention period
 *   - Set MONGODB_EVENTS_TTL_SECONDS=2592000 (30 days) to enable
 *   - Set to 0 or omit to disable TTL
 */

import { MongoClient, Db, Collection, IndexDirection } from "mongodb";

// Default TTL: 30 days in seconds (disabled if 0)
const DEFAULT_EVENTS_TTL_SECONDS = 0;
// Compact memories: 90 days default (they're summarized, so keep longer)
const DEFAULT_COMPACTED_TTL_SECONDS = 0;

export interface MongoConfig {
  uri: string;
  dbName: string;
  eventsCollection: string;
  compactedCollection: string;
  /** TTL for events in seconds (0 = no TTL) */
  eventsTtlSeconds?: number;
  /** TTL for compacted memories in seconds (0 = no TTL) */
  compactedTtlSeconds?: number;
}

export interface EventDocument {
  _id: string;
  id: string;
  ts: Date;
  source: string;
  kind: string;
  project: string | null;
  session: string | null;
  message: string | null;
  role: string | null;
  author: string | null;
  model: string | null;
  tags: unknown | null;
  text: string | null;
  attachments: unknown[] | null;
  extra: unknown | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompactedMemoryDocument {
  _id: string;
  id: string;
  ts: Date;
  source: string;
  kind: string;
  project: string | null;
  session: string | null;
  seed_id: string | null;
  member_count: number;
  char_count: number;
  embedding_model: string | null;
  text: string;
  members: unknown[] | null;
  extra: unknown | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoConnection {
  client: MongoClient;
  db: Db;
  events: Collection<EventDocument>;
  compacted: Collection<CompactedMemoryDocument>;
  ftsEnabled: boolean; // MongoDB has text search, always true
}

/**
 * Connect to MongoDB and create indexes.
 */
export async function openMongoDB(config: MongoConfig): Promise<MongoConnection> {
  const client = new MongoClient(config.uri, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    maxPoolSize: 50,
  });

  await client.connect();
  const db = client.db(config.dbName);

  const events = db.collection<EventDocument>(config.eventsCollection);
  const compacted = db.collection<CompactedMemoryDocument>(config.compactedCollection);

  // Create indexes for events
  await events.createIndex({ ts: -1 });
  await events.createIndex({ source: 1, ts: -1 });
  await events.createIndex({ kind: 1, ts: -1 });
  await events.createIndex({ project: 1, ts: -1 });
  await events.createIndex({ session: 1, ts: -1 });
  await events.createIndex({ "text": "text" }); // Full-text search index

  // Create indexes for compacted_memories
  await compacted.createIndex({ ts: -1 });
  await compacted.createIndex({ source: 1, ts: -1 });
  await compacted.createIndex({ kind: 1, ts: -1 });
  await compacted.createIndex({ project: 1, ts: -1 });
  await compacted.createIndex({ "text": "text" }); // Full-text search index

  // TTL index for events (auto-expire old signals)
  const eventsTtl = config.eventsTtlSeconds ?? DEFAULT_EVENTS_TTL_SECONDS;
  if (eventsTtl > 0) {
    // Use createdAt field for TTL - documents expire after N seconds from creation
    await events.createIndex(
      { createdAt: 1 },
      { 
        expireAfterSeconds: eventsTtl,
        name: "events_ttl",
        background: true,
      }
    );
    console.log(`[mongodb] Created TTL index on events (expireAfterSeconds: ${eventsTtl})`);
  }

  // TTL index for compacted_memories (longer retention, optional)
  const compactedTtl = config.compactedTtlSeconds ?? DEFAULT_COMPACTED_TTL_SECONDS;
  if (compactedTtl > 0) {
    await compacted.createIndex(
      { createdAt: 1 },
      { 
        expireAfterSeconds: compactedTtl,
        name: "compacted_ttl",
        background: true,
      }
    );
    console.log(`[mongodb] Created TTL index on compacted_memories (expireAfterSeconds: ${compactedTtl})`);
  }

  return {
    client,
    db,
    events,
    compacted,
    ftsEnabled: true, // MongoDB always has text search
  };
}

/**
 * Close MongoDB connection.
 */
export async function closeMongoDB(conn: MongoConnection): Promise<void> {
  await conn.client.close();
}

/**
 * Insert or update an event.
 */
export async function upsertEvent(
  collection: Collection<EventDocument>,
  event: Omit<EventDocument, "_id" | "createdAt" | "updatedAt">
): Promise<void> {
  const now = new Date();
  await collection.updateOne(
    { _id: event.id },
    {
      $set: {
        ...event,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  );
}

/**
 * Insert or update a compacted memory.
 */
export async function upsertCompactedMemory(
  collection: Collection<CompactedMemoryDocument>,
  memory: Omit<CompactedMemoryDocument, "_id" | "createdAt" | "updatedAt">
): Promise<void> {
  const now = new Date();
  await collection.updateOne(
    { _id: memory.id },
    {
      $set: {
        ...memory,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  );
}

/**
 * Full-text search on events.
 */
export async function ftsSearch(
  collection: Collection<EventDocument>,
  query: string,
  options: {
    limit?: number;
    source?: string;
    kind?: string;
    project?: string;
    session?: string;
    visibility?: string;
  } = {}
): Promise<unknown[]> {
  const limit = options.limit ?? 20;
  const filter: Record<string, unknown> = {
    $text: { $search: query },
  };

  if (options.source) filter.source = options.source;
  if (options.kind) filter.kind = options.kind;
  if (options.project) filter.project = options.project;
  if (options.session) filter.session = options.session;
  if (options.visibility) filter["extra.visibility"] = options.visibility;

  const results = await collection
    .find(filter, {
      projection: {
        id: 1,
        ts: 1,
        source: 1,
        kind: 1,
        project: 1,
        session: 1,
        message: 1,
        role: 1,
        model: 1,
        text: { $substr: ["$text", 0, 240] },
      },
    })
    .sort({ ts: -1 })
    .limit(limit)
    .toArray();

  return results.map((r) => ({
    ...r,
    snippet: r.text,
    tier: "hot",
  }));
}

/**
 * ILIKE-style search (case-insensitive substring match).
 */
export async function ilikeSearch(
  collection: Collection<EventDocument>,
  query: string,
  options: {
    limit?: number;
    source?: string;
    kind?: string;
    project?: string;
    session?: string;
    visibility?: string;
  } = {}
): Promise<unknown[]> {
  const limit = options.limit ?? 20;
  const filter: Record<string, unknown> = {
    text: { $regex: query, $options: "i" },
  };

  if (options.source) filter.source = options.source;
  if (options.kind) filter.kind = options.kind;
  if (options.project) filter.project = options.project;
  if (options.session) filter.session = options.session;
  if (options.visibility) filter["extra.visibility"] = options.visibility;

  const results = await collection
    .find(filter, {
      projection: {
        id: 1,
        ts: 1,
        source: 1,
        kind: 1,
        project: 1,
        session: 1,
        message: 1,
        role: 1,
        model: 1,
        text: { $substr: ["$text", 0, 240] },
      },
    })
    .sort({ ts: -1 })
    .limit(limit)
    .toArray();

  return results.map((r) => ({
    ...r,
    snippet: r.text,
    tier: "hot",
  }));
}
