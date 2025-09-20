import Fastify from "fastify";
import type { Transport } from "../types.js";

// NOTE: Wire the SDK's HTTP adapter here when available.
export const fastifyTransport = (opts?: { port?: number; host?: string }): Transport => {
  const port = opts?.port ?? Number(process.env.PORT ?? 3000);
  const host = opts?.host ?? "0.0.0.0";
  const app = Fastify({ logger: false });

  // Placeholder endpoint; replace with proper MCP HTTP handler.
  app.get("/healthz", async () => ({ ok: true }));

  return {
    start: async (_server: unknown) => {
      await app.listen({ port, host });
    },
    stop: async () => { await app.close(); },
  };
};
