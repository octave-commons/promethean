import { contextStore } from "../../sinks.js";

export function registerSinkRoutes(v1: any) {
  // ------------------------------------------------------------------
  // Sinks
  // ------------------------------------------------------------------
  v1.get("/sinks", {
    preHandler: [v1.authUser, v1.requirePolicy("read", () => "sinks")],
    schema: {
      summary: "List sinks",
      operationId: "listSinks",
      tags: ["Sinks"],
      response: {
        200: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            sinks: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
    async handler() {
      return { ok: true, sinks: contextStore.listCollectionNames() };
    },
  });

  v1.post("/sinks/:name/search", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", (req: any) => req.params.name),
    ],
    schema: {
      summary: "Semantic search in sink (Chroma)",
      operationId: "searchSink",
      tags: ["Sinks"],
      params: {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string" } },
      },
      body: {
        type: "object",
        required: ["q"],
        properties: {
          q: { type: "string" },
          n: { type: "integer", default: 10 },
          where: { type: "object" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            results: { type: "array", items: { type: "object" } },
          },
        },
      },
    },
    async handler(req: any) {
      const { name } = req.params;
      const { q, n, where } = req.body || {};
      const store = contextStore.getCollection(name);
      const results = await store.getChromaCollection().query({
        queryTexts: [q],
        nResults: n || 10,
        where: where || {},
      });
      return { results };
    },
  });
}
