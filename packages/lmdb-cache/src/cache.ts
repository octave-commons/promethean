import { mkdir } from 'node:fs/promises';

import type { Cache, CacheOptions, PutOptions } from './types.js';

export function openLmdbCache<T = unknown>(options: CacheOptions): Cache<T> {
    const inMemory = new Map<string, { value: T; expiresAt?: number }>();
    
    // Ensure directory exists
    if (options.path) {
        void mkdir(options.path, { recursive: true });
    }

    return {
        async get(key: string): Promise<T | undefined> {
            const entry = inMemory.get(key);
            if (!entry) {
                return undefined;
            }

            const now = Date.now();
            if (entry.expiresAt && entry.expiresAt < now) {
                inMemory.delete(key);
                return undefined;
            }

            return entry.value;
        },

        async has(key: string): Promise<boolean> {
            const entry = inMemory.get(key);
            if (!entry) {
                return false;
            }

            const now = Date.now();
            if (entry.expiresAt && entry.expiresAt < now) {
                inMemory.delete(key);
                return false;
            }

            return true;
        },

        async set(key: string, value: T, opts?: PutOptions): Promise<void> {
            const ttlMs = opts?.ttlMs || options.defaultTtlMs || undefined;
            const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
            
            inMemory.set(key, { value, expiresAt });
        },

        async del(key: string): Promise<void> {
            inMemory.delete(key);
        },

        async batch(
            ops: ReadonlyArray<
                { type: 'put'; key: string; value: T; ttlMs?: number } | { type: 'del'; key: string }
                >,
        ): Promise<void> {
            for (const op of ops) {
                if (op.type === 'put') {
                    await this.set(op.key, op.value, { ttlMs: op.ttlMs });
                } else {
                    await this.del(op.key);
                }
            }
        },

        async *entries(opts?: Readonly<{ limit?: number; namespace?: string }>): AsyncGenerator<[string, T]> {
            const now = Date.now();
            let count = 0;
            const limit = opts?.limit || Infinity;

            for (const [key, entry] of inMemory) {
                if (count >= limit) break;

                if (entry.expiresAt && entry.expiresAt < now) {
                    continue; // Skip expired entries
                }

                // Apply namespace filter if specified
                if (opts?.namespace) {
                    if (key.startsWith(`${opts.namespace}:`)) {
                        const actualKey = key.replace(`${opts.namespace}:`, '');
                        yield [actualKey, entry.value];
                        count++;
                    }
                } else {
                    yield [key, entry.value];
                    count++;
                }
            }
        },

        async sweepExpired(): Promise<number> {
            const now = Date.now();
            let deletedCount = 0;

            for (const [key, entry] of inMemory) {
                if (entry.expiresAt && entry.expiresAt < now) {
                    inMemory.delete(key);
                    deletedCount++;
                }
            }

            return deletedCount;
        },

        async getStats(): Promise<{ totalEntries: number; expiredEntries: number; namespaces: readonly string[]; hitRate: number }> {
            const now = Date.now();
            let expiredEntries = 0;
            const namespaces = new Set<string>();

            for (const [key, entry] of inMemory) {
                if (entry.expiresAt && entry.expiresAt < now) {
                    expiredEntries++;
                }

                // Extract namespace from key pattern "namespace:key"
                const keyParts = key.split(':');
                if (keyParts.length > 1 && keyParts[0]) {
                    namespaces.add(keyParts[0]);
                }
            }

            return {
                totalEntries: inMemory.size,
                expiredEntries,
                namespaces: Array.from(namespaces),
                hitRate: 0, // TODO: Implement hit rate tracking
            };
        },

        withNamespace(ns: string): Cache<T> {
            const fullNamespace = ns;

            return {
                async get(key: string): Promise<T | undefined> {
                    const namespacedKey = `${fullNamespace}:${key}`;
                    const entry = inMemory.get(namespacedKey);
                    if (!entry) return undefined;
                    
                    const now = Date.now();
                    if (entry.expiresAt && entry.expiresAt < now) {
                        inMemory.delete(namespacedKey);
                        return undefined;
                    }
                    return entry.value;
                },

                async has(key: string): Promise<boolean> {
                    const namespacedKey = `${fullNamespace}:${key}`;
                    const entry = inMemory.get(namespacedKey);
                    if (!entry) return false;
                    
                    const now = Date.now();
                    if (entry.expiresAt && entry.expiresAt < now) {
                        inMemory.delete(namespacedKey);
                        return false;
                    }
                    return true;
                },

                async set(key: string, value: T, opts?: PutOptions): Promise<void> {
                    const namespacedKey = `${fullNamespace}:${key}`;
                    const ttlMs = opts?.ttlMs || options.defaultTtlMs || undefined;
                    const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
                    
                    inMemory.set(namespacedKey, { value, expiresAt });
                },

                async del(key: string): Promise<void> {
                    const namespacedKey = `${fullNamespace}:${key}`;
                    inMemory.delete(namespacedKey);
                },

                async batch(ops): Promise<void> {
                    for (const op of ops) {
                        if (op.type === 'put') {
                            await this.set(op.key, op.value, { ttlMs: op.ttlMs });
                        } else {
                            await this.del(op.key);
                        }
                    }
                },

                async *entries(opts): AsyncGenerator<[string, T]> {
                    const now = Date.now();
                    let count = 0;
                    const limit = opts?.limit || Infinity;

                    for (const [key, entry] of inMemory) {
                        if (count >= limit) break;

                        if (entry.expiresAt && entry.expiresAt < now) {
                            continue; // Skip expired entries
                        }

                        if (key.startsWith(`${fullNamespace}:`)) {
                            const actualKey = key.replace(`${fullNamespace}:`, '');
                            yield [actualKey, entry.value];
                            count++;
                        }
                    }
                },

                async sweepExpired(): Promise<number> {
                    let deletedCount = 0;
                    const now = Date.now();
                    
                    for (const [key, entry] of inMemory) {
                        if (key.startsWith(`${fullNamespace}:`) && entry.expiresAt && entry.expiresAt < now) {
                            inMemory.delete(key);
                            deletedCount++;
                        }
                    }
                    
                    return deletedCount;
                },

                async getStats() {
                    let totalEntries = 0;
                    let expiredEntries = 0;
                    const now = Date.now();
                    
                    for (const [key, entry] of inMemory) {
                        if (key.startsWith(`${fullNamespace}:`)) {
                            totalEntries++;
                            if (entry.expiresAt && entry.expiresAt < now) {
                                expiredEntries++;
                            }
                        }
                    }

                    return {
                        totalEntries,
                        expiredEntries,
                        namespaces: [ns],
                        hitRate: 0,
                    };
                },

                withNamespace(subNs: string): Cache<T> {
                    return this.withNamespace(`${ns}:${subNs}`);
                },

                async close(): Promise<void> {
                    // No-op for namespaced cache
                },
            };
        },

        async close(): Promise<void> {
            inMemory.clear();
        },
    };
}

// Export class for backward compatibility
export class LMDBCache<T> implements Cache<T> {
    private cache: Cache<T>;

    constructor(path: string, options: Omit<CacheOptions, "path"> = {}) {
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

    async getStats(): Promise<{ totalEntries: number; expiredEntries: number; namespaces: readonly string[]; hitRate: number }> {
        return this.cache.getStats();
    }

    withNamespace(ns: string): Cache<T> {
        return this.cache.withNamespace(ns);
    }

    async close(): Promise<void> {
        return this.cache.close();
    }
}
