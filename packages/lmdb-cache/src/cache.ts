import { mkdir } from 'node:fs/promises';
import { open } from 'lmdb';

import type { Cache, CacheOptions, Millis, PutOptions } from './types.js';

/**
 * Internal on-disk envelope. Keep it tiny.
 * v: value, x: expiry epoch ms (optional)
 */
type Envelope<T> = Readonly<{ v: T; x?: Millis }>;

const now = (): Millis => Date.now();
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_NAMESPACE = 'default';

/** deterministic, reversible namespacing (no mutation) */
const joinKey = (ns: string | undefined, key: string): string => (ns ? `${ns}\u241F${key}` : key); // \u241F = SYMBOL FOR UNIT SEPARATOR

const composeNamespace = (base: string | undefined, ns: string): string =>
  base ? `${base}/${ns}` : ns;

const prefixFor = (ns: string | undefined): string => (ns ? `${ns}\u241F` : '');

/** unwrap, checking TTL; returns [value, expired?] */
const unwrap = <T>(env: Envelope<T> | undefined): readonly [T | undefined, boolean] => {
  if (env == null) return [undefined, false];
  const expired = typeof env.x === 'number' && env.x <= now();
  return [expired ? undefined : (env.v as T), expired];
};

const envelopeFor = <T>(value: T, ttl: Millis | undefined): Envelope<T> =>
  typeof ttl === 'number' ? { v: value, x: now() + ttl } : { v: value };

const rangeForNamespace = (
  namespace: string | undefined,
  limit?: number,
): Record<string, unknown> => {
  const prefix = prefixFor(namespace);
  return {
    gte: prefix,
    lt: prefix ? `${prefix}\uFFFF` : undefined,
    limit,
  };
};

type CacheScopeState = Readonly<{
  namespace: string;
  defaultTtlMs: Millis;
}>;

type HitMissCounters = { hit: number; miss: number };

const namespacedKey = (state: CacheScopeState, key: string): string =>
  joinKey(state.namespace, key);

const resolveScopeState = (options: CacheOptions): CacheScopeState => ({
  namespace: options.namespace ?? DEFAULT_NAMESPACE,
  defaultTtlMs: options.defaultTtlMs ?? DEFAULT_TTL_MS,
});

const createGet =
  <T>(db: any, state: CacheScopeState, counters: HitMissCounters): Cache<T>['get'] =>
  async (key: string) => {
    const scoped = namespacedKey(state, key);
    const env = db.get(scoped) as Envelope<T> | undefined;
    const [value, expired] = unwrap(env);

    if (expired) {
      db.removeSync?.(scoped) ?? (await db.remove(scoped));
      counters.miss++;
      return undefined;
    }

    if (value === undefined) {
      counters.miss++;
      return undefined;
    }

    counters.hit++;
    return value;
  };

const createHas =
  <T>(get: Cache<T>['get']): Cache<T>['has'] =>
  async (key: string) =>
    (await get(key)) !== undefined;

const createSet =
  <T>(db: any, state: CacheScopeState): Cache<T>['set'] =>
  async (key, value, putOpts) => {
    const ttl = putOpts?.ttlMs ?? state.defaultTtlMs;
    await db.put(namespacedKey(state, key), envelopeFor(value, ttl));
  };

const createDel =
  <T>(db: any, state: CacheScopeState): Cache<T>['del'] =>
  async (key) => {
    await db.remove(namespacedKey(state, key));
  };

const createBatch =
  <T>(db: any, state: CacheScopeState): Cache<T>['batch'] =>
  async (ops) => {
    await db.transaction(() => {
      for (const op of ops) {
        const scoped = namespacedKey(state, op.key);
        if (op.type === 'put') {
          const ttl = op.ttlMs ?? state.defaultTtlMs;
          db.putSync?.(scoped, envelopeFor(op.value, ttl)) ??
            db.put(scoped, envelopeFor(op.value, ttl));
        } else {
          db.removeSync?.(scoped) ?? db.remove(scoped);
        }
      }
    });
  };

const createEntries = <T>(db: any, state: CacheScopeState): Cache<T>['entries'] =>
  async function* entries(opts = {}) {
    const namespace = opts?.namespace ?? state.namespace;
    const prefix = prefixFor(namespace);

    for await (const [storedKey, env] of db.getRange({
      gte: prefix,
      lt: prefix ? `${prefix}\uFFFF` : undefined,
      limit: opts?.limit,
    })) {
      const [value, expired] = unwrap(env as Envelope<T> | undefined);
      if (expired) {
        await db.remove(storedKey);
        continue;
      }
      if (value === undefined) continue;

      const logicalKey = prefix ? storedKey.slice(prefix.length) : storedKey;
      yield [logicalKey, value as T];
    }
  };

const createSweepExpired =
  <T>(db: any): Cache<T>['sweepExpired'] =>
  async () => {
    let deletedCount = 0;

    await db.transaction(async () => {
      for await (const [key, env] of db.getRange()) {
        const [, expired] = unwrap(env as Envelope<T> | undefined);
        if (!expired) continue;
        await db.remove(key);
        deletedCount++;
      }
    });

    return deletedCount;
  };

const collectStats = async <T>(db: any, state: CacheScopeState) => {
  let totalEntries = 0;
  let expiredEntries = 0;
  const namespaces = new Set<string>();
  const range = rangeForNamespace(state.namespace);

  for await (const [key, env] of db.getRange(range)) {
    totalEntries++;
    const [, expired] = unwrap(env as Envelope<T> | undefined);
    if (expired) {
      expiredEntries++;
    }

    const keyParts = key.split('\u241F');
    if (keyParts.length > 1 && keyParts[0]) {
      namespaces.add(keyParts[0]);
    }
  }

  if (namespaces.size === 0 && state.namespace) {
    namespaces.add(state.namespace);
  }

  return {
    totalEntries,
    expiredEntries,
    namespaces: Array.from(namespaces),
  } as const;
};

const createGetStats =
  <T>(db: any, state: CacheScopeState, counters: HitMissCounters): Cache<T>['getStats'] =>
  async () => {
    const { totalEntries, expiredEntries, namespaces } = await collectStats<T>(db, state);
    const totalAccesses = counters.hit + counters.miss;
    const hitRate = totalAccesses > 0 ? counters.hit / totalAccesses : 0;

    return {
      totalEntries,
      expiredEntries,
      namespaces,
      hitRate,
    };
  };

const buildCacheScope = <T>(
  db: any,
  state: CacheScopeState,
  counters: HitMissCounters,
): Cache<T> => {
  const get = createGet<T>(db, state, counters);

  return {
    get,
    has: createHas(get),
    set: createSet(db, state),
    del: createDel(db, state),
    batch: createBatch(db, state),
    entries: createEntries(db, state),
    sweepExpired: createSweepExpired(db),
    getStats: createGetStats(db, state, counters),
    withNamespace: (ns: string): Cache<T> => {
      const namespace = ns ? composeNamespace(state.namespace, ns) : DEFAULT_NAMESPACE;
      const childState: CacheScopeState = {
        namespace,
        defaultTtlMs: state.defaultTtlMs,
      };
      return buildCacheScope<T>(db, childState, counters);
    },
    close: async () => {
      await db.close();
    },
  };
};

export function openLmdbCache<T = unknown>(options: CacheOptions): Cache<T> {
  if (options.path) {
    void mkdir(options.path, { recursive: true });
  }

  const db = open<Envelope<T>, string>(options.path, {
    encoding: 'msgpack',
    compression: true,
    useVersions: true,
    noSubdir: false,
  }) as any;

  const counters: HitMissCounters = { hit: 0, miss: 0 };
  const state = resolveScopeState(options);
  return buildCacheScope<T>(db, state, counters);
}

// Export class for backward compatibility
export class LMDBCache<T> implements Cache<T> {
  private readonly cache: Cache<T>;

  constructor(path: string, options: Omit<CacheOptions, 'path'> = {}) {
    const mergedOptions: CacheOptions = { ...options, path };
    this.cache = openLmdbCache<T>(mergedOptions);
  }

  async get(key: string): Promise<T | undefined> {
    return this.cache.get(key);
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  async set(key: string, value: T, opts?: PutOptions): Promise<void> {
    return this.cache.set(key, value, opts);
  }

  async del(key: string): Promise<void> {
    return this.cache.del(key);
  }

  async batch(ops: Parameters<Cache<T>['batch']>[0]): Promise<void> {
    return this.cache.batch(ops);
  }

  async *entries(opts?: Parameters<Cache<T>['entries']>[0]): AsyncGenerator<[string, T]> {
    yield* this.cache.entries(opts);
  }

  async sweepExpired(): Promise<number> {
    return this.cache.sweepExpired();
  }

  async getStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    namespaces: readonly string[];
    hitRate: number;
  }> {
    return this.cache.getStats();
  }

  withNamespace(ns: string): Cache<T> {
    return this.cache.withNamespace(ns);
  }

  async close(): Promise<void> {
    return this.cache.close();
  }
}
