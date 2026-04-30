import type { Sql } from "./index.js";
import type {
  RequestAuthType,
  Factory4xxDiagnostics,
  RequestLogEntry,
  RequestLogFilters,
  RequestLogMirror,
  RequestServiceTierSource,
} from "../request-log-store.js";

interface RequestUsageRow {
  readonly id: string;
  readonly timestamp_ms: number | string;
  readonly tenant_id: string | null;
  readonly issuer: string | null;
  readonly key_id: string | null;
  readonly provider_id: string;
  readonly account_id: string;
  readonly auth_type: string;
  readonly model: string;
  readonly upstream_mode: string;
  readonly upstream_path: string;
  readonly status: number | string;
  readonly latency_ms: number | string;
  readonly service_tier: string | null;
  readonly service_tier_source: string;
  readonly prompt_tokens: number | string | null;
  readonly completion_tokens: number | string | null;
  readonly total_tokens: number | string | null;
  readonly cached_prompt_tokens: number | string | null;
  readonly image_count: number | string | null;
  readonly image_cost_usd: number | string | null;
  readonly prompt_cache_key_used: boolean | null;
  readonly cache_hit: boolean | null;
  readonly ttft_ms: number | string | null;
  readonly tps: number | string | null;
  readonly error: string | null;
  readonly upstream_error_code: string | null;
  readonly upstream_error_type: string | null;
  readonly upstream_error_message: string | null;
  readonly factory_diagnostics: Record<string, unknown> | string | null;
  readonly cost_usd: number | string | null;
  readonly energy_joules: number | string | null;
  readonly water_evaporated_ml: number | string | null;
}

interface CursorRow {
  readonly id: string;
  readonly timestamp_ms: number | string;
}

interface CoverageRow {
  readonly earliest_entry_at_ms: number | string | null;
  readonly retained_entry_count: number | string;
}

export interface RequestUsageCoverage {
  readonly earliestEntryAtMs: number | null;
  readonly retainedEntryCount: number;
  readonly maxRetainedEntries: number;
}

function asOptionalString(value: string | null | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asOptionalBoolean(value: boolean | null | undefined): boolean {
  return value === true;
}

function asOptionalNumber(value: number | string | null | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function asRequiredNumber(value: number | string): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  throw new Error(`Expected numeric database value, got ${String(value)}`);
}

function parseFactoryDiagnostics(value: Record<string, unknown> | string | null): Factory4xxDiagnostics | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return typeof parsed === "object" && parsed !== null ? parsed as unknown as Factory4xxDiagnostics : undefined;
    } catch {
      return undefined;
    }
  }

  return value as unknown as Factory4xxDiagnostics;
}

function normalizeAuthType(value: string): RequestAuthType {
  if (value === "api_key" || value === "oauth_bearer" || value === "local" || value === "none") {
    return value;
  }

  return "none";
}

function normalizeServiceTierSource(value: string): RequestServiceTierSource {
  if (value === "fast_mode" || value === "explicit" || value === "none") {
    return value;
  }

  return "none";
}

function toEntry(row: RequestUsageRow): RequestLogEntry {
  return {
    id: row.id,
    timestamp: asRequiredNumber(row.timestamp_ms),
    tenantId: asOptionalString(row.tenant_id),
    issuer: asOptionalString(row.issuer),
    keyId: asOptionalString(row.key_id),
    providerId: row.provider_id,
    accountId: row.account_id,
    authType: normalizeAuthType(row.auth_type),
    model: row.model,
    upstreamMode: row.upstream_mode,
    upstreamPath: row.upstream_path,
    status: asRequiredNumber(row.status),
    latencyMs: asRequiredNumber(row.latency_ms),
    serviceTier: asOptionalString(row.service_tier),
    serviceTierSource: normalizeServiceTierSource(row.service_tier_source),
    promptTokens: asOptionalNumber(row.prompt_tokens),
    completionTokens: asOptionalNumber(row.completion_tokens),
    totalTokens: asOptionalNumber(row.total_tokens),
    cachedPromptTokens: asOptionalNumber(row.cached_prompt_tokens),
    imageCount: asOptionalNumber(row.image_count),
    imageCostUsd: asOptionalNumber(row.image_cost_usd),
    promptCacheKeyUsed: asOptionalBoolean(row.prompt_cache_key_used),
    cacheHit: asOptionalBoolean(row.cache_hit),
    ttftMs: asOptionalNumber(row.ttft_ms),
    tps: asOptionalNumber(row.tps),
    error: asOptionalString(row.error),
    upstreamErrorCode: asOptionalString(row.upstream_error_code),
    upstreamErrorType: asOptionalString(row.upstream_error_type),
    upstreamErrorMessage: asOptionalString(row.upstream_error_message),
    factoryDiagnostics: parseFactoryDiagnostics(row.factory_diagnostics),
    costUsd: asOptionalNumber(row.cost_usd),
    energyJoules: asOptionalNumber(row.energy_joules),
    waterEvaporatedMl: asOptionalNumber(row.water_evaporated_ml),
  };
}

const ENTRY_COLUMNS = [
  "id",
  "timestamp_ms",
  "tenant_id",
  "issuer",
  "key_id",
  "provider_id",
  "account_id",
  "auth_type",
  "model",
  "upstream_mode",
  "upstream_path",
  "status",
  "latency_ms",
  "service_tier",
  "service_tier_source",
  "prompt_tokens",
  "completion_tokens",
  "total_tokens",
  "cached_prompt_tokens",
  "image_count",
  "image_cost_usd",
  "prompt_cache_key_used",
  "cache_hit",
  "ttft_ms",
  "tps",
  "error",
  "upstream_error_code",
  "upstream_error_type",
  "upstream_error_message",
  "factory_diagnostics",
  "cost_usd",
  "energy_joules",
  "water_evaporated_ml",
].join(", ");

const MAX_PAGE_SIZE = 1000;

function sanitizeLimit(limit: number | undefined, fallback: number): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return fallback;
  }

  const normalized = Math.floor(limit);
  if (normalized <= 0) {
    return fallback;
  }

  return Math.min(normalized, MAX_PAGE_SIZE);
}

export class SqlRequestUsageStore implements RequestLogMirror {
  public constructor(private readonly sql: Sql) {}

  public async init(): Promise<void> {
    await this.sql.unsafe(`
      CREATE TABLE IF NOT EXISTS request_usage_entries (
        id TEXT PRIMARY KEY,
        timestamp_ms BIGINT NOT NULL,
        tenant_id TEXT,
        issuer TEXT,
        key_id TEXT,
        provider_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        auth_type TEXT NOT NULL,
        model TEXT NOT NULL,
        upstream_mode TEXT NOT NULL,
        upstream_path TEXT NOT NULL,
        status INTEGER NOT NULL,
        latency_ms BIGINT NOT NULL,
        service_tier TEXT,
        service_tier_source TEXT NOT NULL DEFAULT 'none',
        prompt_tokens BIGINT,
        completion_tokens BIGINT,
        total_tokens BIGINT,
        cached_prompt_tokens BIGINT,
        image_count BIGINT,
        image_cost_usd DOUBLE PRECISION,
        prompt_cache_key_used BOOLEAN NOT NULL DEFAULT FALSE,
        cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
        ttft_ms BIGINT,
        tps DOUBLE PRECISION,
        error TEXT,
        upstream_error_code TEXT,
        upstream_error_type TEXT,
        upstream_error_message TEXT,
        factory_diagnostics JSONB,
        cost_usd DOUBLE PRECISION,
        energy_joules DOUBLE PRECISION,
        water_evaporated_ml DOUBLE PRECISION
      );
    `);

    await this.sql.unsafe("CREATE INDEX IF NOT EXISTS idx_request_usage_entries_ts ON request_usage_entries(timestamp_ms DESC, id DESC);");
    await this.sql.unsafe("CREATE INDEX IF NOT EXISTS idx_request_usage_entries_tenant_ts ON request_usage_entries(tenant_id, timestamp_ms DESC, id DESC);");
    await this.sql.unsafe("CREATE INDEX IF NOT EXISTS idx_request_usage_entries_account_ts ON request_usage_entries(account_id, timestamp_ms DESC, id DESC);");
    await this.sql.unsafe("CREATE INDEX IF NOT EXISTS idx_request_usage_entries_provider_ts ON request_usage_entries(provider_id, timestamp_ms DESC, id DESC);");
    await this.sql.unsafe("CREATE INDEX IF NOT EXISTS idx_request_usage_entries_provider_model_ts ON request_usage_entries(provider_id, model, timestamp_ms DESC, id DESC);");
  }

  public async upsertEntry(entry: RequestLogEntry): Promise<void> {
    await this.sql`
      INSERT INTO request_usage_entries (
        id,
        timestamp_ms,
        tenant_id,
        issuer,
        key_id,
        provider_id,
        account_id,
        auth_type,
        model,
        upstream_mode,
        upstream_path,
        status,
        latency_ms,
        service_tier,
        service_tier_source,
        prompt_tokens,
        completion_tokens,
        total_tokens,
        cached_prompt_tokens,
        image_count,
        image_cost_usd,
        prompt_cache_key_used,
        cache_hit,
        ttft_ms,
        tps,
        error,
        upstream_error_code,
        upstream_error_type,
        upstream_error_message,
        factory_diagnostics,
        cost_usd,
        energy_joules,
        water_evaporated_ml
      ) VALUES (
        ${entry.id},
        ${entry.timestamp},
        ${entry.tenantId ?? null},
        ${entry.issuer ?? null},
        ${entry.keyId ?? null},
        ${entry.providerId},
        ${entry.accountId},
        ${entry.authType},
        ${entry.model},
        ${entry.upstreamMode},
        ${entry.upstreamPath},
        ${entry.status},
        ${entry.latencyMs},
        ${entry.serviceTier ?? null},
        ${entry.serviceTierSource},
        ${entry.promptTokens ?? null},
        ${entry.completionTokens ?? null},
        ${entry.totalTokens ?? null},
        ${entry.cachedPromptTokens ?? null},
        ${entry.imageCount ?? null},
        ${entry.imageCostUsd ?? null},
        ${entry.promptCacheKeyUsed === true},
        ${entry.cacheHit === true},
        ${entry.ttftMs ?? null},
        ${entry.tps ?? null},
        ${entry.error ?? null},
        ${entry.upstreamErrorCode ?? null},
        ${entry.upstreamErrorType ?? null},
        ${entry.upstreamErrorMessage ?? null},
        ${entry.factoryDiagnostics ? JSON.stringify(entry.factoryDiagnostics) : null}::jsonb,
        ${entry.costUsd ?? null},
        ${entry.energyJoules ?? null},
        ${entry.waterEvaporatedMl ?? null}
      )
      ON CONFLICT (id) DO UPDATE SET
        timestamp_ms = EXCLUDED.timestamp_ms,
        tenant_id = EXCLUDED.tenant_id,
        issuer = EXCLUDED.issuer,
        key_id = EXCLUDED.key_id,
        provider_id = EXCLUDED.provider_id,
        account_id = EXCLUDED.account_id,
        auth_type = EXCLUDED.auth_type,
        model = EXCLUDED.model,
        upstream_mode = EXCLUDED.upstream_mode,
        upstream_path = EXCLUDED.upstream_path,
        status = EXCLUDED.status,
        latency_ms = EXCLUDED.latency_ms,
        service_tier = EXCLUDED.service_tier,
        service_tier_source = EXCLUDED.service_tier_source,
        prompt_tokens = EXCLUDED.prompt_tokens,
        completion_tokens = EXCLUDED.completion_tokens,
        total_tokens = EXCLUDED.total_tokens,
        cached_prompt_tokens = EXCLUDED.cached_prompt_tokens,
        image_count = EXCLUDED.image_count,
        image_cost_usd = EXCLUDED.image_cost_usd,
        prompt_cache_key_used = EXCLUDED.prompt_cache_key_used,
        cache_hit = EXCLUDED.cache_hit,
        ttft_ms = EXCLUDED.ttft_ms,
        tps = EXCLUDED.tps,
        error = EXCLUDED.error,
        upstream_error_code = EXCLUDED.upstream_error_code,
        upstream_error_type = EXCLUDED.upstream_error_type,
        upstream_error_message = EXCLUDED.upstream_error_message,
        factory_diagnostics = EXCLUDED.factory_diagnostics,
        cost_usd = EXCLUDED.cost_usd,
        energy_joules = EXCLUDED.energy_joules,
        water_evaporated_ml = EXCLUDED.water_evaporated_ml
    `;
  }

  private buildWhere(
    filters: Omit<RequestLogFilters, "limit" | "before"> & { readonly sinceMs?: number },
    cursor?: { readonly timestampMs: number; readonly id: string },
  ): { readonly where: string; readonly values: unknown[] } {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let index = 1;

    if (typeof filters.sinceMs === "number" && Number.isFinite(filters.sinceMs)) {
      conditions.push(`timestamp_ms >= $${index++}`);
      values.push(filters.sinceMs);
    }

    if (filters.providerId) {
      conditions.push(`provider_id = $${index++}`);
      values.push(filters.providerId);
    }

    if (filters.accountId) {
      conditions.push(`account_id = $${index++}`);
      values.push(filters.accountId);
    }

    if (filters.tenantId) {
      conditions.push(`tenant_id = $${index++}`);
      values.push(filters.tenantId);
    }

    if (filters.issuer) {
      conditions.push(`issuer = $${index++}`);
      values.push(filters.issuer);
    }

    if (filters.keyId) {
      conditions.push(`key_id = $${index++}`);
      values.push(filters.keyId);
    }

    if (cursor) {
      conditions.push(`(timestamp_ms < $${index} OR (timestamp_ms = $${index} AND id < $${index + 1}))`);
      values.push(cursor.timestampMs, cursor.id);
      index += 2;
    }

    return {
      where: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
      values,
    };
  }

  public async listEntriesSince(
    sinceMs: number,
    filters: Omit<RequestLogFilters, "limit" | "before"> = {},
  ): Promise<RequestLogEntry[]> {
    const queryFilters = { ...filters, sinceMs };
    const { where, values } = this.buildWhere(queryFilters);
    const rows = await this.sql.unsafe<RequestUsageRow[]>(
      `SELECT ${ENTRY_COLUMNS} FROM request_usage_entries ${where} ORDER BY timestamp_ms ASC, id ASC`,
      values as (string | number | boolean | null)[],
    );
    return rows.map(toEntry);
  }

  public async listEntries(filters: RequestLogFilters = {}): Promise<RequestLogEntry[]> {
    const limit = sanitizeLimit(filters.limit, 200);
    let cursor: { readonly timestampMs: number; readonly id: string } | undefined;

    if (typeof filters.before === "string" && filters.before.length > 0) {
      const cursorRows = await this.sql.unsafe<CursorRow[]>(
        "SELECT id, timestamp_ms FROM request_usage_entries WHERE id = $1 LIMIT 1",
        [filters.before],
      );
      const cursorRow = cursorRows[0];
      if (!cursorRow) {
        return [];
      }

      cursor = {
        timestampMs: asRequiredNumber(cursorRow.timestamp_ms),
        id: cursorRow.id,
      };
    }

    const { where, values } = this.buildWhere(filters, cursor);
    const rows = await this.sql.unsafe<RequestUsageRow[]>(
      `SELECT ${ENTRY_COLUMNS} FROM request_usage_entries ${where} ORDER BY timestamp_ms DESC, id DESC LIMIT ${limit}`,
      values as (string | number | boolean | null)[],
    );
    return rows.map(toEntry);
  }

  public async getCoverage(filters: Omit<RequestLogFilters, "limit" | "before"> = {}): Promise<RequestUsageCoverage> {
    const { where, values } = this.buildWhere(filters);
    const rows = await this.sql.unsafe<CoverageRow[]>(
      `SELECT MIN(timestamp_ms) AS earliest_entry_at_ms, COUNT(*)::BIGINT AS retained_entry_count FROM request_usage_entries ${where}`,
      values as (string | number | boolean | null)[],
    );
    const row = rows[0];
    const retainedEntryCount = row ? asRequiredNumber(row.retained_entry_count) : 0;
    const earliestEntryAtMs = row ? asOptionalNumber(row.earliest_entry_at_ms) ?? null : null;

    return {
      earliestEntryAtMs,
      retainedEntryCount,
      maxRetainedEntries: retainedEntryCount,
    };
  }
}
