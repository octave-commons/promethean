// Import LMDB with CommonJS compatibility
import lmdb from 'lmdb';
const { open } = lmdb;
type Database<V = any, K extends lmdb.Key = lmdb.Key> = lmdb.Database<V, K>;

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

/** unwrap, checking TTL; returns [value, expired?] */
const unwrap = <T>(env: Envelope<T> | undefined): readonly [T | undefined, boolean] => {
  if (env == null) return [undefined, false];
  const expired = typeof env.x === 'number' && env.x <= now();
  return [expired ? undefined : env.v, expired];
};

type CacheScopeState = Readonly<{
  namespace?: string;
  defaultTtlMs?: Millis;
}>;

const namespacedKey = (state: CacheScopeState, key: string): string =>
  joinKey(state.namespace, key);

const envelopeFor = <T>(value: T, ttl: Millis | undefined): Envelope<T> =>
  typeof ttl === 'number' ? { v: value, x: now() + ttl } : { v: value };

const createGet =
  <T>(db: Database<string, Envelope<T>>, state: CacheScopeState): Cache<T>['get'] =>
  async (key: string) => {
    const scoped = namespacedKey(state, key);
    const env = db.get(scoped);
    const [value, expired] = unwrap(env);
    if (expired) await db.remove(scoped);
    return value;
  };

const createHas =
  <T>(get: Cache<T>['get']): Cache<T>['has'] =>
  async (key: string) =>
    (await get(key)) !== undefined;

const createSet =
  <T>(db: Database<string, Envelope<T>>, state: CacheScopeState): Cache<T>['set'] =>
  async (key, value, putOpts) => {
    const ttl = putOpts?.ttlMs ?? state.defaultTtlMs;
    await db.put(namespacedKey(state, key), envelopeFor(value, ttl));
  };

const createDel =
  <T>(db: Database<string, Envelope<T>>, state: CacheScopeState): Cache<T>['del'] =>
  async (key) => {
    await db.remove(namespacedKey(state, key));
  };

const createBatch =
  <T>(db: Database<string, Envelope<T>>, state: CacheScopeState): Cache<T>['batch'] =>
  async (ops) => {
    const transaction = db.transaction();
    try {
      for (const op of ops) {
        const key = namespacedKey(state, op.key);
        if (op.type === 'del') {
          transaction.remove(key);
        } else {
          const ttl = op.ttlMs ?? state.defaultTtlMs;
          transaction.put(key, envelopeFor(op.value, ttl));
        }
      }
      await transaction.commit();
    } catch (error) {
      transaction.abort();
      throw error;
    }
  };

const createEntries = <T>(
  db: Database<string, Envelope<T>>,
  state: CacheScopeState,
): Cache<T>['entries'] =>
  async function* entries(opts = {}) {
    const prefix = state.namespace ? `${state.namespace}\u241F` : '';
    let count = 0;

    for (const [storedKey, env] of db.getRange({
      start: prefix,
      end: prefix ? `${prefix}\uFFFF` : undefined,
    })) {
      if (opts.limit !== undefined && count >= opts.limit) break;

      const [value, expired] = unwrap(env);
      if (expired) {
        await db.remove(storedKey);
        continue;
      }
      if (value === undefined) continue;

      const logicalKey = prefix ? storedKey.slice(prefix.length) : storedKey;
      yield [logicalKey, value] as [string, T];
      count++;
    }
  };

const createSweepExpired =
  <T>(db: Database<string, Envelope<T>>): Cache<T>['sweepExpired'] =>
  async () => {
    let deletedCount = 0;
    const transaction = db.transaction();

    try {
      for (const [key, env] of db.getRange()) {
        const [, expired] = unwrap(env);
        if (expired) {
          transaction.remove(key);
          deletedCount++;
        }
      }
      await transaction.commit();
    } catch (error) {
      transaction.abort();
      throw error;
    }

    return deletedCount;
  };

const createWithNamespace =
  <T>(db: Database<string, Envelope<T>>, state: CacheScopeState): Cache<T>['withNamespace'] =>
  (ns) => {
    const cfg: ScopeConfig = {
      namespace: ns ? composeNamespace(state.namespace, ns) : DEFAULT_NAMESPACE,
      ...(state.defaultTtlMs !== undefined ? { defaultTtlMs: state.defaultTtlMs } : {}),
    };
    return buildCacheScope<T>(db, cfg);
  };

type ScopeConfig = Readonly<{
  namespace?: string;
  defaultTtlMs?: Millis;
}>;

function composeNamespace(baseNs: string | undefined, ns: string): string {
  return baseNs ? `${baseNs}/${ns}` : ns;
}

function buildCacheScope<T>(db: Database<string, Envelope<T>>, cfg: ScopeConfig): Cache<T> {
  const state: CacheScopeState = {
    namespace: cfg.namespace,
    defaultTtlMs: cfg.defaultTtlMs,
  };

  const get = createGet(db, state);

  return {
    get,
    has: createHas(get),
    set: createSet(db, state),
    del: createDel(db, state),
    batch: createBatch(db, state),
    entries: createEntries(db, state),
    sweepExpired: createSweepExpired(db),
    withNamespace: createWithNamespace(db, state),
    close: async () => {
      await db.close();
    },
  };
}

export const openLmdbCache = async <T = unknown>(opts: CacheOptions): Promise<Cache<T>> => {
  const db = open<string, Envelope<T>>({
    path: opts.path,
    compression: true, // Enable compression for better space efficiency
    // LMDB provides enhanced concurrency by default
    // No need for explicit concurrency settings like in LevelDB
  });

  const cfg: ScopeConfig = {
    defaultTtlMs: opts.defaultTtlMs ?? DEFAULT_TTL_MS,
    namespace: opts.namespace ?? DEFAULT_NAMESPACE,
  };

  return buildCacheScope<T>(db, cfg);
};

// helpers retained for external consumers
export function defaultNamespace(base: Readonly<Partial<CacheOptions>>, ns: string): string {
  return base.namespace ? `${base.namespace}/${ns}` : ns;
}
