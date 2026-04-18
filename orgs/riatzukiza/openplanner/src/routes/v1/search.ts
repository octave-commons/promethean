import type { FastifyPluginAsync } from "fastify";
import { all } from "../../lib/duckdb.js";
import { ftsSearch as mongoFtsSearch, ilikeSearch as mongoIlikeSearch } from "../../lib/mongodb.js";
import type { FtsSearchRequest, VectorSearchRequest } from "../../lib/types.js";
import { extractTieredVectorHits, mergeTieredVectorHits } from "../../lib/vector-search.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function buildSqlFilter(alias: string, body: Pick<FtsSearchRequest, "source" | "kind" | "project" | "session">): { sql: string; params: unknown[] } {
  const where: string[] = [];
  const params: unknown[] = [];

  if (body.source) { where.push(`${alias}.source = ?`); params.push(body.source); }
  if (body.kind) { where.push(`${alias}.kind = ?`); params.push(body.kind); }
  if (body.project) { where.push(`${alias}.project = ?`); params.push(body.project); }
  if (body.session) { where.push(`${alias}.session = ?`); params.push(body.session); }

  return {
    sql: where.length > 0 ? ` AND ${where.join(" AND ")}` : "",
    params,
  };
}

export const searchRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: FtsSearchRequest }>("/search/fts", async (req, reply) => {
    const body = req.body;
    const q = body.q;
    const limit = body.limit ?? 20;
    if (!q || typeof q !== "string") return reply.status(400).send({ error: "q is required" });

    const lim = Math.max(1, Math.min(200, Number(limit)));
    const tier = body.tier ?? "both";
    const storageBackend = (app as any).storageBackend ?? "duckdb";

    // MongoDB search
    if (storageBackend === "mongodb") {
      try {
        const results = await mongoFtsSearch(app.mongo.events, q, {
          limit: lim,
          source: body.source,
          kind: body.kind,
          project: body.project,
          session: body.session,
        });
        return { ok: true, ftsEnabled: true, count: results.length, rows: results, tier, storageBackend };
      } catch {
        // Fallback to $regex search if text search fails
        const results = await mongoIlikeSearch(app.mongo.events, q, {
          limit: lim,
          source: body.source,
          kind: body.kind,
          project: body.project,
          session: body.session,
        });
        return { ok: true, ftsEnabled: false, count: results.length, rows: results, tier, storageBackend };
      }
    }

    // DuckDB search
    const includeHot = tier !== "compact";
    const includeCompact = tier !== "hot";
    const hotFilter = buildSqlFilter("e", body);
    const compactFilter = buildSqlFilter("c", body);

    const buildFallbackRows = async (): Promise<any[]> => {
      const selects: string[] = [];
      const params: unknown[] = [];

      if (includeHot) {
        selects.push(`
          SELECT e.id, e.ts, e.source, e.kind, e.project, e.session, e.message, e.role, e.model,
                 substr(e.text, 1, 240) AS snippet,
                 'hot' AS tier
          FROM events e
          WHERE e.text ILIKE ?
          ${hotFilter.sql}
        `);
        params.push(`%${q}%`, ...hotFilter.params);
      }

      if (includeCompact) {
        selects.push(`
          SELECT c.id, c.ts, c.source, c.kind, c.project, c.session, c.seed_id AS message,
                 '' AS role,
                 c.embedding_model AS model,
                 substr(c.text, 1, 240) AS snippet,
                 'compact' AS tier
          FROM compacted_memories c
          WHERE c.text ILIKE ?
          ${compactFilter.sql}
        `);
        params.push(`%${q}%`, ...compactFilter.params);
      }

      if (selects.length === 0) return [];
      return all(app.duck.conn, `
        SELECT *
        FROM (${selects.join(" UNION ALL ")}) AS combined
        ORDER BY ts DESC
        LIMIT ?
      `, [...params, lim]);
    };

    let rows: any[] = [];

    if (app.duck.ftsEnabled) {
      try {
        const selects: string[] = [];
        const params: unknown[] = [];

        if (includeHot) {
          selects.push(`
            SELECT e.id, e.ts, e.source, e.kind, e.project, e.session, e.message, e.role, e.model,
                   substr(e.text, 1, 240) AS snippet,
                   'hot' AS tier
            FROM events e
            WHERE e.id IN (SELECT docid FROM fts_main_events WHERE fts_main_events MATCH ?)
            ${hotFilter.sql}
          `);
          params.push(q, ...hotFilter.params);
        }

        if (includeCompact) {
          selects.push(`
            SELECT c.id, c.ts, c.source, c.kind, c.project, c.session, c.seed_id AS message,
                   '' AS role,
                   c.embedding_model AS model,
                   substr(c.text, 1, 240) AS snippet,
                   'compact' AS tier
            FROM compacted_memories c
            WHERE c.id IN (SELECT docid FROM fts_main_compacted_memories WHERE fts_main_compacted_memories MATCH ?)
            ${compactFilter.sql}
          `);
          params.push(q, ...compactFilter.params);
        }

        rows = selects.length === 0
          ? []
          : await all(app.duck.conn, `
              SELECT *
              FROM (${selects.join(" UNION ALL ")}) AS combined
              ORDER BY ts DESC
              LIMIT ?
            `, [...params, lim]);
      } catch {
        rows = await buildFallbackRows();
      }
    } else {
      rows = await buildFallbackRows();
    }

    return { ok: true, ftsEnabled: app.duck.ftsEnabled, count: rows.length, rows, tier, storageBackend };
  });

  app.post<{ Body: VectorSearchRequest }>("/search/vector", async (req, reply) => {
    const body = req.body;
    const q = body.q;
    const k = body.k ?? 20;

    if (!q || typeof q !== "string") return reply.status(400).send({ error: "q is required" });

    const whereFromBody = isRecord(body.where) ? { ...body.where } : {};
    if (body.source) whereFromBody.source = body.source;
    if (body.kind) whereFromBody.kind = body.kind;
    if (body.project) whereFromBody.project = body.project;

    const embeddingScope = {
      source: typeof whereFromBody.source === "string" ? whereFromBody.source : undefined,
      kind: typeof whereFromBody.kind === "string" ? whereFromBody.kind : undefined,
      project: typeof whereFromBody.project === "string" ? whereFromBody.project : undefined,
    };
    const whereClause = Object.keys(whereFromBody).length > 0 ? whereFromBody : undefined;
    const tier = body.tier ?? "both";
    const includeHot = tier !== "compact";
    const includeCompact = tier !== "hot";
    const limit = Math.max(1, Math.min(200, Number(k)));

    const tieredHits = [];

    if (includeHot) {
      const embeddingFunction = app.chroma.embeddingFunctionFor?.(embeddingScope) ?? app.chroma.embeddingFunction;
      if (!embeddingFunction) return reply.status(500).send({ error: "hot embedding function unavailable" });

      const collection = await app.chroma.client.getCollection({
        name: app.chroma.collectionName,
        embeddingFunction,
      });
      const result = await collection.query({
        queryTexts: [q],
        nResults: limit,
        where: whereClause,
      });
      tieredHits.push(extractTieredVectorHits(result, "hot"));
    }

    if (includeCompact) {
      const embeddingFunction = app.chroma.embeddingFunctionFor?.(embeddingScope) ?? app.chroma.compactEmbeddingFunction;
      if (!embeddingFunction) return reply.status(500).send({ error: "compact embedding function unavailable" });

      const collection = await app.chroma.client.getCollection({
        name: app.chroma.compactCollectionName,
        embeddingFunction,
      });
      const result = await collection.query({
        queryTexts: [q],
        nResults: limit,
        where: whereClause,
      });
      tieredHits.push(extractTieredVectorHits(result, "compact"));
    }

    const result = mergeTieredVectorHits(tieredHits, limit);
    const storageBackend = (app as any).storageBackend ?? "duckdb";
    return { ok: true, result, tier, storageBackend };
  });
};