/**
 * MongoDB Storage Plugin for Fastify
 *
 * Provides the same interface as the DuckDB plugin but uses MongoDB.
 *
 * TTL Configuration (environment variables):
 *   MONGODB_EVENTS_TTL_SECONDS - Events retention in seconds (default: 0 = disabled)
 *   MONGODB_COMPACTED_TTL_SECONDS - Compacted memories retention (default: 0 = disabled)
 *
 * Recommended values:
 *   - Events: 2592000 (30 days)
 *   - Compacted: 7776000 (90 days) - longer retention for summarized data
 */

import fp from "fastify-plugin";
import type { OpenPlannerConfig } from "../lib/config.js";
import { openMongoDB, closeMongoDB, type MongoConnection } from "../lib/mongodb.js";

declare module "fastify" {
  interface FastifyInstance {
    mongo: MongoConnection;
  }
}

export const mongodbPlugin = fp<OpenPlannerConfig>(async (app, cfg) => {
  const mongoUri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
  const mongoDbName = process.env.MONGODB_DB ?? "openplanner";
  const eventsCollection = process.env.MONGODB_EVENTS_COLLECTION ?? "events";
  const compactedCollection = process.env.MONGODB_COMPACTED_COLLECTION ?? "compacted_memories";
  
  // TTL settings (0 = disabled)
  const eventsTtlSeconds = parseInt(process.env.MONGODB_EVENTS_TTL_SECONDS ?? "0", 10);
  const compactedTtlSeconds = parseInt(process.env.MONGODB_COMPACTED_TTL_SECONDS ?? "0", 10);

  app.log.info({ uri: mongoUri, db: mongoDbName }, "connecting to mongodb");

  const mongo = await openMongoDB({
    uri: mongoUri,
    dbName: mongoDbName,
    eventsCollection,
    compactedCollection,
    eventsTtlSeconds: isNaN(eventsTtlSeconds) ? 0 : eventsTtlSeconds,
    compactedTtlSeconds: isNaN(compactedTtlSeconds) ? 0 : compactedTtlSeconds,
  });

  app.decorate("mongo", mongo);
  app.log.info({ 
    collections: { events: eventsCollection, compacted: compactedCollection },
    ttl: { events: eventsTtlSeconds || "disabled", compacted: compactedTtlSeconds || "disabled" },
  }, "mongodb ready");

  app.addHook("onClose", async () => {
    await closeMongoDB(mongo);
  });
});