import type { ProviderCredential } from "./key-pool.js";

export interface TokenRefreshManagerConfig {
  readonly maxConcurrency: number;
  readonly backgroundIntervalMs: number;
  readonly expiryBufferMs: number;
  readonly proactiveRefreshWindowMs: number;
  readonly maxConsecutiveFailures: number;
}

export const DEFAULT_REFRESH_CONFIG: TokenRefreshManagerConfig = {
  maxConcurrency: 5,
  backgroundIntervalMs: 60_000,
  expiryBufferMs: 60_000,
  proactiveRefreshWindowMs: 5 * 60_000,
  maxConsecutiveFailures: 3,
};

export type RefreshFn = (credential: ProviderCredential) => Promise<ProviderCredential | null>;

export type Logger = {
  info(obj: Record<string, unknown>, msg: string): void;
  warn(obj: Record<string, unknown>, msg: string): void;
};

interface RefreshFailureRecord {
  consecutiveFailures: number;
  lastFailureAt: number;
  backoffUntil: number;
}

export class TokenRefreshManager {
  private readonly inFlight = new Map<string, Promise<ProviderCredential | null>>();
  private readonly failures = new Map<string, RefreshFailureRecord>();
  private backgroundTimer: ReturnType<typeof setInterval> | null = null;
  private stopped = false;
  private readonly config: TokenRefreshManagerConfig;

  public constructor(
    private readonly doRefresh: RefreshFn,
    private readonly logger: Logger,
    config: Partial<TokenRefreshManagerConfig> = {},
  ) {
    this.config = { ...DEFAULT_REFRESH_CONFIG, ...config };
  }

  public async refresh(credential: ProviderCredential): Promise<ProviderCredential | null> {
    const key = this.accountKey(credential);

    if (this.stopped) {
      return null;
    }

    if (this.isBackedOff(key)) {
      return null;
    }

    const existing = this.inFlight.get(key);
    if (existing) {
      return existing;
    }

    const promise = this.doRefresh(credential)
      .then((result) => {
        this.recordSuccess(key);
        return result;
      })
      .catch((error) => {
        this.recordFailure(key);
        this.logger.warn(
          { accountId: credential.accountId, error: String(error) },
          "token refresh failed",
        );
        return null;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, promise);
    return promise;
  }

  public async refreshBatch(
    credentials: readonly ProviderCredential[],
  ): Promise<(ProviderCredential | null)[]> {
    const results: (ProviderCredential | null)[] = [];
    const queue = [...credentials];
    let cursor = 0;

    while (cursor < queue.length) {
      const batch = queue.slice(cursor, cursor + this.config.maxConcurrency);
      const batchResults = await Promise.allSettled(
        batch.map((cred) => this.refresh(cred)),
      );
      for (const result of batchResults) {
        results.push(result.status === "fulfilled" ? result.value : null);
      }
      cursor += batch.length;
    }

    return results;
  }

  public startBackgroundRefresh(
    getExpiringAccounts: () => ProviderCredential[],
  ): void {
    if (this.backgroundTimer) {
      return;
    }

    this.stopped = false;

    this.backgroundTimer = setInterval(async () => {
      try {
        const expiring = getExpiringAccounts();
        if (expiring.length === 0) return;

        this.logger.info(
          { count: expiring.length },
          "background: refreshing soon-expiring tokens",
        );
        await this.refreshBatch(expiring);
      } catch {
        // swallow — individual failures already logged per-account
      }
    }, this.config.backgroundIntervalMs);

    this.backgroundTimer.unref?.();
  }

  public stopBackgroundRefresh(): void {
    if (this.backgroundTimer) {
      clearInterval(this.backgroundTimer);
      this.backgroundTimer = null;
    }
  }

  public async stopAndWait(): Promise<void> {
    this.stopped = true;
    this.stopBackgroundRefresh();

    while (this.inFlight.size > 0) {
      const pending = [...this.inFlight.values()];
      await Promise.allSettled(pending);
    }
  }

  public get pendingCount(): number {
    return this.inFlight.size;
  }

  public isAccountBackedOff(credential: ProviderCredential): boolean {
    return this.isBackedOff(this.accountKey(credential));
  }

  public getFailureRecord(credential: ProviderCredential): RefreshFailureRecord | undefined {
    return this.failures.get(this.accountKey(credential));
  }

  public clearFailures(credential: ProviderCredential): void {
    this.failures.delete(this.accountKey(credential));
  }

  private accountKey(credential: ProviderCredential): string {
    return `${credential.providerId}\0${credential.accountId}`;
  }

  private isBackedOff(key: string): boolean {
    const record = this.failures.get(key);
    if (!record) return false;
    if (record.consecutiveFailures >= this.config.maxConsecutiveFailures) {
      return Date.now() < record.backoffUntil;
    }
    return false;
  }

  private recordSuccess(key: string): void {
    this.failures.delete(key);
  }

  private recordFailure(key: string): void {
    const existing = this.failures.get(key);
    const count = (existing?.consecutiveFailures ?? 0) + 1;
    const backoffMs = Math.min(30_000 * Math.pow(2, count - 1), 10 * 60_000);
    this.failures.set(key, {
      consecutiveFailures: count,
      lastFailureAt: Date.now(),
      backoffUntil: Date.now() + backoffMs,
    });
  }
}
