// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
import { contextStore } from "../../sinks.js";

export function registerSinkRoutes(app) {
  app.get("/sinks/list", {
    preHandler: [app.authUser, app.requirePolicy("read", "sinks")],
    schema: { operationId: "listSinks", tags: ["Sinks"] },
    handler: async () => ({
      sinks: Array.from(contextStore.collections.keys()),
    }),
  });

  app.post("/sinks/:name/query", {
    preHandler: [
      app.authUser,
      app.requirePolicy("read", (req) => req.params.name),
    ],
    schema: {
      summary: "Query sink in Mongo (structured filter)",
      operationId: "querySink",
      tags: ["Sinks"],
      body: {
        type: "object",
        properties: {
          filter: { type: "object" },
          limit: { type: "integer", default: 100 },
        },
      },
    },
    handler: async (req) => {
      const { name } = req.params;
      const { filter, limit } = req.body || {};
      const store = contextStore.getCollection(name);
      const results = await store.mongoCollection
        .find(filter || {})
        .sort({ timestamp: -1 })
        .limit(limit || 100)
        .toArray();
      return { results };
    },
  });

  app.post("/sinks/:name/search", {
    preHandler: [
      app.authUser,
      app.requirePolicy("read", (req) => req.params.name),
    ],
    schema: {
      summary: "Semantic search in sink (Chroma)",
      operationId: "searchSink",
      tags: ["Sinks"],
      body: {
        type: "object",
        required: ["q"],
        properties: {
          q: { type: "string" },
          n: { type: "integer", default: 10 },
          where: { type: "object" },
        },
      },
    },
    handler: async (req) => {
      const { name } = req.params;
      const { q, n, where } = req.body || {};
      const store = contextStore.getCollection(name);
      const results = await store.chromaCollection.query({
        queryTexts: [q],
        nResults: n || 10,
        where: where || {},
      });
      return { results };
    },
  });
}
