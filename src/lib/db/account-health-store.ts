import type { Sql } from "./index.js";
import type { ProviderCredential } from "../key-pool.js";
import {
  SELECT_ALL_ACCOUNT_HEALTH,
  UPSERT_ACCOUNT_HEALTH_SUCCESS,
  UPSERT_ACCOUNT_HEALTH_FAILURE,
} from "./schema.js";

interface HealthRow {
  provider_id: string;
  account_id: string;
  success_count: string;
  failure_count: string;
  last_success_at: string | null;
  last_failure_at: string | null;
  last_error: string | null;
  last_status: string | null;
}

interface AccountHealth {
  providerId: string;
  accountId: string;
  successCount: number;
  failureCount: number;
  lastSuccessAt: number | null;
  lastFailureAt: number | null;
  lastError: string | null;
  lastStatus: number | null;
}

export interface HealthScore {
  providerId: string;
  accountId: string;
  score: number;
  successCount: number;
  failureCount: number;
}

function healthKey(providerId: string, accountId: string): string {
  return `${providerId}\0${accountId}`;
}

function parseHealthRow(row: HealthRow): AccountHealth {
  return {
    providerId: row.provider_id,
    accountId: row.account_id,
    successCount: Number.parseInt(row.success_count, 10) || 0,
    failureCount: Number.parseInt(row.failure_count, 10) || 0,
    lastSuccessAt: row.last_success_at ? Number.parseInt(row.last_success_at, 10) : null,
    lastFailureAt: row.last_failure_at ? Number.parseInt(row.last_failure_at, 10) : null,
    lastError: row.last_error,
    lastStatus: row.last_status ? Number.parseInt(row.last_status, 10) : null,
  };
}

function computeHealthScore(health: AccountHealth, expiresAt?: number): number {
  const now = Date.now();
  
  if (expiresAt && expiresAt <= now) {
    return 0.1;
  }

  const total = health.successCount + health.failureCount;
  if (total === 0) {
    return 0.5;
  }

  const successRate = health.successCount / total;
  
  let recencyBonus = 0;
  if (health.lastSuccessAt) {
    const hoursSinceSuccess = (now - health.lastSuccessAt) / (1000 * 60 * 60);
    if (hoursSinceSuccess < 1) {
      recencyBonus = 0.1;
    } else if (hoursSinceSuccess < 24) {
      recencyBonus = 0.05;
    }
  }

  let failurePenalty = 0;
  if (health.lastFailureAt) {
    const hoursSinceFailure = (now - health.lastFailureAt) / (1000 * 60 * 60);
    if (hoursSinceFailure < 1) {
      failurePenalty = 0.2;
    } else if (hoursSinceFailure < 6) {
      failurePenalty = 0.1;
    }
  }

  const sampleSizeBonus = Math.min(total / 100, 0.05);

  return Math.max(0, Math.min(1, successRate + recencyBonus - failurePenalty + sampleSizeBonus));
}

export class AccountHealthStore {
  private readonly healthByAccount = new Map<string, AccountHealth>();
  private readonly pendingWrites: Array<{
    type: "success" | "failure";
    providerId: string;
    accountId: string;
    timestamp: number;
    status: number;
    error?: string;
  }> = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private initialized = false;

  public constructor(
    private readonly sql: Sql,
    private readonly flushIntervalMs: number = 5000,
  ) {}

  public async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const rows = await this.sql.unsafe<HealthRow[]>(SELECT_ALL_ACCOUNT_HEALTH);
      for (const row of rows) {
        const health = parseHealthRow(row);
        this.healthByAccount.set(healthKey(health.providerId, health.accountId), health);
      }
    } catch (e) {
      const code = typeof e === "object" && e !== null && "code" in e
        ? (e as { readonly code?: unknown }).code
        : undefined;

      // Ignore "table not found" (migrations may not have run yet).
      if (code === "42P01") {
        // account_health does not exist
      } else {
        console.error("AccountHealthStore.init failed", {
          query: SELECT_ALL_ACCOUNT_HEALTH,
          error: e,
        });
        throw e;
      }
    }

    this.startFlushTimer();
    this.initialized = true;
  }

  public recordSuccess(credential: ProviderCredential, status: number): void {
    const key = healthKey(credential.providerId, credential.accountId);
    const existing = this.healthByAccount.get(key);
    const now = Date.now();

    if (existing) {
      existing.successCount += 1;
      existing.lastSuccessAt = now;
      existing.lastStatus = status;
    } else {
      this.healthByAccount.set(key, {
        providerId: credential.providerId,
        accountId: credential.accountId,
        successCount: 1,
        failureCount: 0,
        lastSuccessAt: now,
        lastFailureAt: null,
        lastError: null,
        lastStatus: status,
      });
    }

    this.pendingWrites.push({
      type: "success",
      providerId: credential.providerId,
      accountId: credential.accountId,
      timestamp: now,
      status,
    });
  }

  public recordFailure(
    credential: ProviderCredential,
    status: number,
    error?: string,
  ): void {
    const key = healthKey(credential.providerId, credential.accountId);
    const existing = this.healthByAccount.get(key);
    const now = Date.now();

    if (existing) {
      existing.failureCount += 1;
      existing.lastFailureAt = now;
      existing.lastError = error ?? null;
      existing.lastStatus = status;
    } else {
      this.healthByAccount.set(key, {
        providerId: credential.providerId,
        accountId: credential.accountId,
        successCount: 0,
        failureCount: 1,
        lastSuccessAt: null,
        lastFailureAt: now,
        lastError: error ?? null,
        lastStatus: status,
      });
    }

    this.pendingWrites.push({
      type: "failure",
      providerId: credential.providerId,
      accountId: credential.accountId,
      timestamp: now,
      status,
      error,
    });
  }

  public getHealthScore(providerId: string, accountId: string, expiresAt?: number): number {
    const key = healthKey(providerId, accountId);
    const health = this.healthByAccount.get(key);
    if (!health) {
      if (expiresAt && expiresAt <= Date.now()) {
        return 0.1;
      }
      return 0.5;
    }
    return computeHealthScore(health, expiresAt);
  }

  public getAllHealthScores(): HealthScore[] {
    const scores: HealthScore[] = [];
    for (const health of this.healthByAccount.values()) {
      scores.push({
        providerId: health.providerId,
        accountId: health.accountId,
        score: computeHealthScore(health),
        successCount: health.successCount,
        failureCount: health.failureCount,
      });
    }
    return scores.sort((a, b) => b.score - a.score);
  }

  public sortCredentialsByHealth(
    credentials: readonly ProviderCredential[],
  ): ProviderCredential[] {
    const withScores = credentials.map((cred) => ({
      cred,
      score: this.getHealthScore(cred.providerId, cred.accountId),
    }));

    withScores.sort((a, b) => b.score - a.score);
    return withScores.map((item) => item.cred);
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      return;
    }
    this.flushTimer = setInterval(() => {
      this.flushPendingWrites().catch(() => {
        // Ignore flush errors
      });
    }, this.flushIntervalMs);
  }

  public async flushPendingWrites(): Promise<void> {
    if (this.pendingWrites.length === 0) {
      return;
    }

    const writes = this.pendingWrites.splice(0, this.pendingWrites.length);

    type SuccessAggregate = {
      providerId: string;
      accountId: string;
      count: number;
      lastSuccessAt: number;
      lastStatus: number;
    };

    type FailureAggregate = {
      providerId: string;
      accountId: string;
      count: number;
      lastFailureAt: number;
      lastError: string | null;
      lastStatus: number;
    };

    const successes = new Map<string, SuccessAggregate>();
    const failures = new Map<string, FailureAggregate>();

    let lastWriteType: "success" | "failure" = "success";
    let lastWriteTimestamp = 0;

    for (const write of writes) {
      if (write.timestamp >= lastWriteTimestamp) {
        lastWriteTimestamp = write.timestamp;
        lastWriteType = write.type;
      }

      const key = healthKey(write.providerId, write.accountId);
      if (write.type === "success") {
        const current = successes.get(key);
        if (current) {
          current.count += 1;
          if (write.timestamp >= current.lastSuccessAt) {
            current.lastSuccessAt = write.timestamp;
            current.lastStatus = write.status;
          }
        } else {
          successes.set(key, {
            providerId: write.providerId,
            accountId: write.accountId,
            count: 1,
            lastSuccessAt: write.timestamp,
            lastStatus: write.status,
          });
        }
      } else {
        const current = failures.get(key);
        if (current) {
          current.count += 1;
          if (write.timestamp >= current.lastFailureAt) {
            current.lastFailureAt = write.timestamp;
            current.lastError = write.error ?? null;
            current.lastStatus = write.status;
          }
        } else {
          failures.set(key, {
            providerId: write.providerId,
            accountId: write.accountId,
            count: 1,
            lastFailureAt: write.timestamp,
            lastError: write.error ?? null,
            lastStatus: write.status,
          });
        }
      }
    }

    const aggregatesSuccess = [...successes.values()];
    const aggregatesFailure = [...failures.values()];
    const BATCH_SIZE = 200;

    const flushSuccessChunk = async (chunk: readonly SuccessAggregate[]): Promise<void> => {
      if (chunk.length === 0) return;

      const updatedAt = Date.now();
      const values: Array<string | number | null> = [];
      const placeholders: string[] = [];

      for (let i = 0; i < chunk.length; i++) {
        const row = chunk[i]!;
        const base = i * 6;
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`);
        values.push(
          row.providerId,
          row.accountId,
          row.count,
          row.lastSuccessAt,
          row.lastStatus,
          updatedAt,
        );
      }

      const query = `
WITH input(provider_id, account_id, success_count, last_success_at, last_status, updated_at) AS (
  VALUES ${placeholders.join(", ")}
)
INSERT INTO account_health (provider_id, account_id, success_count, last_success_at, last_status, updated_at)
SELECT
  input.provider_id,
  input.account_id,
  input.success_count::bigint,
  input.last_success_at::bigint,
  input.last_status::integer,
  input.updated_at::bigint
FROM input
WHERE EXISTS (
  SELECT 1 FROM accounts
  WHERE accounts.id = input.account_id AND accounts.provider_id = input.provider_id
)
ON CONFLICT (provider_id, account_id) DO UPDATE SET
  success_count = account_health.success_count + EXCLUDED.success_count,
  last_success_at = EXCLUDED.last_success_at,
  last_status = EXCLUDED.last_status,
  updated_at = EXCLUDED.updated_at;
`;

      await this.sql.unsafe(query, values);
    };

    const flushFailureChunk = async (chunk: readonly FailureAggregate[]): Promise<void> => {
      if (chunk.length === 0) return;

      const updatedAt = Date.now();
      const values: Array<string | number | null> = [];
      const placeholders: string[] = [];

      for (let i = 0; i < chunk.length; i++) {
        const row = chunk[i]!;
        const base = i * 7;
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`);
        values.push(
          row.providerId,
          row.accountId,
          row.count,
          row.lastFailureAt,
          row.lastError,
          row.lastStatus,
          updatedAt,
        );
      }

      const query = `
WITH input(provider_id, account_id, failure_count, last_failure_at, last_error, last_status, updated_at) AS (
  VALUES ${placeholders.join(", ")}
)
INSERT INTO account_health (provider_id, account_id, failure_count, last_failure_at, last_error, last_status, updated_at)
SELECT
  input.provider_id,
  input.account_id,
  input.failure_count::bigint,
  input.last_failure_at::bigint,
  input.last_error,
  input.last_status::integer,
  input.updated_at::bigint
FROM input
WHERE EXISTS (
  SELECT 1 FROM accounts
  WHERE accounts.id = input.account_id AND accounts.provider_id = input.provider_id
)
ON CONFLICT (provider_id, account_id) DO UPDATE SET
  failure_count = account_health.failure_count + EXCLUDED.failure_count,
  last_failure_at = EXCLUDED.last_failure_at,
  last_error = EXCLUDED.last_error,
  last_status = EXCLUDED.last_status,
  updated_at = EXCLUDED.updated_at;
`;

      await this.sql.unsafe(query, values);
    };

    const flushSuccesses = async (): Promise<void> => {
      for (let i = 0; i < aggregatesSuccess.length; i += BATCH_SIZE) {
        const chunk = aggregatesSuccess.slice(i, i + BATCH_SIZE);
        try {
          await flushSuccessChunk(chunk);
        } catch {
          // Ignore batch errors
        }
      }
    };

    const flushFailures = async (): Promise<void> => {
      for (let i = 0; i < aggregatesFailure.length; i += BATCH_SIZE) {
        const chunk = aggregatesFailure.slice(i, i + BATCH_SIZE);
        try {
          await flushFailureChunk(chunk);
        } catch {
          // Ignore batch errors
        }
      }
    };

    // Try to preserve the semantics of last_status by flushing the other type first.
    if (lastWriteType === "success") {
      await flushFailures();
      await flushSuccesses();
    } else {
      await flushSuccesses();
      await flushFailures();
    }
  }

  public async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flushPendingWrites();
  }
}
