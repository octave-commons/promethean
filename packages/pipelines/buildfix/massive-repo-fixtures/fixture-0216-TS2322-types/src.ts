export type Millis = number;

export type CacheOptions = Readonly<{
  /** filesystem path for LMDB */
  path: string;
  /** default TTL applied by set() when none provided */
  defaultTtlMs?: Millis;
  /** key namespace/prefix (purely logical; not a sublevel dep) */
  namespace?: string;
}>;

export type PutOptions = Readonly<{ ttlMs?: Millis }>;

export type Cache<T = unknown> = Readonly<{
  get: (key: string) => Promise<T | undefined>;
  has: (key: string) => Promise<boolean>;
  set: (key: string, value: T, opts?: PutOptions) => Promise<void>;
  del: (key: string) => Promise<void>;

  /** batch put/del with ttl per-put (no mutation of input) */
  batch: (
    ops: ReadonlyArray<
      | { type: "put"; key: string; value: T; ttlMs?: Millis }
      | { type: "del"; key: string }
    >,
  ) => Promise<void>;

  /** lazy iterator over non-expired entries (namespaced) */
  entries: (opts?: Readonly<{ limit?: string }>) => AsyncGenerator<[string, T]>;

  /** delete expired keys; returns count deleted */
  sweepExpired: () => Promise<number>;

  /** create a new namespaced view (pure) */
  withNamespace: (ns: string) => Cache<T>;

  /** close db */
  close: () => Promise<void>;
}>;