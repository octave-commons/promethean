import { mkdir } from 'node:fs/promises';
import { open } from 'lmdb';

import type { Cache, CacheOptions, PutOptions, Millis } from './types.js';

/**
 * Internal on-disk envelope. Keep it tiny.
 * v: value, x: expiry epoch ms (optional)
 */
type Envelope<T> = Readonly<{ v: T; x?: Millis }>;

const now = (): Millis => Date.now();

/** deterministic, reversible namespacing (no mutation) */
const joinKey = (ns: string | undefined, key: string): string => (ns ? `${ns}\u241F${key}` : key); // \u241F = SYMBOL FOR UNIT SEPARATOR

/** unwrap, checking TTL; returns [value, expired?] */
const unwrap = <T>(env: Envelope<T> | undefined): readonly [T | undefined, boolean] => {
  if (env == null) return [undefined, false];
  const expired = typeof env.x === 'number' && env.x <= now();
  return [expired ? undefined : (env.v as T), expired];
};

const namespacedKey = (namespace: string | undefined, key: string): string =>
  joinKey(namespace, key);

const envelopeFor = <T>(value: T, ttl: Millis | undefined): Envelope<T> =>
  typeof ttl === 'number' ? { v: value, x: now() + ttl } : { v: value };

export function openLmdbCache<T = unknown>(options: CacheOptions): Cache<T> {
  // Ensure directory exists
  if (options.path) {
    void mkdir(options.path, { recursive: true });
  }

  // Open LMDB database
  const db = open<Envelope<T>, string>(options.path, {
    encoding: 'json',
    compression: true,
    useVersions: true,
    noSubdir: false,
  }) as any; // Cast to any to access sync methods not in type definition

  let hitCount = 0;
  let missCount = 0;

  return {
    async get(key: string): Promise<T | undefined> {
      const scoped = namespacedKey(options.namespace, key);
      const env = db.get(scoped);
      const [value, expired] = unwrap(env);

      if (expired) {
        (db as any).removeSync(scoped);
        missCount++;
      } else if (value !== undefined) {
        hitCount++;
      } else {
        missCount++;
      }

      return value as T | undefined;
    },

    async has(key: string): Promise<boolean> {
      const scoped = namespacedKey(options.namespace, key);
      const env = db.get(scoped);
      const [value, expired] = unwrap(env);

      if (expired) {
        (db as any).removeSync(scoped);
        return false;
      }

      return value !== undefined;
    },

    async set(key: string, value: T, opts?: PutOptions): Promise<void> {
      const scoped = namespacedKey(options.namespace, key);
      const ttl = opts?.ttlMs ?? options.defaultTtlMs;
      await db.put(scoped, envelopeFor(value, ttl));
    },

    async del(key: string): Promise<void> {
      const scoped = namespacedKey(options.namespace, key);
      await db.remove(scoped);
    },

    async batch(
      ops: ReadonlyArray<
        { type: 'put'; key: string; value: T; ttlMs?: number } | { type: 'del'; key: string }
      >,
    ): Promise<void> {
      await db.transaction(() => {
        for (const op of ops) {
          const scoped = namespacedKey(options.namespace, op.key);
          if (op.type === 'put') {
            const ttl = op.ttlMs ?? options.defaultTtlMs;
            (db as any).putSync(scoped, envelopeFor(op.value, ttl));
          } else {
            (db as any).removeSync(scoped);
          }
        }
      });
    },

    async *entries(
      opts?: Readonly<{ limit?: number; namespace?: string }>,
    ): AsyncGenerator<[string, T]> {
      const namespace = opts?.namespace ?? options.namespace;
      const prefix = namespace ? `${namespace}\u241F` : '';

      for await (const [storedKey, env] of db.getRange({
        gte: prefix,
        lt: prefix ? `${prefix}\uFFFF` : undefined,
        limit: opts?.limit,
      })) {
        const [value, expired] = unwrap(env);
        if (expired) {
          await db.remove(storedKey);
          continue;
        }
        if (value === undefined) continue;

        const logicalKey = prefix ? storedKey.slice(prefix.length) : storedKey;
        yield [logicalKey, value as T];
      }
    },

    async sweepExpired(): Promise<number> {
      let deletedCount = 0;

      await db.transaction(async () => {
        for await (const [key, env] of db.getRange()) {
          const [, expired] = unwrap(env);
          if (expired) {
            await db.remove(key);
            deletedCount++;
          }
        }
      });

      return deletedCount;
    },

    async getStats(): Promise<{
      totalEntries: number;
      expiredEntries: number;
      namespaces: readonly string[];
      hitRate: number;
    }> {
      let totalEntries = 0;
      let expiredEntries = 0;
      const namespaces = new Set<string>();

      for await (const [key, env] of db.getRange()) {
        totalEntries++;
        const [, expired] = unwrap(env);
        if (expired) {
          expiredEntries++;
        }

        // Extract namespace from key pattern "namespace\u241Fkey"
        const keyParts = key.split('\u241F');
        if (keyParts.length > 1 && keyParts[0]) {
          namespaces.add(keyParts[0]);
        }
      }

      const totalAccesses = hitCount + missCount;
      const hitRate = totalAccesses > 0 ? hitCount / totalAccesses : 0;

      return {
        totalEntries,
        expiredEntries,
        namespaces: Array.from(namespaces),
        hitRate,
      };
    },

    withNamespace(ns: string): Cache<T> {
      const fullNamespace = ns
        ? options.namespace
          ? `${options.namespace}/${ns}`
          : ns
        : undefined;

      return {
        async get(key: string): Promise<T | undefined> {
          const scoped = namespacedKey(fullNamespace, key);
          const env = db.get(scoped);
          const [value, expired] = unwrap(env);

          if (expired) {
            (db as any).removeSync(scoped);
            return undefined;
          }

          return value as T | undefined;
        },

        async has(key: string): Promise<boolean> {
          const scoped = namespacedKey(fullNamespace, key);
          const env = db.get(scoped);
          const [value, expired] = unwrap(env);

          if (expired) {
            (db as any).removeSync(scoped);
            return false;
          }

          return value !== undefined;
        },

        async set(key: string, value: T, opts?: PutOptions): Promise<void> {
          const scoped = namespacedKey(fullNamespace, key);
          const ttl = opts?.ttlMs ?? options.defaultTtlMs;
          await db.put(scoped, envelopeFor(value, ttl));
        },

        async del(key: string): Promise<void> {
          const scoped = namespacedKey(fullNamespace, key);
          await db.remove(scoped);
        },

        async batch(ops): Promise<void> {
          await db.transaction(() => {
            for (const op of ops) {
              const scoped = namespacedKey(fullNamespace, op.key);
              if (op.type === 'put') {
                const ttl = op.ttlMs ?? options.defaultTtlMs;
                (db as any).putSync(scoped, envelopeFor(op.value, ttl));
              } else {
                (db as any).removeSync(scoped);
              }
            }
          });
        },

        async *entries(opts): AsyncGenerator<[string, T]> {
          const prefix = fullNamespace ? `${fullNamespace}\u241F` : '';

          for await (const [storedKey, env] of db.getRange({
            gte: prefix,
            lt: prefix ? `${prefix}\uFFFF` : undefined,
            limit: opts?.limit,
          })) {
            const [value, expired] = unwrap(env);
            if (expired) {
              await db.remove(storedKey);
              continue;
            }
            if (value === undefined) continue;

            const logicalKey = prefix ? storedKey.slice(prefix.length) : storedKey;
            yield [logicalKey, value as T];
          }
        },

        async sweepExpired(): Promise<number> {
          let deletedCount = 0;
          const prefix = fullNamespace ? `${fullNamespace}\u241F` : '';

          await db.transaction(async () => {
            for await (const [key, env] of db.getRange({
              gte: prefix,
              lt: prefix ? `${prefix}\uFFFF` : undefined,
            })) {
              const [, expired] = unwrap(env);
              if (expired) {
                await db.remove(key);
                deletedCount++;
              }
            }
          });

          return deletedCount;
        },

        async getStats() {
          let totalEntries = 0;
          let expiredEntries = 0;
          const prefix = fullNamespace ? `${fullNamespace}\u241F` : '';

          await db.transaction(async () => {
            for await (const [env] of db.getRange({
              gte: prefix,
              lt: prefix ? `${prefix}\uFFFF` : undefined,
            })) {
              totalEntries++;
              const [, expired] = unwrap(env);
              if (expired) {
                expiredEntries++;
              }
            }
          });

          return {
            totalEntries,
            expiredEntries,
            namespaces: fullNamespace ? [fullNamespace] : [],
            hitRate: 0,
          };
        },

        withNamespace(subNs: string): Cache<T> {
          const nestedNamespace = fullNamespace ? `${fullNamespace}/${subNs}` : subNs;
          return openLmdbCache<T>({
            ...options,
            namespace: nestedNamespace,
          }).withNamespace('');
        },

        async close(): Promise<void> {
          // No-op for namespaced cache - parent cache handles closing
        },
      };
    },

    async close(): Promise<void> {
      db.close();
    },
  };
}

// Export class for backward compatibility
export class LMDBCache<T> implements Cache<T> {
  private cache: Cache<T>;

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
