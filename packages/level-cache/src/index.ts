import { Level } from "level";
import type {
  BatchOperation,
  Iterator as LevelIterator,
  IteratorOptions,
} from "level";

import type { Cache, CacheOptions, Millis } from "./types.js";

/**
 * Internal on-disk envelope. Keep it tiny.
 * v: value, x: expiry epoch ms (optional)
 */
type Envelope<T> = Readonly<{ v: T; x?: Millis }>;

const now = (): Millis => Date.now();
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_NAMESPACE = "default";

/** deterministic, reversible namespacing (no mutation) */
const joinKey = (ns: string | undefined, key: string): string =>
  ns ? `${ns}\u241F${key}` : key; // \u241F = SYMBOL FOR UNIT SEPARATOR

/** unwrap, checking TTL; returns [value, expired?] */
const unwrap = <T>(
  env: Envelope<T> | undefined,
): readonly [T | undefined, boolean] => {
  if (env == null) return [undefined, false];
  const expired = typeof env.x === "number" && env.x <= now();
  return [expired ? undefined : env.v, expired];
};

type LevelLike<K, V> = Pick<
  Level<K, V>,
  "get" | "put" | "del" | "batch" | "iterator" | "close"
>;

type CacheScopeState = Readonly<{
  namespace?: string;
  defaultTtlMs?: Millis;
}>;

type CacheIterator<T> = LevelIterator<
  Level<string, Envelope<T>>,
  string,
  Envelope<T>
>;

type CacheBatchOperation<T> = BatchOperation<
  Level<string, Envelope<T>>,
  string,
  Envelope<T>
>;

type LevelNotFoundError = Readonly<{ code?: string; notFound?: boolean }>;

const isLevelNotFoundError = (value: unknown): value is LevelNotFoundError => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<{ code: unknown; notFound: unknown }>;
  return candidate.code === "LEVEL_NOT_FOUND" || candidate.notFound === true;
};

const namespacedKey = (state: CacheScopeState, key: string): string =>
  joinKey(state.namespace, key);

const envelopeFor = <T>(value: T, ttl: Millis | undefined): Envelope<T> =>
  typeof ttl === "number" ? { v: value, x: now() + ttl } : { v: value };

const entriesIterable = <T>(
  iterator: CacheIterator<T>,
): AsyncIterable<readonly [string, Envelope<T> | undefined]> =>
  iterator as unknown as AsyncIterable<
    readonly [string, Envelope<T> | undefined]
  >;

const asyncReduce = async <TItem, TAcc>(
  iterable: AsyncIterable<TItem>,
  reducer: (acc: TAcc, item: TItem) => Promise<TAcc> | TAcc,
  initial: TAcc,
): Promise<TAcc> => {
  const reduceIterator = async (
    iterator: AsyncIterator<TItem>,
    acc: TAcc,
  ): Promise<TAcc> => {
    const next = await iterator.next();
    if (next.done) return acc;
    const updated = await reducer(acc, next.value);
    return reduceIterator(iterator, updated);
  };

  return reduceIterator(iterable[Symbol.asyncIterator](), initial);
};

const createGet =
  <T>(
    db: LevelLike<string, Envelope<T>>,
    state: CacheScopeState,
  ): Cache<T>["get"] =>
  async (key: string) => {
    const scoped = namespacedKey(state, key);
    const env = await db.get(scoped).catch((err: unknown) => {
      if (isLevelNotFoundError(err)) return undefined;
      throw err;
    });
    const [value, expired] = unwrap(env);
    if (expired) await db.del(scoped).catch(() => undefined);
    return value;
  };

const createHas =
  <T>(get: Cache<T>["get"]): Cache<T>["has"] =>
  async (key: string) =>
    (await get(key)) !== undefined;

const createSet =
  <T>(
    db: LevelLike<string, Envelope<T>>,
    state: CacheScopeState,
  ): Cache<T>["set"] =>
  async (key, value, putOpts) => {
    const ttl = putOpts?.ttlMs ?? state.defaultTtlMs;
    await db.put(namespacedKey(state, key), envelopeFor(value, ttl));
  };

const createDel =
  <T>(
    db: LevelLike<string, Envelope<T>>,
    state: CacheScopeState,
  ): Cache<T>["del"] =>
  async (key) => {
    await db.del(namespacedKey(state, key));
  };

const createBatch =
  <T>(
    db: LevelLike<string, Envelope<T>>,
    state: CacheScopeState,
  ): Cache<T>["batch"] =>
  async (ops) => {
    const mapped = ops.map<CacheBatchOperation<T>>((op) => {
      const key = namespacedKey(state, op.key);
      if (op.type === "del") {
        return { type: "del", key };
      }
      const ttl = op.ttlMs ?? state.defaultTtlMs;
      return { type: "put", key, value: envelopeFor(op.value, ttl) };
    });
    await db.batch(mapped);
  };

const createEntries = <T>(
  db: LevelLike<string, Envelope<T>>,
  state: CacheScopeState,
): Cache<T>["entries"] =>
  async function* entries(opts = {}) {
    const prefix = state.namespace ? `${state.namespace}\u241F` : "";
    const iteratorOptions: IteratorOptions<string, Envelope<T>> = {
      gte: prefix,
      lt: prefix ? `${prefix}\uFFFF` : undefined,
      limit: opts.limit,
    };
    const iterator = db.iterator(iteratorOptions);
    for await (const [storedKey, env] of entriesIterable(iterator)) {
      const [value, expired] = unwrap(env);
      if (expired) {
        await db.del(storedKey).catch(() => undefined);
        continue;
      }
      if (value === undefined) continue;
      const logicalKey = prefix ? storedKey.slice(prefix.length) : storedKey;
      yield [logicalKey, value] as [string, T];
    }
  };

const createSweepExpired =
  <T>(db: LevelLike<string, Envelope<T>>): Cache<T>["sweepExpired"] =>
  async () => {
    const iterator = db.iterator();
    return asyncReduce(
      entriesIterable(iterator),
      async (count, [key, env]) => {
        const [, expired] = unwrap(env);
        if (!expired) return count;
        await db.del(key).catch(() => undefined);
        return count + 1;
      },
      0,
    );
  };

const createWithNamespace =
  <T>(
    db: LevelLike<string, Envelope<T>>,
    state: CacheScopeState,
  ): Cache<T>["withNamespace"] =>
  (ns) => {
    const cfg: ScopeConfig = {
      namespace: ns ? composeNamespace(state.namespace, ns) : DEFAULT_NAMESPACE,
      ...(state.defaultTtlMs !== undefined
        ? { defaultTtlMs: state.defaultTtlMs }
        : {}),
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

function buildCacheScope<T>(
  db: LevelLike<string, Envelope<T>>,
  cfg: ScopeConfig,
): Cache<T> {
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
    close: () => db.close(),
  };
}

export const openLevelCache = async <T = unknown>(
  opts: CacheOptions,
): Promise<Cache<T>> => {
  const db = new Level<string, Envelope<T>>(opts.path, {
    keyEncoding: "utf8",
    valueEncoding: "json",
  });

  const cfg: ScopeConfig = {
    defaultTtlMs: opts.defaultTtlMs ?? DEFAULT_TTL_MS,
    namespace: opts.namespace ?? DEFAULT_NAMESPACE,
  };

  return buildCacheScope<T>(db, cfg);
};

// helpers retained for external consumers
export function defaultNamespace(
  base: Readonly<Partial<CacheOptions>>,
  ns: string,
): string {
  return base.namespace ? `${base.namespace}/${ns}` : ns;
}

export type { Cache, CacheOptions, PutOptions } from "./types.js";
