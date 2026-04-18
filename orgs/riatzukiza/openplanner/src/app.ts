import Fastify, { type FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import sensible from "@fastify/sensible";
import type { OpenPlannerConfig } from "./lib/config.js";
import { authPlugin } from "./plugins/auth.js";
import { duckdbPlugin } from "./plugins/duckdb.js";
import { mongodbPlugin } from "./plugins/mongodb.js";
import { chromaPlugin } from "./plugins/chroma.js";
import { v1Routes } from "./routes/v1/index.js";

export async function buildApp(cfg: OpenPlannerConfig): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    bodyLimit: 50 * 1024 * 1024,
    pluginTimeout: 120_000,
  });

  (app as any).openplannerConfig = cfg;
  (app as any).storageBackend = cfg.storageBackend;

  await app.register(sensible as any);
  await app.register(multipart as any, {
    limits: { fileSize: 200 * 1024 * 1024 }
  });

  await app.register(authPlugin as any, cfg);

  // Register storage backend based on config
  if (cfg.storageBackend === "mongodb") {
    await app.register(mongodbPlugin as any, cfg);
  } else {
    await app.register(duckdbPlugin as any, cfg);
  }

  await app.register(chromaPlugin as any, cfg);

  await app.register(v1Routes, { prefix: "/v1" });

  app.get("/", async () => ({ ok: true, name: "openplanner", version: "0.2.0", storageBackend: cfg.storageBackend }));
  return app;
}
