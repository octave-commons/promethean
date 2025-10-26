export type Millis = number;

export type CacheOptions = Readonly<{
  /** filesystem path for LMDB */
  path: string;
  /** default TTL applied by set() when none provided */
  defaultTtlMs?: Millis;
  /** key namespace/prefix (purely logical; not a sublevel dep) */
  namespace?: string;
  /** maximum number of entries before eviction */
  maxEntries?: number;
  /** cleanup interval in milliseconds */
  cleanupIntervalMs?: Millis;
}>;

export type PutOptions = Readonly<{ ttlMs?: Millis }>;

export type CacheEntry<T = unknown> = Readonly<{
  key: string;
  value: T;
  expiresAt?: Millis;
  namespace?: string;
}>;

export type CacheStats = Readonly<{
  totalEntries: number;
  expiredEntries: number;
  namespaces: readonly string[];
  hitRate: number;
}>;

export type Cache<T = unknown> = Readonly<{
  get: (key: string) => Promise<T | undefined>;
  has: (key: string) => Promise<boolean>;
  set: (key: string, value: T, opts?: PutOptions) => Promise<void>;
  del: (key: string) => Promise<void>;

  /** batch put/del with ttl per-put (no mutation of input) */
  batch: (
    ops: ReadonlyArray<
      { type: 'put'; key: string; value: T; ttlMs?: Millis } | { type: 'del'; key: string }
    >,
  ) => Promise<void>;

  /** lazy iterator over non-expired entries (namespaced) */
  entries: (opts?: Readonly<{ limit?: number; namespace?: string }>) => AsyncGenerator<[string, T]>;

  /** delete expired keys; returns count deleted */
  sweepExpired: () => Promise<number>;

  /** get cache statistics */
  getStats: () => Promise<CacheStats>;

  /** create a new namespaced view (pure) */
  withNamespace: (ns: string) => Cache<T>;

  /** close db */
  close: () => Promise<void>;
}>;
