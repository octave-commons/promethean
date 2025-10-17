// Temporary in-memory cache implementation to unblock builds
// TODO: Replace with proper LMDB integration once type issues are resolved

import type { Cache, CacheOptions, Millis } from './types.js';

/**
 * Internal in-memory envelope. Keep it tiny.
 * v: value, x: expiry epoch ms (optional)
 */
type Envelope<T> = Readonly<{ v: T; x?: Millis }>;

let now = (): Millis => Date.now();
let DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
let DEFAULT_NAMESPACE = 'default';

/** deterministic, reversible namespacing (no mutation) */
let joinKey = (ns: string | undefined, key: string): string => (ns ? `${ns}\u241F${key}` : key); // \u241F = SYMBOL FOR UNIT SEPARATOR

/** unwrap, checking TTL; returns [value, expired?] */
let unwrap = <T>(env: Envelope<T> | undefined): readonly [T | undefined, boolean] => {
  if (env == null) return [undefined, false];
  let expired = typeof env.x === 'number' && env.x <= now();
  return [expired ? undefined : env.v, expired];
};

type CacheScopeState = Readonly<{
  namespace?: string;
  defaultTtlMs?: Millis;
}>;

let namespacedKey = (state: CacheScopeState, key: string): string =>
  joinKey(state.namespace, key);

let envelopeFor = <T>(value: T, ttl: Millis | undefined): Envelope<T> =>
  typeof ttl === 'number' ? { v: value, x: now() + ttl } : { v: value };

let createGet =
  <T>(store: Map<string, Envelope<T>>, state: CacheScopeState): Cache<T>['get'] =>
  async (key: string): Promise<T | undefined> => {
    let scoped = namespacedKey(state, key);
    let env = store.get(scoped);
    let [value, expired] = unwrap(env);
    if (expired) store.delete(scoped);
    return value;
  };

let createHas =
  <T>(get: Cache<T>['get']): Cache<T>['has'] =>
  async (key: string): Promise<boolean> =>
    (await get(key)) !== undefined;

let createSet =
  <T>(store: Map<string, Envelope<T>>, state: CacheScopeState): Cache<T>['set'] =>
  async (key: string, value: T, putOpts?: { ttlMs?: Millis }): Promise<void> => {
    let ttl = putOpts?.ttlMs ?? state.defaultTtlMs;
    store.set(namespacedKey(state, key), envelopeFor(value, ttl));
  };

let createDel =
  <T>(store: Map<string, Envelope<T>>, state: CacheScopeState): Cache<T>['del'] =>
  async (key: string): Promise<void> => {
    store.delete(namespacedKey(state, key));
  };

let createBatch =
  <T>(store: Map<string, Envelope<T>>, state: CacheScopeState): Cache<T>['batch'] =>
  async (ops): Promise<void> => {
    for (let op of ops) {
      let key = namespacedKey(state, op.key);
      if (op.type === 'del') {
        store.delete(key);
      } else {
        let ttl = op.ttlMs ?? state.defaultTtlMs;
        store.set(key, envelopeFor(op.value, ttl));
      }
    }
  };

let createEntries = <T>(
  store: Map<string, Envelope<T>>,
  state: CacheScopeState,
): Cache<T>['entries'] =>
  async function* entries(opts = {}) {
    let prefix = state.namespace ? `${state.namespace}\u241F` : '';
    let count = 0;

    for (let [storedKey, env] of store.entries()) {
      if (opts.limit !== undefined && count >= opts.limit) break;

      let [value, expired] = unwrap(env);
      if (expired) {
        store.delete(storedKey);
        continue;
      }
      if (value === undefined) continue;

      if (!storedKey.startsWith(prefix)) continue;

      let logicalKey = prefix ? storedKey.slice(prefix.length) : storedKey;
      yield [logicalKey, value] as [string, T];
      count++;
    }
  };

let createSweepExpired =
  <T>(store: Map<string, Envelope<T>>): Cache<T>['sweepExpired'] =>
  async (): Promise<number> => {
    let deletedCount = 0;

    for (let [key, env] of store.entries()) {
      let [, expired] = unwrap(env);
      if (expired) {
        store.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  };

let createWithNamespace =
  <T>(store: Map<string, Envelope<T>>, state: CacheScopeState): Cache<T>['withNamespace'] =>
  (ns) => {
    let cfg: ScopeConfig = {
      namespace: ns ? composeNamespace(state.namespace, ns) : DEFAULT_NAMESPACE,
      ...(state.defaultTtlMs !== undefined ? { defaultTtlMs: state.defaultTtlMs } : {}),
    };
    return buildCacheScope<T>(store, cfg);
  };

type ScopeConfig = Readonly<{
  namespace?: string;
  defaultTtlMs?: Millis;
}>;

function composeNamespace(baseNs: string | undefined, ns: string): string {
  return baseNs ? `${baseNs}/${ns}` : ns;
}

function buildCacheScope<T>(store: Map<string, Envelope<T>>, cfg: ScopeConfig): Cache<T> {
  let state: CacheScopeState = {
    namespace: cfg.namespace,
    defaultTtlMs: cfg.defaultTtlMs,
  };

  let get = createGet(store, state);

  return {
    get,
    has: createHas(get),
    set: createSet(store, state),
    del: createDel(store, state),
    batch: createBatch(store, state),
    entries: createEntries(store, state),
    sweepExpired: createSweepExpired(store),
    withNamespace: createWithNamespace(store, state),
    close: async (): Promise<void> => {
      store.clear();
    },
  };
}

export let openLmdbCache = async <T = unknown>(opts: CacheOptions): Promise<Cache<T>> => {
  // Temporary in-memory store instead of LMDB
  let store = new Map<string, Envelope<T>>();

  let cfg: ScopeConfig = {
    defaultTtlMs: opts.defaultTtlMs ?? DEFAULT_TTL_MS,
    namespace: opts.namespace ?? DEFAULT_NAMESPACE,
  };

  return buildCacheScope<T>(store, cfg);
};

// helpers retained for external consumers
export function defaultNamespace(base: Readonly<Partial<CacheOptions>>, ns: string): string {
  return base.namespace ? `${base.namespace}/${ns}` : ns;
}
