/**
 * OpenPlanner Migration System
 *
 * Manages schema migrations between versions and storage backends.
 * Supports both DuckDB and MongoDB backends.
 */

import fs from "node:fs/promises";
import path from "node:path";
import type { Db, Collection } from "mongodb";
import type { Database, Connection } from "duckdb";
import { openMongoDB, type MongoConnection, type EventDocument, type CompactedMemoryDocument } from "./mongodb.js";
import { openDuckDB, run, all, type Duck } from "./duckdb.js";

export interface MigrationContext {
  storageBackend: "duckdb" | "mongodb";
  duck?: Duck;
  mongo?: MongoConnection;
  dataDir: string;
  migrationsPath: string;
}

export interface Migration {
  id: string;
  name: string;
  description: string;
  up: (ctx: MigrationContext) => Promise<void>;
  down?: (ctx: MigrationContext) => Promise<void>;
}

/**
 * Built-in migrations.
 */
export const migrations: Migration[] = [
  // Migration 001: Initial DuckDB schema (already applied)
  {
    id: "001_duckdb_initial",
    name: "duckdb_initial",
    description: "Initial DuckDB schema with events and compacted_memories tables",
    up: async () => {
      // Already handled by openDuckDB
    },
  },

  // Migration 002: MongoDB support
  {
    id: "002_mongodb_support",
    name: "mongodb_support",
    description: "Add MongoDB as alternative storage backend",
    up: async (ctx) => {
      if (ctx.storageBackend !== "mongodb") return;

      // MongoDB indexes are created in openMongoDB
      // This is just a marker migration
    },
  },

  // Migration 003: Add perception_events collection
  {
    id: "003_perception_events",
    name: "perception_events",
    description: "Add perception_events collection for Sintel signal intake",
    up: async (ctx) => {
      if (ctx.storageBackend !== "mongodb" || !ctx.mongo) return;

      const perceptionEvents = ctx.mongo.db.collection("perception_events");
      await perceptionEvents.createIndex({ createdAt: -1 });
      await perceptionEvents.createIndex({ category: 1, createdAt: -1 });
      await perceptionEvents.createIndex({ "signal.type": 1, createdAt: -1 });
      await perceptionEvents.createIndex({ "signal.author.did": 1, createdAt: -1 });
    },
  },
];

/**
 * Load applied migrations from disk.
 */
export async function loadAppliedMigrations(dataDir: string): Promise<Set<string>> {
  const migrationsPath = path.join(dataDir, "migrations.json");
  try {
    const content = await fs.readFile(migrationsPath, "utf-8");
    const applied = JSON.parse(content);
    return new Set(applied);
  } catch {
    return new Set();
  }
}

/**
 * Save applied migrations to disk.
 */
export async function saveAppliedMigrations(dataDir: string, applied: Set<string>): Promise<void> {
  const migrationsPath = path.join(dataDir, "migrations.json");
  await fs.mkdir(path.dirname(migrationsPath), { recursive: true });
  await fs.writeFile(migrationsPath, JSON.stringify([...applied], null, 2));
}

/**
 * Run pending migrations.
 */
export async function runMigrations(ctx: MigrationContext): Promise<string[]> {
  const applied = await loadAppliedMigrations(ctx.dataDir);
  const results: string[] = [];

  for (const migration of migrations) {
    if (applied.has(migration.id)) continue;

    console.log(`[migration] Running: ${migration.id} - ${migration.name}`);
    await migration.up(ctx);
    applied.add(migration.id);
    results.push(migration.id);
  }

  await saveAppliedMigrations(ctx.dataDir, applied);
  return results;
}

/**
 * Migrate data from DuckDB to MongoDB.
 *
 * This is a one-time migration when switching from DuckDB to MongoDB.
 * Reads all events and compacted_memories from DuckDB and inserts them into MongoDB.
 */
export async function migrateDuckDBToMongoDB(
  duck: Duck,
  mongo: MongoConnection,
  options: {
    batchSize?: number;
    dryRun?: boolean;
    onProgress?: (phase: string, count: number, total?: number) => void;
  } = {}
): Promise<{ eventsCount: number; memoriesCount: number; duration: number }> {
  const batchSize = options.batchSize ?? 1000;
  const dryRun = options.dryRun ?? false;
  const startTime = Date.now();

  let eventsCount = 0;
  let memoriesCount = 0;

  // Count total records
  const [{ count: totalEvents }] = await all(duck.conn, "SELECT COUNT(*) as count FROM events");
  const [{ count: totalMemories }] = await all(duck.conn, "SELECT COUNT(*) as count FROM compacted_memories");
  const totalEventsCount = totalEvents as number;
  const totalMemoriesCount = totalMemories as number;

  console.log(`[migration] DuckDB → MongoDB: ${totalEventsCount} events, ${totalMemoriesCount} memories`);

  // Migrate events in batches
  let offset = 0;
  while (true) {
    const rows = await all(duck.conn, `
      SELECT id, ts, source, kind, project, session, message, role, author, model, tags, text, attachments, extra
      FROM events
      ORDER BY ts ASC
      LIMIT ? OFFSET ?
    `, [batchSize, offset]);

    if (rows.length === 0) break;

    if (!dryRun) {
      const docs = rows.map((row: any) => ({
        _id: row.id,
        id: row.id,
        ts: new Date(row.ts),
        source: row.source ?? "",
        kind: row.kind ?? "",
        project: row.project ?? null,
        session: row.session ?? null,
        message: row.message ?? null,
        role: row.role ?? null,
        author: row.author ?? null,
        model: row.model ?? null,
        tags: row.tags ? JSON.parse(row.tags) : null,
        text: row.text ?? null,
        attachments: row.attachments ? JSON.parse(row.attachments) : null,
        extra: row.extra ? JSON.parse(row.extra) : null,
        createdAt: new Date(row.ts),
        updatedAt: new Date(),
      }));

      await mongo.events.insertMany(docs, { ordered: false });
    }

    eventsCount += rows.length;
    offset += batchSize;
    options.onProgress?.("events", eventsCount, totalEventsCount);
    console.log(`[migration] Events: ${eventsCount}/${totalEventsCount}`);
  }

  // Migrate compacted_memories in batches
  offset = 0;
  while (true) {
    const rows = await all(duck.conn, `
      SELECT id, ts, source, kind, project, session, seed_id, member_count, char_count, embedding_model, text, members, extra
      FROM compacted_memories
      ORDER BY ts ASC
      LIMIT ? OFFSET ?
    `, [batchSize, offset]);

    if (rows.length === 0) break;

    if (!dryRun) {
      const docs = rows.map((row: any) => ({
        _id: row.id,
        id: row.id,
        ts: new Date(row.ts),
        source: row.source ?? "",
        kind: row.kind ?? "",
        project: row.project ?? null,
        session: row.session ?? null,
        seed_id: row.seed_id ?? null,
        member_count: row.member_count ?? 0,
        char_count: row.char_count ?? 0,
        embedding_model: row.embedding_model ?? null,
        text: row.text ?? "",
        members: row.members ? JSON.parse(row.members) : null,
        extra: row.extra ? JSON.parse(row.extra) : null,
        createdAt: new Date(row.ts),
        updatedAt: new Date(),
      }));

      await mongo.compacted.insertMany(docs, { ordered: false });
    }

    memoriesCount += rows.length;
    offset += batchSize;
    options.onProgress?.("memories", memoriesCount, totalMemoriesCount);
    console.log(`[migration] Memories: ${memoriesCount}/${totalMemoriesCount}`);
  }

  const duration = Date.now() - startTime;
  console.log(`[migration] Complete: ${eventsCount} events, ${memoriesCount} memories in ${(duration / 1000).toFixed(2)}s`);

  return { eventsCount, memoriesCount, duration };
}

/**
 * Export DuckDB data to JSONL files.
 */
export async function exportDuckDBToJsonl(
  duck: Duck,
  outputDir: string,
  options: {
    batchSize?: number;
    onProgress?: (phase: string, count: number) => void;
  } = {}
): Promise<{ eventsFile: string; memoriesFile: string }> {
  const batchSize = options.batchSize ?? 1000;
  await fs.mkdir(outputDir, { recursive: true });

  const eventsFile = path.join(outputDir, "events.jsonl");
  const memoriesFile = path.join(outputDir, "compacted_memories.jsonl");

  // Export events
  console.log("[export] Exporting events to JSONL...");
  const eventsStream = await fs.open(eventsFile, "w");
  let offset = 0;
  let count = 0;

  while (true) {
    const rows = await all(duck.conn, `
      SELECT id, ts, source, kind, project, session, message, role, author, model, tags, text, attachments, extra
      FROM events
      ORDER BY ts ASC
      LIMIT ? OFFSET ?
    `, [batchSize, offset]);

    if (rows.length === 0) break;

    for (const row of rows) {
      const doc = {
        id: row.id,
        ts: row.ts,
        source: row.source ?? "",
        kind: row.kind ?? "",
        project: row.project ?? null,
        session: row.session ?? null,
        message: row.message ?? null,
        role: row.role ?? null,
        author: row.author ?? null,
        model: row.model ?? null,
        tags: row.tags ? JSON.parse(row.tags) : null,
        text: row.text ?? null,
        attachments: row.attachments ? JSON.parse(row.attachments) : null,
        extra: row.extra ? JSON.parse(row.extra) : null,
      };
      await eventsStream.write(JSON.stringify(doc) + "\n");
      count++;
    }

    options.onProgress?.("events", count);
    offset += batchSize;
  }

  await eventsStream.close();
  console.log(`[export] Events: ${count} records → ${eventsFile}`);

  // Export compacted_memories
  console.log("[export] Exporting compacted_memories to JSONL...");
  const memoriesStream = await fs.open(memoriesFile, "w");
  offset = 0;
  count = 0;

  while (true) {
    const rows = await all(duck.conn, `
      SELECT id, ts, source, kind, project, session, seed_id, member_count, char_count, embedding_model, text, members, extra
      FROM compacted_memories
      ORDER BY ts ASC
      LIMIT ? OFFSET ?
    `, [batchSize, offset]);

    if (rows.length === 0) break;

    for (const row of rows) {
      const doc = {
        id: row.id,
        ts: row.ts,
        source: row.source ?? "",
        kind: row.kind ?? "",
        project: row.project ?? null,
        session: row.session ?? null,
        seed_id: row.seed_id ?? null,
        member_count: row.member_count ?? 0,
        char_count: row.char_count ?? 0,
        embedding_model: row.embedding_model ?? null,
        text: row.text ?? "",
        members: row.members ? JSON.parse(row.members) : null,
        extra: row.extra ? JSON.parse(row.extra) : null,
      };
      await memoriesStream.write(JSON.stringify(doc) + "\n");
      count++;
    }

    options.onProgress?.("memories", count);
    offset += batchSize;
  }

  await memoriesStream.close();
  console.log(`[export] Memories: ${count} records → ${memoriesFile}`);

  return { eventsFile, memoriesFile };
}