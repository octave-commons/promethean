import type { FastifyPluginAsync } from "fastify";
import { all, run } from "../../lib/duckdb.js";

export const graphRoutes: FastifyPluginAsync = async (app) => {
  const storageBackend = (app as any).storageBackend ?? "duckdb";
  const duck = (app as any).duck as { conn: unknown } | undefined;

  app.get("/graph/stats", async () => {
    if (storageBackend === "mongodb") {
      const db = (app as any).mongo;
      const nodeCount = await db.events.countDocuments({ kind: "graph.node" });
      const edgeCount = await db.events.countDocuments({ kind: "graph.edge" });
      return { nodeCount, edgeCount, storageBackend: "mongodb" };
    }

    if (!duck) return { nodeCount: 0, edgeCount: 0, storageBackend: "duckdb" };

    const nodeRows = await all((duck as any).conn, "SELECT COUNT(*) as c FROM events WHERE kind = 'graph.node'");
    const edgeRows = await all((duck as any).conn, "SELECT COUNT(*) as c FROM events WHERE kind = 'graph.edge'");
    return {
      nodeCount: (nodeRows[0] as any)?.c ?? 0,
      edgeCount: (edgeRows[0] as any)?.c ?? 0,
      storageBackend: "duckdb",
    };
  });

  app.get("/graph/nodes", async (req: any) => {
    const url = req.query?.url;
    if (!url) return { error: "url query param required" };

    if (storageBackend === "mongodb") {
      const db = (app as any).mongo;
      const nodes = await db.events.find({ kind: "graph.node", "data.url": url }).limit(1).toArray();
      return { node: nodes[0] ?? null };
    }

    if (!duck) return { node: null };
    const nodes = await all((duck as any).conn, "SELECT * FROM events WHERE kind = 'graph.node' AND json_extract_string(extra, '$.url') = ?", [url]);
    return { node: nodes[0] ?? null };
  });

  app.get("/graph/edges", async (req: any) => {
    const source = req.query?.source;
    const target = req.query?.target;

    if (storageBackend === "mongodb") {
      const db = (app as any).mongo;
      const query: Record<string, string> = { kind: "graph.edge" };
      if (source) query["data.source"] = source;
      if (target) query["data.target"] = target;
      const edges = await db.events.find(query).limit(100).toArray();
      return { edges };
    }

    if (!duck) return { edges: [] };

    let sql = "SELECT * FROM events WHERE kind = 'graph.edge'";
    const params: string[] = [];
    if (source) { sql += " AND json_extract_string(extra, '$.source') = ?"; params.push(source); }
    if (target) { sql += " AND json_extract_string(extra, '$.target') = ?"; params.push(target); }
    sql += " LIMIT 100";
    const edges = await all((duck as any).conn, sql, params);
    return { edges };
  });

  app.post("/graph/traverse", async (req: any) => {
    const from = req.body?.from;
    const depth = req.body?.depth ?? 2;
    const limit = req.body?.limit ?? 50;
    if (!from) return { error: "from is required" };

    if (storageBackend === "mongodb") {
      const db = (app as any).mongo;
      const visited = new Set<string>();
      const queue: Array<{ url: string; distance: number }> = [{ url: from, distance: 0 }];
      visited.add(from);
      const results: Array<{ url: string; distance: number }> = [];

      while (queue.length > 0 && results.length < limit) {
        const current = queue.shift()!;
        if (current.distance > 0) results.push(current);
        if (current.distance >= depth) continue;

        const edges = await db.events.find({ kind: "graph.edge", "data.source": current.url }).toArray();
        for (const edge of edges) {
          const targetUrl = edge.data?.target;
          if (targetUrl && !visited.has(targetUrl)) {
            visited.add(targetUrl);
            queue.push({ url: targetUrl, distance: current.distance + 1 });
          }
        }
      }
      return { from, depth, limit, results };
    }

    if (!duck) return { from, depth, limit, results: [] };

    const visited = new Set<string>();
    const queue: Array<{ url: string; distance: number }> = [{ url: from, distance: 0 }];
    visited.add(from);
    const results: Array<{ url: string; distance: number }> = [];

    while (queue.length > 0 && results.length < limit) {
      const current = queue.shift()!;
      if (current.distance > 0) results.push(current);
      if (current.distance >= depth) continue;

      const edges = await all((duck as any).conn, "SELECT json_extract_string(extra, '$.target') as target FROM events WHERE kind = 'graph.edge' AND json_extract_string(extra, '$.source') = ?", [current.url]);
      for (const edge of edges as Array<{ target: string }>) {
        if (edge.target && !visited.has(edge.target)) {
          visited.add(edge.target);
          queue.push({ url: edge.target, distance: current.distance + 1 });
        }
      }
    }
    return { from, depth, limit, results };
  });
};
