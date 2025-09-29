import { searchIndex } from "../../indexerClient.js";
import { contextStore } from "../../sinks.js";

export function registerSearchRoutes(fastify: any) {
  const ROOT_PATH = fastify.ROOT_PATH;
  fastify.post("/search", {
    preHandler: [fastify.authUser, fastify.requirePolicy("read", "search")],
    schema: {
      summary: "Semantic search via Chroma",
      operationId: "semanticSearch",
      tags: ["Search"],
      body: {
        $id: "SearchRequest",
        type: "object",
        required: ["q"],
        properties: {
          q: { type: "string" },
          n: { type: "integer", default: 8 },
        },
      },
      response: {
        200: {
          $id: "SearchResponse",
          type: "object",
          properties: {
            ok: { type: "boolean" },
            results: { type: "array", items: { $ref: "SearchResult#" } },
          },
          additionalProperties: false,
        },
      },
    },
    handler: async (req: any, reply: any) => {
      try {
        const { q, n } = req.body || {};
        if (!q)
          return reply.code(400).send({ ok: false, error: "Missing 'q'" });
        const results = await searchIndex(ROOT_PATH, q, n ?? 8);
        try {
          const store = contextStore.getCollection("bridge_searches");
          await store.addEntry({
            text: JSON.stringify({ query: q, results, service: "chroma" }),
            timestamp: Date.now(),
            metadata: {
              query: q,
              resultCount: results.length,
              service: "chroma",
            },
          } as any);
        } catch {}
        reply.send({ ok: true, results });
      } catch (e: any) {
        reply.code(500).send({ ok: false, error: String(e?.message || e) });
      }
    },
  });

  fastify.post("/search/web", {
    preHandler: [
      fastify.authUser,
      fastify.requirePolicy("search", "bridge_searches"),
    ],
    schema: {
      operationId: "webSearch",
      tags: ["Search"],
      body: {
        type: "object",
        required: ["q"],
        properties: {
          q: { type: "string" },
          limit: { type: "integer", default: 5 },
        },
      },
    },
    handler: async (req: any) => {
      const { q, limit } = req.body || {};
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(
        q,
      )}&format=json&no_redirect=1&no_html=1`;
      const res = await fetch(url);
      const data = await res.json();
      const results = extractResults(data).slice(0, limit || 5);
      try {
        const store = contextStore.getCollection("bridge_searches");
        await store.addEntry({
          text: JSON.stringify({ query: q, results }),
          timestamp: Date.now(),
          metadata: { query: q, resultCount: results.length },
        } as any);
      } catch {}
      return { results };
    },
  });
}

function extractResults(data: any) {
  const results: Array<{ title: string; url: string; snippet: string }> = [];
  if (data?.Results) {
    for (const r of data.Results) {
      if (r.Text && r.FirstURL)
        results.push({ title: r.Text, url: r.FirstURL, snippet: r.Text });
    }
  }
  if (data?.RelatedTopics) {
    for (const item of data.RelatedTopics) {
      if (item.Topics) {
        for (const sub of item.Topics) {
          if (sub.Text && sub.FirstURL)
            results.push({
              title: sub.Text,
              url: sub.FirstURL,
              snippet: sub.Text,
            });
        }
      } else if (item.Text && item.FirstURL) {
        results.push({
          title: item.Text,
          url: item.FirstURL,
          snippet: item.Text,
        });
      }
    }
  }
  if (data?.AbstractURL && data?.AbstractText) {
    results.push({
      title: data.Heading || data.AbstractURL,
      url: data.AbstractURL,
      snippet: data.AbstractText,
    });
  }
  return results;
}
