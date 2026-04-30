import Fastify, { type FastifyInstance } from "fastify";

import type { CompatRuntimeConfig } from "./lib/config.js";
import { addAuthHook } from "./lib/auth.js";
import { CompatEventBus } from "./lib/events.js";
import { defaultAgents } from "./lib/helpers.js";
import { PromptRunner } from "./lib/prompt-runner.js";
import { createStore } from "./lib/store.js";
import { registerRoutes } from "./routes.js";

export async function createApp(cfg: CompatRuntimeConfig): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    bodyLimit: 10 * 1024 * 1024
  });
  const store = await createStore({
    version: cfg.version,
    databaseUrl: cfg.databaseUrl
  });
  const events = new CompatEventBus();
  const promptRunner = new PromptRunner(cfg, store, events);
  const agents = defaultAgents(cfg);

  app.addHook("onRequest", async (request, reply) => {
    const requestOrigin = request.headers.origin;
    reply.header("Access-Control-Allow-Origin", requestOrigin ?? "*");
    reply.header("Vary", "Origin");
    reply.header("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, X-Opencode-Directory");
    reply.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  });

  app.options("/*", async (_request, reply) => {
    reply.code(204).send();
  });

  app.addHook("onClose", async () => {
    await store.close();
  });

  addAuthHook(app, cfg);
  await registerRoutes(app, {
    cfg,
    store,
    events,
    promptRunner,
    agents
  });

  return app;
}
