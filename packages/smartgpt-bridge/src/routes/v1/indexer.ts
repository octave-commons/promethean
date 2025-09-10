import { proxy } from "./proxy.js";

export function registerIndexerRoutes(v1: any) {
  v1.get("/indexer", {
    preHandler: [v1.authUser, v1.requirePolicy("read", () => "indexer")],
    schema: {
      summary: "Get indexer status",
      operationId: "getIndexerStatus",
      tags: ["Indexer"],
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            status: { type: "object", additionalProperties: true },
            lastIndexedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            stats: {
              type: "object",
              additionalProperties: true,
              nullable: true,
            },
          },
        },
      },
    },
    handler: proxy(v1, "GET", "/v0/indexer/status"),
  });

  v1.post("/indexer", {
    preHandler: [v1.authUser, v1.requirePolicy("write", () => "indexer")],
    schema: {
      summary: "Control indexer",
      operationId: "controlIndexer",
      tags: ["Indexer"],
      body: {
        type: "object",
        required: ["op"],
        properties: {
          op: { type: "string", enum: ["index", "remove", "reset", "reindex"] },
          path: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            message: { type: "string", nullable: true },
          },
        },
        400: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            error: { type: "string" },
          },
        },
      },
    },
    async handler(req: any, reply: any) {
      const { op, path: p } = req.body || {};
      try {
        if (op === "index") {
          if (!p)
            return reply.code(400).send({ ok: false, error: "missing path" });
          const res = await v1.inject({
            method: "POST",
            url: "/v0/indexer/index",
            payload: { path: String(p) },
            headers: req.headers,
          });
          return reply.code(res.statusCode).send(res.json());
        } else if (op === "remove") {
          if (!p)
            return reply.code(400).send({ ok: false, error: "missing path" });
          const res = await v1.inject({
            method: "POST",
            url: "/v0/indexer/remove",
            payload: { path: String(p) },
            headers: req.headers,
          });
          return reply.code(res.statusCode).send(res.json());
        } else if (op === "reset") {
          const res = await v1.inject({
            method: "POST",
            url: "/v0/indexer/reset",
            headers: req.headers,
          });
          return reply.code(res.statusCode).send(res.json());
        } else if (op === "reindex") {
          if (p) {
            const res = await v1.inject({
              method: "POST",
              url: "/v0/files/reindex",
              payload: { path: p },
              headers: req.headers,
            });
            return reply.code(res.statusCode).send(res.json());
          } else {
            const res = await v1.inject({
              method: "POST",
              url: "/v0/reindex",
              headers: req.headers,
            });
            return reply.code(res.statusCode).send(res.json());
          }
        }
        return reply.code(400).send({ ok: false, error: "invalid op" });
      } catch (e: any) {
        reply.code(500).send({ ok: false, error: String(e?.message || e) });
      }
    },
  });
}
