import { Level } from "level";

import type { Cache, CacheOptions, Millis, PutOptions } from "./types.js";

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
  const base = { namespace: cfg.namespace, defaultTtlMs: cfg.defaultTtlMs };

  const get = async (key: string): Promise<T | undefined> => {
    const k = joinKey(base.namespace, key);
    const env = await db.get(k).catch((err: any) => {
      if (err && (err.code === "LEVEL_NOT_FOUND" || err.notFound)) {
        return undefined as Envelope<T> | undefined;
      }
      throw err;
    });
    const [val, expired] = unwrap(env);
    if (expired) await db.del(k).catch(() => {});
    return val;
  };

  const has = async (key: string): Promise<boolean> =>
    (await get(key)) !== undefined;

  const set = async (
    key: string,
    value: T,
    putOpts?: PutOptions,
  ): Promise<void> => {
    const ttl = putOpts?.ttlMs ?? base.defaultTtlMs;
    const k = joinKey(base.namespace, key);
    const env: Envelope<T> =
      typeof ttl === "number" ? { v: value, x: now() + ttl } : { v: value };
    await db.put(k, env);
  };

  const del = async (key: string): Promise<void> => {
    const k = joinKey(base.namespace, key);
    await db.del(k);
  };

  const batch = async (
    ops: ReadonlyArray<
      | { type: "put"; key: string; value: T; ttlMs?: Millis }
      | { type: "del"; key: string }
    >,
  ): Promise<void> => {
    const mapped = ops.map((op) => {
      const k = joinKey(base.namespace, op.key);
      if (op.type === "del") return { type: "del" as const, key: k };
      const ttl = op.ttlMs ?? base.defaultTtlMs;
      const env: Envelope<T> =
        typeof ttl === "number"
          ? { v: op.value, x: now() + ttl }
          : { v: op.value };
      return { type: "put" as const, key: k, value: env };
    });
    await db.batch(mapped as any);
  };

  const entries = async function* (opts?: Readonly<{ limit?: number }>) {
    const prefix = base.namespace ? `${base.namespace}\u241F` : "";
    const it = db.iterator({
      gte: prefix,
      lt: prefix ? prefix + "\uFFFF" : undefined,
      limit: opts?.limit,
    } as any);
    try {
      for await (const [k, env] of it as any) {
        const [val, expired] = unwrap(env as Envelope<T> | undefined);
        if (expired) {
          await db.del(k as string).catch(() => {});
          continue;
        }
        const logicalKey = prefix
          ? (k as string).slice(prefix.length)
          : (k as string);
        if (val !== undefined) yield [logicalKey, val] as [string, T];
      }
    } finally {
      // iterator auto-closes in modern level
    }
  };

  const sweepExpired = async (): Promise<number> => {
    let n = 0;
    for await (const [k, env] of db.iterator() as any) {
      const [, expired] = unwrap(env as Envelope<T> | undefined);
      if (expired) {
        await db.del(k as string).catch(() => {});
        n++;
      }
    }
    return n;
  };

  const withNamespace = (ns: string): Cache<T> => {
    const cfg: ScopeConfig = {
      namespace: ns ? composeNamespace(base.namespace, ns) : DEFAULT_NAMESPACE,
      ...(base.defaultTtlMs !== undefined
        ? { defaultTtlMs: base.defaultTtlMs }
        : {}),
    };
    return buildCacheScope<T>(db, cfg);
  };

  const close = async () => db.close();

  return {
    get,
    has,
    set,
    del,
    batch,
    entries,
    sweepExpired,
    withNamespace,
    close,
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
