import { grep } from "../../grep.js";
import { searchIndex } from "../../indexerClient.js";
import { contextStore } from "../../sinks.js";

export function registerSearchRoutes(v1: any) {
  const ROOT_PATH = v1.ROOT_PATH;
  // ------------------------------------------------------------------
  // Search
  // ------------------------------------------------------------------
  v1.post("/search/code", {
    preHandler: [v1.authUser, v1.requirePolicy("read", () => "code")],
    schema: {
      summary: "Grep code",
      operationId: "grepCode",
      tags: ["Search"],
      body: {
        type: "object",
        required: ["pattern"],
        properties: {
          pattern: { type: "string" },
          path: { type: "string" },
          flags: { type: "string" },
        },
      },
    },
    async handler(req: any, reply: any) {
      try {
        const body = req.body || {};
        const opts: any = {
          pattern: body.pattern,
          flags: body.flags || "g",
          maxMatches: Number(body.maxMatches || 200),
          context: Number(body.context || 2),
        };
        if (body.path) opts.paths = [String(body.path)];
        const results = await grep(ROOT_PATH, opts);
        reply.send({ ok: true, results });
      } catch (e: any) {
        reply.code(400).send({ ok: false, error: String(e?.message || e) });
      }
    },
  });

  v1.post("/search/semantic", {
    preHandler: [v1.authUser, v1.requirePolicy("read", () => "search")],
    schema: {
      summary: "Semantic search (default sink)",
      operationId: "semanticSearch",
      tags: ["Search"],
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
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  path: { type: "string" },
                  chunkIndex: { type: "integer" },
                  startLine: { type: "integer" },
                  endLine: { type: "integer" },
                  score: { type: "number" },
                  text: { type: "string" },
                },
                required: [
                  "id",
                  "path",
                  "chunkIndex",
                  "startLine",
                  "endLine",
                  "score",
                  "text",
                ],
              },
            },
          },
        },
      },
    },
    async handler(req: any, reply: any) {
      try {
        const { q, n } = req.body || {};
        if (!q)
          return reply.code(400).send({ ok: false, error: "Missing 'q'" });
        const results = await searchIndex(ROOT_PATH, q, n || 10);
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
        reply.send({ results });
      } catch (e: any) {
        reply.code(500).send({ ok: false, error: String(e?.message || e) });
      }
    },
  });

  v1.post("/search/web", {
    preHandler: [
      v1.authUser,
      v1.requirePolicy("read", () => "bridge_searches"),
    ],
    schema: {
      summary: "Web search",
      operationId: "webSearch",
      tags: ["Search"],
      body: {
        type: "object",
        required: ["q"],
        properties: {
          q: { type: "string" },
          n: { type: "integer", default: 10, description: "Max results" },
          lang: { type: "string", description: "Prefered Language (BCP-47)" },
          site: { type: "string", description: "Optional site/domain filter" },
        },
      },
    },
    async handler(req: any, reply: any) {
      try {
        const { q, n, lang, site } = req.body || {};
        let query = q;
        if (site) query = `site:${site} ${q}`;
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(
          query,
        )}&format=json&no_redirect=1&no_html=1`;
        const res = await fetch(url);
        const data = await res.json();
        const results = extractResults(data).slice(0, n || 10);
        try {
          const store = contextStore.getCollection("bridge_searches");
          await store.addEntry({
            text: JSON.stringify({ query: q, results }),
            timestamp: Date.now(),
            metadata: { query: q, resultCount: results.length, lang, site },
          } as any);
        } catch {}
        reply.send({ results });
      } catch (e: any) {
        reply.code(500).send({ ok: false, error: String(e?.message || e) });
      }
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
