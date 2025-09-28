import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { IndexerManager } from "@promethean/indexer-core";

type PathBody = { path?: string | string[] };

export function registerIndexerRoutes(
  app: FastifyInstance,
  manager: IndexerManager,
  rootPath: string,
): void {
  app.get("/indexer/status", async (_req, reply: FastifyReply) => {
    reply.send({ ok: true, status: manager.status() });
  });

  app.post("/indexer/reset", async (_req: FastifyRequest, reply: FastifyReply) => {
    try {
      if (manager.isBusy()) {
        reply.code(409).send({ ok: false, error: "Indexer busy" });
        return;
      }
      await manager.resetAndBootstrap(rootPath);
      reply.send({ ok: true });
    } catch (error: any) {
      reply.code(500).send({ ok: false, error: String(error?.message || error) });
    }
  });

  app.post("/indexer/reindex", async (_req: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await manager.scheduleReindexAll();
      reply.send(result);
    } catch (error: any) {
      reply.code(500).send({ ok: false, error: String(error?.message || error) });
    }
  });

  app.post("/indexer/files/reindex", async (request: FastifyRequest<{ Body: PathBody }>, reply: FastifyReply) => {
    const globs = request.body?.path;
    if (!globs) {
      reply.code(400).send({ ok: false, error: "Missing 'path'" });
      return;
    }
    try {
      const result = await manager.scheduleReindexSubset(globs);
      reply.send(result);
    } catch (error: any) {
      reply.code(500).send({ ok: false, error: String(error?.message || error) });
    }
  });

  app.post("/indexer/index", async (request: FastifyRequest<{ Body: PathBody }>, reply: FastifyReply) => {
    const rel = typeof request.body?.path === "string" ? request.body.path : undefined;
    if (!rel) {
      reply.code(400).send({ ok: false, error: "Missing path" });
      return;
    }
    try {
      const result = await manager.scheduleIndexFile(rel);
      reply.send(result);
    } catch (error: any) {
      reply.code(500).send({ ok: false, error: String(error?.message || error) });
    }
  });

  app.post("/indexer/remove", async (request: FastifyRequest<{ Body: PathBody }>, reply: FastifyReply) => {
    const rel = typeof request.body?.path === "string" ? request.body.path : undefined;
    if (!rel) {
      reply.code(400).send({ ok: false, error: "Missing path" });
      return;
    }
    try {
      const result = await manager.removeFile(rel);
      reply.send(result);
    } catch (error: any) {
      reply.code(500).send({ ok: false, error: String(error?.message || error) });
    }
  });
}
