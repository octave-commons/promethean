import type { FastifyInstance } from "fastify";

import type { CompatRuntimeConfig } from "./config.js";
import { unauthorized } from "./errors.js";

export function addAuthHook(app: FastifyInstance, cfg: CompatRuntimeConfig) {
  app.addHook("onRequest", async (request, reply) => {
    if (request.method === "OPTIONS") {
      return;
    }
    const path = (request.raw.url ?? "/").split("?", 1)[0] ?? "/";
    if (path === "/health" || path === "/global/health") {
      return;
    }
    if (!cfg.apiKey) {
      return;
    }
    const header = request.headers.authorization;
    if (header === `Bearer ${cfg.apiKey}`) {
      return;
    }
    return unauthorized(reply, "missing or invalid bearer token");
  });
}
