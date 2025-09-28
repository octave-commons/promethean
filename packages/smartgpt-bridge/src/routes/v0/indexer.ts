import {
  getIndexerStatus,
  scheduleReindexAll,
  scheduleReindexSubset,
  scheduleIndexFile,
  removeIndexedPath,
  isIndexerBusy,
  resetIndexer,
} from "../../indexerClient.js";

export function registerIndexerRoutes(fastify: any) {
  const ROOT_PATH = fastify.ROOT_PATH;

  fastify.post("/reindex", {
    schema: {
      summary: "Reindex entire repository",
      operationId: "reindexAll",
      tags: ["Indexer"],
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            queued: { type: "integer" },
            ignored: { type: "boolean" },
          },
        },
      },
    },
    handler: async (_req: any, reply: any) => {
      try {
        const result = await scheduleReindexAll();
        reply.send(result);
      } catch (e: any) {
        reply.code(500).send({ ok: false, error: String(e?.message || e) });
      }
    },
  });

  fastify.post("/files/reindex", {
    schema: {
      summary: "Reindex subset of files",
      operationId: "reindexFiles",
      tags: ["Indexer"],
      body: {
        type: "object",
        properties: {
          path: { type: ["string", "array"], items: { type: "string" } },
        },
      },
      querystring: {
        type: "object",
        properties: {
          path: { type: ["string", "array"], items: { type: "string" } },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            queued: { type: "integer" },
            ignored: { type: "boolean" },
          },
        },
      },
    },
    handler: async (req: any, reply: any) => {
      try {
        const globs = req.body?.path ?? req.query?.path;
        if (!globs)
          return reply.code(400).send({ ok: false, error: "Missing 'path'" });
        const result = await scheduleReindexSubset(globs);
        reply.send(result);
      } catch (e: any) {
        reply.code(500).send({ ok: false, error: String(e?.message || e) });
      }
    },
  });

  fastify.get("/indexer/status", {
    schema: {
      summary: "Get indexer status",
      operationId: "indexerStatus",
      tags: ["Indexer"],
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            status: { type: "object" },
          },
        },
      },
    },
    handler: async (_req: any, reply: any) => {
      try {
        const status = await getIndexerStatus();
        reply.send({ ok: true, status });
      } catch (e: any) {
        reply.code(500).send({ ok: false, error: String(e?.message || e) });
      }
    },
  });

  fastify.post("/indexer/index", {
    schema: {
      summary: "Index a single file",
      operationId: "indexFile",
      tags: ["Indexer"],
      body: {
        type: "object",
        required: ["path"],
        properties: { path: { type: "string" } },
      },
      response: {
        200: {
          type: "object",
          properties: { ok: { type: "boolean" }, queued: { type: "integer" } },
        },
      },
    },
    handler: async (req: any, reply: any) => {
      try {
        const p = req.body?.path;
        if (!p)
          return reply.code(400).send({ ok: false, error: "Missing path" });
        const result = await scheduleIndexFile(String(p));
        reply.send(result);
      } catch (e: any) {
        reply.code(500).send({ ok: false, error: String(e?.message || e) });
      }
    },
  });

  fastify.post("/indexer/remove", {
    schema: {
      summary: "Remove a file from index",
      operationId: "removeFileFromIndex",
      tags: ["Indexer"],
      body: {
        type: "object",
        required: ["path"],
        properties: { path: { type: "string" } },
      },
      response: {
        200: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
      },
    },
    handler: async (req: any, reply: any) => {
      try {
        const p = req.body?.path;
        if (!p)
          return reply.code(400).send({ ok: false, error: "Missing path" });
        const rel = String(p);
        const result = await removeIndexedPath(rel);
        reply.send(result);
      } catch (e: any) {
        reply.code(500).send({ ok: false, error: String(e?.message || e) });
      }
    },
  });

  fastify.post("/indexer/reset", {
    schema: {
      summary: "Reset indexer state and bootstrap",
      operationId: "resetIndexer",
      tags: ["Indexer"],
      response: {
        200: { type: "object", properties: { ok: { type: "boolean" } } },
        409: {
          type: "object",
          properties: { ok: { type: "boolean" }, error: { type: "string" } },
        },
      },
    },
    handler: async (_req: any, reply: any) => {
      try {
        if (await isIndexerBusy())
          return reply.code(409).send({ ok: false, error: "Indexer busy" });
        await resetIndexer(ROOT_PATH);
        reply.send({ ok: true });
      } catch (e: any) {
        reply.code(500).send({ ok: false, error: String(e?.message || e) });
      }
    },
  });
}
