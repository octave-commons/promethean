import fp from "fastify-plugin";
import type { OpenPlannerConfig } from "../lib/config.js";

export const authPlugin = fp<OpenPlannerConfig>(async (app, cfg) => {
  app.addHook("onRequest", async (req, reply) => {
    if (req.url === "/v1/health" || req.url === "/") return;

    const h = req.headers["authorization"];
    const token =
      typeof h === "string" && h.toLowerCase().startsWith("bearer ") ? h.slice(7) : null;

    if (!token || token !== cfg.apiKey) {
      return reply.unauthorized("Missing/invalid Authorization: Bearer <API_KEY>");
    }
  });
});
