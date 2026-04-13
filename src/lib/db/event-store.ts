import { randomUUID } from "node:crypto";
import type { Sql } from "./index.js";

export type EventKind = "request" | "response" | "error" | "label" | "metric";

export interface ProxyEvent {
  readonly id: string;
  readonly ts: Date;
  readonly kind: EventKind;
  readonly entryId: string;
  readonly providerId?: string;
  readonly accountId?: string;
  readonly model?: string;
  readonly status?: number;
  readonly tags: readonly string[];
  readonly meta: Record<string, unknown>;
  readonly payload: Record<string, unknown> | null;
  readonly payloadBytes?: number;
}

export interface EventInsert {
  readonly kind: EventKind;
  readonly entryId: string;
  readonly providerId?: string;
  readonly accountId?: string;
  readonly model?: string;
  readonly status?: number;
  readonly tags?: readonly string[];
  readonly meta?: Record<string, unknown>;
  readonly payload?: Record<string, unknown> | null;
}

export interface EventQuery {
  readonly kind?: EventKind;
  readonly entryId?: string;
  readonly providerId?: string;
  readonly model?: string;
  readonly status?: number;
  readonly statusGte?: number;
  readonly statusLt?: number;
  readonly tag?: string;
  readonly since?: Date;
  readonly until?: Date;
  readonly limit?: number;
  readonly offset?: number;
  readonly orderDesc?: boolean;
}

export interface EventLabeler {
  readonly id: string;
  applies(event: EventInsert): boolean;
  label(event: EventInsert): string[];
}

interface EventRow {
  id: string;
  ts: Date | string;
  kind: string;
  entry_id: string;
  provider_id: string | null;
  account_id: string | null;
  model: string | null;
  status: number | null;
  tags: string[] | string | null;
  meta: Record<string, unknown> | string | null;
  payload: Record<string, unknown> | string | null;
  payload_bytes: number | null;
}

function parseRow(row: EventRow): ProxyEvent {
  const tags = typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags ?? []);
  const meta = typeof row.meta === "string" ? JSON.parse(row.meta) : (row.meta ?? {});
  const payload = typeof row.payload === "string" ? JSON.parse(row.payload) : (row.payload ?? null);

  return {
    id: row.id,
    ts: typeof row.ts === "string" ? new Date(row.ts) : row.ts,
    kind: row.kind as EventKind,
    entryId: row.entry_id,
    providerId: row.provider_id ?? undefined,
    accountId: row.account_id ?? undefined,
    model: row.model ?? undefined,
    status: row.status ?? undefined,
    tags,
    meta,
    payload,
    payloadBytes: row.payload_bytes ?? undefined,
  };
}

const MAX_PAYLOAD_BYTES = 2 * 1024 * 1024; // 2MB safety limit per event

export class EventStore {
  private readonly buffer: EventInsert[] = [];
  private readonly labelers: EventLabeler[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private flushing = false;

  public constructor(
    private readonly sql: Sql,
    private readonly flushIntervalMs: number = 3000,
    private readonly maxBufferSize: number = 200,
  ) {}

  public async init(): Promise<void> {
    await this.sql.unsafe(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        kind TEXT NOT NULL,
        entry_id TEXT NOT NULL,
        provider_id TEXT,
        account_id TEXT,
        model TEXT,
        status INTEGER,
        tags JSONB DEFAULT '[]'::jsonb,
        meta JSONB DEFAULT '{}'::jsonb,
        payload JSONB,
        payload_bytes INTEGER
      );
    `);

    await this.sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_events_entry ON events(entry_id);`);
    await this.sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts DESC);`);
    await this.sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_events_kind ON events(kind);`);
    await this.sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_events_model ON events(model);`);
    await this.sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING GIN(tags);`);
    await this.sql.unsafe(`CREATE INDEX IF NOT EXISTS idx_events_provider_status ON events(provider_id, status);`);

    await this.sql.unsafe(`
      CREATE TABLE IF NOT EXISTS labels (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    this.startFlushTimer();
  }

  public registerLabeler(labeler: EventLabeler): void {
    this.labelers.push(labeler);
  }

  public emit(event: EventInsert): string {
    const id = randomUUID();

    const autoTags: string[] = [];
    for (const labeler of this.labelers) {
      if (labeler.applies(event)) {
        autoTags.push(...labeler.label(event));
      }
    }

    const merged: EventInsert = autoTags.length > 0
      ? { ...event, tags: [...(event.tags ?? []), ...autoTags] }
      : event;

    this.buffer.push(merged);

    if (this.buffer.length >= this.maxBufferSize) {
      this.flush().catch(() => {});
    }

    return id;
  }

  public emitRequest(
    entryId: string,
    providerId: string,
    accountId: string,
    model: string,
    upstreamPayload: Record<string, unknown>,
    meta?: Record<string, unknown>,
  ): void {
    this.emit({
      kind: "request",
      entryId,
      providerId,
      accountId,
      model,
      tags: [],
      meta: meta ?? {},
      payload: sanitizePayload(upstreamPayload),
    });
  }

  public emitResponse(
    entryId: string,
    providerId: string,
    accountId: string,
    model: string,
    status: number,
    responsePayload: Record<string, unknown> | null,
    meta?: Record<string, unknown>,
  ): void {
    this.emit({
      kind: "response",
      entryId,
      providerId,
      accountId,
      model,
      status,
      tags: [],
      meta: meta ?? {},
      payload: responsePayload ? sanitizePayload(responsePayload) : null,
    });
  }

  public emitError(
    entryId: string,
    providerId: string,
    accountId: string,
    model: string,
    status: number,
    errorPayload: Record<string, unknown>,
    meta?: Record<string, unknown>,
  ): void {
    this.emit({
      kind: "error",
      entryId,
      providerId,
      accountId,
      model,
      status,
      tags: [],
      meta: meta ?? {},
      payload: sanitizePayload(errorPayload),
    });
  }

  public async query(filters: EventQuery): Promise<ProxyEvent[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filters.kind) {
      conditions.push(`kind = $${paramIndex++}`);
      values.push(filters.kind);
    }
    if (filters.entryId) {
      conditions.push(`entry_id = $${paramIndex++}`);
      values.push(filters.entryId);
    }
    if (filters.providerId) {
      conditions.push(`provider_id = $${paramIndex++}`);
      values.push(filters.providerId);
    }
    if (filters.model) {
      conditions.push(`model = $${paramIndex++}`);
      values.push(filters.model);
    }
    if (filters.status !== undefined) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(filters.status);
    }
    if (filters.statusGte !== undefined) {
      conditions.push(`status >= $${paramIndex++}`);
      values.push(filters.statusGte);
    }
    if (filters.statusLt !== undefined) {
      conditions.push(`status < $${paramIndex++}`);
      values.push(filters.statusLt);
    }
    if (filters.tag) {
      conditions.push(`tags ? $${paramIndex++}`);
      values.push(filters.tag);
    }
    if (filters.since) {
      conditions.push(`ts >= $${paramIndex++}`);
      values.push(filters.since.toISOString());
    }
    if (filters.until) {
      conditions.push(`ts < $${paramIndex++}`);
      values.push(filters.until.toISOString());
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const order = filters.orderDesc === false ? "ASC" : "DESC";
    const limit = Math.min(filters.limit ?? 100, 1000);
    const offset = filters.offset ?? 0;

    const query = `SELECT * FROM events ${where} ORDER BY ts ${order} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    const rows = await this.sql.unsafe<EventRow[]>(query, values as (string | number | null | Date)[]);
    return rows.map(parseRow);
  }

  public async addTag(eventId: string, tag: string): Promise<void> {
    const tagArray = JSON.stringify([tag]);
    await this.sql`UPDATE events SET tags = tags || ${tagArray}::jsonb WHERE id = ${eventId}::uuid AND NOT tags ? ${tag}`;
  }

  public async removeTag(eventId: string, tag: string): Promise<void> {
    await this.sql`UPDATE events SET tags = tags - ${tag} WHERE id = ${eventId}::uuid`;
  }

  public async countByTag(since?: Date): Promise<Record<string, number>> {
    const where = since ? `WHERE ts >= $1` : "";
    const params = since ? [since.toISOString()] : [];
    const timeFilter = since ? `AND e.ts >= $1` : "";
    const rows = await this.sql.unsafe<Array<{ tag: string; count: string }>>(
      `SELECT tag, COUNT(*) as count FROM events e, LATERAL jsonb_array_elements_text(e.tags) AS tag WHERE e.tags IS NOT NULL AND jsonb_typeof(e.tags) = 'array' ${timeFilter} GROUP BY tag ORDER BY count DESC`,
      params,
    );
    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.tag] = parseInt(row.count, 10);
    }
    return result;
  }

  public async flush(): Promise<void> {
    if (this.flushing || this.buffer.length === 0) {
      return;
    }

    this.flushing = true;
    try {
      const batch = this.buffer.splice(0, this.buffer.length);
      await this.writeBatch(batch);
    } finally {
      this.flushing = false;
    }
  }

  private async writeBatch(events: EventInsert[]): Promise<void> {
    if (events.length === 0) return;

    const BATCH_SIZE = 50;
    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      const chunk = events.slice(i, i + BATCH_SIZE);
      try {
        await this.writeChunk(chunk);
      } catch (err) {
        // Log but don't throw -- don't block the proxy for event storage failures
        console.error("EventStore: failed to write batch", err);
      }
    }
  }

  private async writeChunk(events: EventInsert[]): Promise<void> {
    if (events.length === 0) return;

    for (const ev of events) {
      const payloadBytes = ev.payload ? Buffer.byteLength(JSON.stringify(ev.payload), "utf8") : null;
      // postgres.js auto-serializes JS objects/arrays to JSONB when using tagged templates.
      const tags = [...(ev.tags ?? [])] as string[];
      const meta = { ...(ev.meta ?? {}) };
      const payload = ev.payload ? { ...ev.payload } : null;

      await this.sql`
        INSERT INTO events (id, ts, kind, entry_id, provider_id, account_id, model, status, tags, meta, payload, payload_bytes)
        VALUES (
          gen_random_uuid(), NOW(),
          ${ev.kind},
          ${ev.entryId},
          ${ev.providerId ?? null},
          ${ev.accountId ?? null},
          ${ev.model ?? null},
          ${ev.status ?? null},
          ${this.sql.json(tags as never)},
          ${this.sql.json(meta as never)},
          ${payload ? this.sql.json(payload as never) : null},
          ${payloadBytes}
        )
      `;
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => {
      this.flush().catch(() => {});
    }, this.flushIntervalMs);
  }

  public async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }
}

function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const json = JSON.stringify(payload);
  if (Buffer.byteLength(json, "utf8") > MAX_PAYLOAD_BYTES) {
    return {
      _truncated: true,
      _originalBytes: Buffer.byteLength(json, "utf8"),
      model: payload["model"],
      _messageCount: Array.isArray(payload["messages"]) ? payload["messages"].length : undefined,
      _inputCount: Array.isArray(payload["input"]) ? payload["input"].length : undefined,
    };
  }
  return stripInvalidJsonChars(payload) as Record<string, unknown>;
}

function stripInvalidJsonChars(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    return obj.replace(new RegExp("\\x00", "g"), "").replace(new RegExp("[\\x01-\\x1F]", "g"), (c) =>
      c === "\x1F" ? "\u241F" : c
    );
  }
  if (Array.isArray(obj)) {
    return obj.map(stripInvalidJsonChars);
  }
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = stripInvalidJsonChars(value);
    }
    return result;
  }
  return obj;
}
