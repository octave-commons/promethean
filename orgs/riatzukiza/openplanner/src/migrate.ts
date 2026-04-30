#!/usr/bin/env node
/**
 * OpenPlanner Migration CLI
 *
 * Commands:
 *   node dist/migrate.js status            - Show migration status
 *   node dist/migrate.js run               - Run pending migrations
 *   node dist/migrate.js duckdb-to-mongo   - Migrate DuckDB data to MongoDB
 *   node dist/migrate.js export-jsonl      - Export DuckDB data to JSONL
 *
 * Environment:
 *   OPENPLANNER_DATA_DIR          - Data directory (default: ./openplanner-lake)
 *   OPENPLANNER_STORAGE_BACKEND    - Storage backend: duckdb or mongodb
 *   MONGODB_URI                    - MongoDB connection string
 *   MONGODB_DB                     - Database name
 */

import { loadConfig } from "./lib/config.js";
import { openDuckDB, type Duck } from "./lib/duckdb.js";
import { openMongoDB, closeMongoDB, type MongoConnection } from "./lib/mongodb.js";
import { runMigrations, migrateDuckDBToMongoDB, exportDuckDBToJsonl, type MigrationContext } from "./lib/migration.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] ?? "status";

  const cfg = loadConfig();
  console.log(`[migrate] Storage backend: ${cfg.storageBackend}`);
  console.log(`[migrate] Data directory: ${cfg.dataDir}`);

  if (command === "status") {
    console.log(`[migrate] MongoDB URI: ${cfg.mongodb.uri}`);
    console.log(`[migrate] MongoDB DB: ${cfg.mongodb.dbName}`);
    console.log(`[migrate] MongoDB collections: ${cfg.mongodb.eventsCollection}, ${cfg.mongodb.compactedCollection}`);
    console.log(`[migrate] Run 'node migrate.js run' to apply pending migrations`);
    return;
  }

  if (command === "run") {
    console.log("[migrate] Opening databases...");

    let duck: Duck | undefined;
    let mongo: MongoConnection | undefined;

    try {
      // Open DuckDB if using it or migrating from it
      if (cfg.storageBackend === "duckdb" || args.includes("--from-duckdb")) {
        const dbPath = `${cfg.dataDir}/openplanner.duckdb`;
        duck = await openDuckDB(dbPath);
        console.log(`[migrate] DuckDB opened: ${dbPath}`);
      }

      // Open MongoDB if using it or migrating to it
      if (cfg.storageBackend === "mongodb" || args.includes("--to-mongo")) {
        mongo = await openMongoDB(cfg.mongodb);
        console.log(`[migrate] MongoDB connected: ${cfg.mongodb.dbName}`);
      }

      const ctx: MigrationContext = {
        storageBackend: cfg.storageBackend,
        duck,
        mongo,
        dataDir: cfg.dataDir,
        migrationsPath: `${cfg.dataDir}/migrations.json`,
      };

      const applied = await runMigrations(ctx);
      console.log(`[migrate] Applied ${applied.length} migrations: ${applied.join(", ") || "none"}`);
    } finally {
      if (duck) {
        await new Promise<void>((resolve) => {
          duck!.conn.close(() => resolve());
        });
      }
      if (mongo) {
        await closeMongoDB(mongo);
      }
    }
    return;
  }

  if (command === "duckdb-to-mongo") {
    console.log("[migrate] Migrating DuckDB data to MongoDB...");

    const dbPath = `${cfg.dataDir}/openplanner.duckdb`;
    const duck = await openDuckDB(dbPath);
    console.log(`[migrate] DuckDB opened: ${dbPath}`);

    const mongo = await openMongoDB(cfg.mongodb);
    console.log(`[migrate] MongoDB connected: ${cfg.mongodb.dbName}`);

    try {
      const dryRun = args.includes("--dry-run");
      const result = await migrateDuckDBToMongoDB(duck, mongo, { dryRun });

      console.log(`[migrate] Migration complete:`);
      console.log(`[migrate]   Events: ${result.eventsCount}`);
      console.log(`[migrate]   Memories: ${result.memoriesCount}`);
      console.log(`[migrate]   Duration: ${(result.duration / 1000).toFixed(2)}s`);
    } finally {
      await new Promise<void>((resolve) => {
        duck.conn.close(() => resolve());
      });
      await closeMongoDB(mongo);
    }
    return;
  }

  if (command === "export-jsonl") {
    console.log("[migrate] Exporting DuckDB data to JSONL...");

    const outputDir = args[1] ?? `${cfg.dataDir}/export`;
    const dbPath = `${cfg.dataDir}/openplanner.duckdb`;

    const duck = await openDuckDB(dbPath);
    console.log(`[migrate] DuckDB opened: ${dbPath}`);
    console.log(`[migrate] Output directory: ${outputDir}`);

    try {
      const result = await exportDuckDBToJsonl(duck, outputDir);
      console.log(`[migrate] Export complete:`);
      console.log(`[migrate]   Events: ${result.eventsFile}`);
      console.log(`[migrate]   Memories: ${result.memoriesFile}`);
    } finally {
      await new Promise<void>((resolve) => {
        duck.conn.close(() => resolve());
      });
    }
    return;
  }

  console.log(`[migrate] Unknown command: ${command}`);
  console.log(`[migrate] Available commands: status, run, duckdb-to-mongo, export-jsonl`);
  process.exit(1);
}

main().catch((error) => {
  console.error(`[migrate] Error: ${error.message}`);
  process.exit(1);
});