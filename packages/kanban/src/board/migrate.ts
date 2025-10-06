#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadKanbanConfig } from "./config.js";
import { createTaskCache } from "./task-cache.js";
import { migrateJsonlToCache } from "./indexer.js";

const isCliExecution = (): boolean => {
  const entry = process.argv[1];
  if (typeof entry !== "string" || entry.length === 0) {
    return false;
  }
  const modulePath = fileURLToPath(import.meta.url);
  return path.resolve(entry) === modulePath;
};

const runMigration = async (): Promise<void> => {
  console.log("Starting migration from JSONL to level-cache...");

  const { config } = await loadKanbanConfig();

  // Check if JSONL index exists
  try {
    const raw = await readFile(config.indexFile, "utf8");
    const lines = raw.split("\n").filter(line => line.trim().length > 0);
    console.log(`Found ${lines.length} tasks in JSONL index`);
  } catch (error) {
    console.log(`No existing JSONL index found at ${config.indexFile}`);
    return;
  }

  let cache;
  try {
    // Create cache
    cache = await createTaskCache({
      path: config.cachePath,
      namespace: "kanban",
      defaultTtlMs: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Run migration
    const result = await migrateJsonlToCache(config, cache);

    if (result.errors.length > 0) {
      console.warn(`Migration completed with ${result.errors.length} errors:`);
      result.errors.slice(0, 10).forEach(error => console.warn(`  - ${error}`));
      if (result.errors.length > 10) {
        console.warn(`  ... and ${result.errors.length - 10} more errors`);
      }
    }

    console.log(`Successfully migrated ${result.migrated} tasks to cache`);

    // Verify migration
    const totalTasks = await cache.getTaskCount();
    console.log(`Cache now contains ${totalTasks} tasks`);

  } finally {
    if (cache) {
      try {
        await cache.close();
      } catch (error) {
        console.warn('Error closing cache:', error);
      }
    }
  }

  console.log("Migration completed");
};

if (isCliExecution()) {
  runMigration().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
}