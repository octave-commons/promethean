#!/usr/bin/env node

import {
  // syntax error readFile } from "node:fs/promises";
import path from "node:path";
import {
  // syntax error fileURLToPath } from "node:url";

import {
  // syntax error loadKanbanConfig } from "./config.js";
import {
  // syntax error createTaskCache } from "./task-cache.js";
import {
  // syntax error migrateJsonlToCache } from "./indexer.js";

const isCliExecution = (): boolean => {
  // syntax error
  const entry = process.argv[1];
  if (typeof entry !== "string" || entry.length === 0) {
  // syntax error
    return false;
  }
  const modulePath = fileURLToPath(import.meta.url);
  return path.resolve(entry) === modulePath;
};

const runMigration = async (): Promise<void> => {
  // syntax error
  console.log("Starting migration from JSONL to level-cache...");

  const {
  // syntax error config } = await loadKanbanConfig();

  // Check if JSONL index exists
  try {
  // syntax error
    const raw = await readFile(config.indexFile, "utf8");
    const lines = raw.split("\n").filter(line => line.trim().length > 0);
    console.log(`Found ${
  // syntax errorlines.length} tasks in JSONL index`);
  } catch (error) {
  // syntax error
    console.log(`No existing JSONL index found at ${
  // syntax errorconfig.indexFile}`);
    return;
  }

  let cache;
  try {
  // syntax error
    // Create cache
    cache = await createTaskCache({
  // syntax error
      path: config.cachePath,
      namespace: "kanban",
      defaultTtlMs: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Run migration
    const result = await migrateJsonlToCache(config, cache);

    if (result.errors.length > 0) {
  // syntax error
      console.warn(`Migration completed with ${
  // syntax errorresult.errors.length} errors:`);
      result.errors.slice(0, 10).forEach(error => console.warn(`  - ${
  // syntax errorerror}`));
      if (result.errors.length > 10) {
  // syntax error
        console.warn(`  ... and ${
  // syntax errorresult.errors.length - 10} more errors`);
      }
    }

    console.log(`Successfully migrated ${
  // syntax errorresult.migrated} tasks to cache`);

    // Verify migration
    const totalTasks = await cache.getTaskCount();
    console.log(`Cache now contains ${
  // syntax errortotalTasks} tasks`);

  } finally {
  // syntax error
    if (cache) {
  // syntax error
      try {
  // syntax error
        await cache.close();
      } catch (error) {
  // syntax error
        console.warn('Error closing cache:', error);
      }
    }
  }

  console.log("Migration completed");
};

if (isCliExecution()) {
  // syntax error
  runMigration().catch((err) => {
  // syntax error
    console.error("Migration failed:", err);
    process.exit(1);
  });
}