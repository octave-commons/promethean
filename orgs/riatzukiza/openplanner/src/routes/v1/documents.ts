import type { FastifyPluginAsync } from "fastify";
import { all, run } from "../../lib/duckdb.js";
import { upsertEvent } from "../../lib/mongodb.js";
import type {
  DocumentPatchRequest,
  DocumentRecord,
  DocumentUpsertRequest,
  EventEnvelopeV1,
} from "../../lib/types.js";

const DOCUMENT_KINDS = new Set(["docs", "code", "config", "data"]);

function parseJson(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function normalizeVisibility(value: unknown): DocumentRecord["visibility"] {
  return value === "review" || value === "public" || value === "archived" ? value : "internal";
}

function rowToDocument(row: Record<string, unknown>): DocumentRecord {
  const extra = parseJson(row.extra);
  const metadata = (extra.metadata && typeof extra.metadata === "object") ? (extra.metadata as Record<string, unknown>) : {};
  const ts = row.ts instanceof Date ? row.ts.toISOString() : String(row.ts ?? new Date().toISOString());

  return {
    id: String(row.id),
    title: String(extra.title ?? row.message ?? row.id),
    content: String(row.text ?? ""),
    project: String(row.project ?? "devel-docs"),
    kind: (DOCUMENT_KINDS.has(String(row.kind)) ? String(row.kind) : "docs") as DocumentRecord["kind"],
    visibility: normalizeVisibility(extra.visibility),
    source: row.source ? String(row.source) : undefined,
    sourcePath: extra.source_path ? String(extra.source_path) : undefined,
    domain: extra.domain ? String(extra.domain) : undefined,
    language: extra.language ? String(extra.language) : undefined,
    createdBy: extra.created_by ? String(extra.created_by) : undefined,
    publishedBy: extra.published_by ? String(extra.published_by) : undefined,
    publishedAt: extra.published_at ? String(extra.published_at) : null,
    aiDrafted: Boolean(extra.ai_drafted),
    aiModel: extra.ai_model ? String(extra.ai_model) : null,
    aiPromptHash: extra.ai_prompt_hash ? String(extra.ai_prompt_hash) : null,
    metadata,
    ts,
  };
}

function documentToEvent(doc: DocumentRecord, original?: DocumentRecord): EventEnvelopeV1 {
  const ts = doc.ts ?? original?.ts ?? new Date().toISOString();
  const publishedAt = doc.visibility === "public"
    ? (doc.publishedAt ?? original?.publishedAt ?? new Date().toISOString())
    : null;

  return {
    schema: "openplanner.event.v1",
    id: doc.id,
    ts,
    source: doc.source ?? original?.source ?? "manual",
    kind: doc.kind,
    source_ref: {
      project: doc.project,
      message: doc.title,
    },
    text: doc.content,
    meta: {
      author: doc.createdBy ?? original?.createdBy ?? "unknown",
      model: doc.aiModel ?? original?.aiModel ?? undefined,
      tags: [doc.project, doc.kind, doc.visibility, doc.domain].filter(Boolean),
    },
    extra: {
      title: doc.title,
      visibility: doc.visibility,
      source_path: doc.sourcePath ?? null,
      domain: doc.domain ?? "general",
      language: doc.language ?? "en",
      created_by: doc.createdBy ?? original?.createdBy ?? "unknown",
      published_by: doc.publishedBy ?? original?.publishedBy ?? null,
      published_at: publishedAt,
      ai_drafted: doc.aiDrafted ?? false,
      ai_model: doc.aiModel ?? null,
      ai_prompt_hash: doc.aiPromptHash ?? null,
      metadata: doc.metadata ?? {},
      updated_at: new Date().toISOString(),
    },
  };
}

async function persistAndMaybeIndex(app: any, ev: EventEnvelopeV1): Promise<{ indexed: boolean; warning?: string }> {
  await persistEvent(app, ev);
  try {
    await indexDocument(app, ev);
    return { indexed: true };
  } catch (error) {
    app.log.error(error, "Failed to index document into ChromaDB");
    const warning = error instanceof Error ? error.message : String(error);
    return { indexed: false, warning };
  }
}

async function persistEvent(app: any, ev: EventEnvelopeV1): Promise<void> {
  const sr = ev.source_ref ?? {};
  const meta = ev.meta ?? {};
  const role = meta.role ? String(meta.role) : null;
  const author = meta.author ? String(meta.author) : null;
  const model = meta.model ? String(meta.model) : null;
  const tags = meta.tags ?? null;
  const storageBackend = app.storageBackend ?? "duckdb";

  if (storageBackend === "mongodb") {
    await upsertEvent(app.mongo.events, {
      id: ev.id,
      ts: new Date(ev.ts),
      source: ev.source,
      kind: ev.kind,
      project: sr.project ? String(sr.project) : null,
      session: sr.session ? String(sr.session) : null,
      message: sr.message ? String(sr.message) : null,
      role,
      author,
      model,
      tags,
      text: ev.text ? String(ev.text) : "",
      attachments: ev.attachments ?? null,
      extra: ev.extra ?? null,
    });
  } else {
    await run(app.duck.conn, `
      INSERT INTO events (
        id, ts, source, kind, project, session, message, role, author, model, tags, text, attachments, extra
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        ts=excluded.ts,
        source=excluded.source,
        kind=excluded.kind,
        project=excluded.project,
        session=excluded.session,
        message=excluded.message,
        role=excluded.role,
        author=excluded.author,
        model=excluded.model,
        tags=excluded.tags,
        text=excluded.text,
        attachments=excluded.attachments,
        extra=excluded.extra
    `, [
      ev.id,
      ev.ts,
      ev.source,
      ev.kind,
      sr.project ? String(sr.project) : null,
      sr.session ? String(sr.session) : null,
      sr.message ? String(sr.message) : null,
      role,
      author,
      model,
      JSON.stringify(tags ?? []),
      ev.text ? String(ev.text) : "",
      JSON.stringify(ev.attachments ?? []),
      JSON.stringify(ev.extra ?? {}),
    ]);
  }
}

async function indexDocument(app: any, ev: EventEnvelopeV1): Promise<void> {
  if (!ev.text) return;
  const sr = ev.source_ref ?? {};
  const meta = ev.meta ?? {};
  const embeddingScope = {
    source: ev.source,
    kind: ev.kind,
    project: sr.project ? String(sr.project) : undefined,
  };
  const embeddingFunction = app.chroma.embeddingFunctionFor?.(embeddingScope) ?? app.chroma.embeddingFunction;
  const embeddingModel = app.chroma.resolveEmbeddingModel?.(embeddingScope);
  const collection: any = await app.chroma.client.getCollection({
    name: app.chroma.collectionName,
    embeddingFunction,
  });
  const metadata = {
    ts: ev.ts,
    source: ev.source,
    kind: ev.kind,
    project: sr.project,
    session: sr.session,
    author: meta.author ? String(meta.author) : "",
    role: meta.role ? String(meta.role) : "",
    model: meta.model ? String(meta.model) : "",
    embedding_model: embeddingModel ?? "",
    search_tier: "hot",
    visibility: (ev.extra as Record<string, unknown> | undefined)?.visibility ?? "internal",
    title: (ev.extra as Record<string, unknown> | undefined)?.title ?? sr.message ?? ev.id,
  } as Record<string, unknown>;

  if (typeof collection.upsert === "function") {
    await collection.upsert({ ids: [ev.id], documents: [ev.text], metadatas: [metadata] });
    return;
  }

  try {
    if (typeof collection.update === "function") {
      await collection.update({ ids: [ev.id], documents: [ev.text], metadatas: [metadata] });
      return;
    }
  } catch {}

  await collection.add({ ids: [ev.id], documents: [ev.text], metadatas: [metadata] });
}

async function getDocumentById(app: any, id: string): Promise<DocumentRecord | null> {
  const storageBackend = app.storageBackend ?? "duckdb";
  if (storageBackend === "mongodb") {
    const row = await app.mongo.events.findOne({ _id: id, kind: { $in: [...DOCUMENT_KINDS] } });
    return row ? rowToDocument(row as Record<string, unknown>) : null;
  }

  const rows = await all<Record<string, unknown>>(app.duck.conn, `
    SELECT * FROM events WHERE id = ? AND kind IN ('docs','code','config','data') LIMIT 1
  `, [id]);
  return rows[0] ? rowToDocument(rows[0]) : null;
}

export const documentRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: DocumentUpsertRequest }>("/documents", async (req, reply) => {
    const doc = req.body?.document;
    if (!doc?.id || !doc?.title || !doc?.content || !doc?.project || !doc?.kind) {
      return reply.status(400).send({ error: "document.id/title/content/project/kind are required" });
    }
    if (!DOCUMENT_KINDS.has(doc.kind)) {
      return reply.status(400).send({ error: `invalid document kind: ${doc.kind}` });
    }
    const normalized: DocumentRecord = {
      ...doc,
      visibility: doc.visibility ?? "internal",
      source: doc.source ?? "manual",
      domain: doc.domain ?? "general",
      language: doc.language ?? "en",
      createdBy: doc.createdBy ?? "unknown",
      metadata: doc.metadata ?? {},
      aiDrafted: doc.aiDrafted ?? false,
      ts: doc.ts ?? new Date().toISOString(),
    };
    const ev = documentToEvent(normalized);
    const result = await persistAndMaybeIndex(app, ev);
    return { ok: true, document: normalized, ...result };
  });

  app.get("/documents/:id", async (req, reply) => {
    const id = String((req.params as { id: string }).id);
    const doc = await getDocumentById(app, id);
    if (!doc) return reply.status(404).send({ error: "document not found" });
    return { ok: true, document: doc };
  });

  app.get("/documents", async (req) => {
    const query = (req.query ?? {}) as Record<string, string | undefined>;
    const limit = Math.max(1, Math.min(200, Number(query.limit ?? 50)));
    const visibility = query.visibility;
    const project = query.project;
    const kind = query.kind;
    const source = query.source;
    const storageBackend = (app as any).storageBackend ?? "duckdb";

    if (storageBackend === "mongodb") {
      const filter: Record<string, unknown> = { kind: { $in: [...DOCUMENT_KINDS] } };
      if (project) filter.project = project;
      if (kind) filter.kind = kind;
      if (source) filter.source = source;
      if (visibility) filter["extra.visibility"] = visibility;
      const rows = await app.mongo.events.find(filter).sort({ ts: -1 }).limit(limit).toArray();
      return { ok: true, count: rows.length, rows: rows.map((row: Record<string, unknown>) => rowToDocument(row)) };
    }

    const where: string[] = ["kind IN ('docs','code','config','data')"];
    const params: unknown[] = [];
    if (project) { where.push("project = ?"); params.push(project); }
    if (kind) { where.push("kind = ?"); params.push(kind); }
    if (source) { where.push("source = ?"); params.push(source); }
    if (visibility) { where.push("json_extract_string(extra, '$.visibility') = ?"); params.push(visibility); }
    const rows = await all<Record<string, unknown>>(app.duck.conn, `
      SELECT * FROM events WHERE ${where.join(" AND ")} ORDER BY ts DESC LIMIT ?
    `, [...params, limit]);
    return { ok: true, count: rows.length, rows: rows.map(rowToDocument) };
  });

  app.patch<{ Body: DocumentPatchRequest }>("/documents/:id", async (req, reply) => {
    const id = String((req.params as { id: string }).id);
    const existing = await getDocumentById(app, id);
    if (!existing) return reply.status(404).send({ error: "document not found" });
    const patch = req.body ?? {};
    const next: DocumentRecord = {
      ...existing,
      ...patch,
      sourcePath: patch.sourcePath ?? existing.sourcePath ?? undefined,
      domain: patch.domain ?? existing.domain ?? undefined,
      language: patch.language ?? existing.language ?? undefined,
      publishedBy: patch.publishedBy ?? existing.publishedBy ?? undefined,
      metadata: patch.metadata ?? existing.metadata ?? {},
      publishedAt: patch.publishedAt ?? existing.publishedAt ?? null,
      ts: new Date().toISOString(),
    };
    const ev = documentToEvent(next, existing);
    const result = await persistAndMaybeIndex(app, ev);
    return { ok: true, document: next, ...result };
  });

  app.post("/documents/:id/publish", async (req, reply) => {
    const id = String((req.params as { id: string }).id);
    const existing = await getDocumentById(app, id);
    if (!existing) return reply.status(404).send({ error: "document not found" });
    const next: DocumentRecord = {
      ...existing,
      visibility: "public",
      publishedAt: new Date().toISOString(),
      ts: new Date().toISOString(),
    };
    const ev = documentToEvent(next, existing);
    const result = await persistAndMaybeIndex(app, ev);
    return { ok: true, document: next, ...result };
  });

  app.post("/documents/:id/archive", async (req, reply) => {
    const id = String((req.params as { id: string }).id);
    const existing = await getDocumentById(app, id);
    if (!existing) return reply.status(404).send({ error: "document not found" });
    const next: DocumentRecord = {
      ...existing,
      visibility: "archived",
      ts: new Date().toISOString(),
    };
    const ev = documentToEvent(next, existing);
    const result = await persistAndMaybeIndex(app, ev);
    return { ok: true, document: next, ...result };
  });
};
