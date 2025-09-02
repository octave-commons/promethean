import { Level } from "level";
import type { Cache, CacheOptions, Millis, PutOptions } from "./types.js";

/**
 * Internal on-disk envelope. Keep it tiny.
 * v: value, x: expiry epoch ms (optional)
 */
type Envelope<T> = Readonly<{ v: T; x?: Millis }>;

const now = (): Millis => Date.now();

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

export const openLevelCache = async <T = unknown>(
  opts: CacheOptions,
): Promise<Cache<T>> => {
  const db = new Level<string, Envelope<T>>(opts.path, {
    keyEncoding: "utf8",
    valueEncoding: "json",
  });

  const base: Readonly<{
    defaultTtlMs?: Millis;
    namespace?: string;
  }> = {
    defaultTtlMs: opts.defaultTtlMs,
    namespace: opts.namespace,
  };

  const get = async (key: string): Promise<T | undefined> => {
    const k = joinKey(base.namespace, key);
    try {
      const env = await db.get(k).catch(() => undefined);
      const [val, expired] = unwrap(env);
      if (expired) {
        // lazy deletion; don't throw
        await db.del(k).catch(() => {});
      }
      return val;
    } catch {
      return undefined;
    }
  };

  const has = async (key: string): Promise<boolean> => {
    const v = await get(key);
    return v !== undefined;
  };

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
    // map immutably to level batch ops
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
    await db.batch(mapped);
  };

  const entries = async function* (opts?: Readonly<{ limit?: number }>) {
    const prefix = base.namespace ? `${base.namespace}\u241F` : "";
    const it = db.iterator({
      gte: prefix,
      lt: prefix ? prefix + "\uFFFF" : undefined,
      limit: opts?.limit,
    });
    try {
      for await (const [k, env] of it) {
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
      // iterator auto-closes in modern level, but be explicit if needed
    }
  };

  const sweepExpired = async (): Promise<number> => {
    let n = 0;
    for await (const [k, env] of db.iterator()) {
      const [, expired] = unwrap(env as Envelope<T> | undefined);
      if (expired) {
        await db.del(k as string).catch(() => {});
        n++;
      }
    }
    return n;
  };

  const withNamespace = (ns: string): Cache<T> =>
    // return a new cache "view" without mutating base
    {
      const next: CacheOptions = {
        path: opts.path,
        defaultTtlMs: base.defaultTtlMs,
        namespace: ns
          ? base.namespace
            ? `${base.namespace}/${ns}`
            : ns
          : base.namespace,
      };
      // reuse same underlying db handle; rebind fns to new namespace
      return bindView<T>(db, next);
    };

  const close = async () => db.close();

  // provide the bound functions
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
};

/** internal: bind a new namespaced view over an existing db handle */
function bindView<T>(
  db: Level<string, Envelope<T>>,
  opts: CacheOptions,
): Cache<T> {
  // leverage openLevelCache logic without reopening the db
  const base = {
    defaultTtlMs: opts.defaultTtlMs,
    namespace: opts.namespace,
  };

  const now = (): Millis => Date.now();
  const joinKey = (ns: string | undefined, key: string) =>
    ns ? `${ns}\u241F${key}` : key;
  const unwrap = (
    env: Envelope<T> | undefined,
  ): readonly [T | undefined, boolean] => {
    if (env == null) return [undefined, false];
    const expired = typeof env.x === "number" && env.x <= now();
    return [expired ? undefined : env.v, expired];
  };

  const get = async (key: string): Promise<T | undefined> => {
    const k = joinKey(base.namespace, key);
    const env = await db.get(k).catch(() => undefined);
    const [val, expired] = unwrap(env);
    if (expired) await db.del(k).catch(() => {});
    return val;
  };

  const has = async (key: string) => (await get(key)) !== undefined;

  const set = async (key: string, value: T, put?: PutOptions) => {
    const ttl = put?.ttlMs ?? base.defaultTtlMs;
    const k = joinKey(base.namespace, key);
    const env: Envelope<T> =
      typeof ttl === "number" ? { v: value, x: now() + ttl } : { v: value };
    await db.put(k, env);
  };

  const del = async (key: string) => {
    const k = joinKey(base.namespace, key);
    await db.del(k);
  };

  const batch = async (
    ops: ReadonlyArray<
      | { type: "put"; key: string; value: T; ttlMs?: Millis }
      | { type: "del"; key: string }
    >,
  ) => {
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
    await db.batch(mapped);
  };

  const entries = async function* (opts?: Readonly<{ limit?: number }>) {
    const prefix = base.namespace ? `${base.namespace}\u241F` : "";
    const it = db.iterator({
      gte: prefix,
      lt: prefix ? prefix + "\uFFFF" : undefined,
      limit: opts?.limit,
    });
    for await (const [k, env] of it) {
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
  };

  const sweepExpired = async () => {
    let n = 0;
    for await (const [k, env] of db.iterator()) {
      const [, expired] = unwrap(env as Envelope<T> | undefined);
      if (expired) {
        await db.del(k as string).catch(() => {});
        n++;
      }
    }
    return n;
  };

  const withNamespace = (ns: string) =>
    bindView<T>(db, {
      ...opts,
      namespace: ns
        ? base.namespace
          ? `${base.namespace}/${ns}`
          : ns
        : base.namespace,
    });

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

export type { Cache, CacheOptions, PutOptions } from "./types.js";
