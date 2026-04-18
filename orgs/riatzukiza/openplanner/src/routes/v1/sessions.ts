import type { FastifyPluginAsync } from "fastify";
import { all } from "../../lib/duckdb.js";

type SessionRow = {
  project: string;
  session: string;
  last_ts: string | number | bigint | null;
  event_count: number | bigint;
};

function jsonSafe<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => {
      if (typeof v === "bigint") return Number(v);
      return v;
    })
  ) as T;
}

function toJsonSafeNumber(value: number | bigint): number {
  return typeof value === "bigint" ? Number(value) : value;
}

function normalizeTimestamp(value: SessionRow["last_ts"]): string | number | null {
  if (typeof value === "bigint") {
    return Number(value);
  }
  return value;
}

export const sessionRoutes: FastifyPluginAsync = async (app) => {
  app.get("/sessions", async () => {
    const rawRows = await all(app.duck.conn, `
      SELECT
        coalesce(project, '') AS project,
        coalesce(session, '') AS session,
        max(ts) AS last_ts,
        count(*)::BIGINT AS event_count
      FROM events
      WHERE session IS NOT NULL AND session <> ''
      GROUP BY 1,2
      ORDER BY last_ts DESC
      LIMIT 500
    `);

    const rows = (rawRows as SessionRow[]).map((row) => ({
      ...row,
      last_ts: normalizeTimestamp(row.last_ts),
      event_count: toJsonSafeNumber(row.event_count)
    }));

    return { ok: true, rows: jsonSafe(rows) };
  });

  app.get("/sessions/:sessionId", async (req, reply) => {
    const { sessionId } = req.params as any;
    if (!sessionId) {
      return reply.code(400).send({ ok: false, error: "sessionId required" });
    }

    const rows = await all(app.duck.conn, `
      SELECT id, ts, source, kind, project, session, message, role, author, model, text, attachments, extra
      FROM events
      WHERE session = ?
      ORDER BY ts ASC
      LIMIT 100000
    `, [sessionId]);

    return { ok: true, session: sessionId, rows: jsonSafe(rows) };
  });
};
