/**
 * TTL (Time-To-Live) cache implementation using LevelDB.
 * Caches results with automatic expiration.
 */

import { getDb } from './level.js';
import { loadConfig } from './config.js';
import { debug } from './log.js';

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Get a cached value if it exists and hasn't expired.
 */
export async function getCached<T>(key: string): Promise<T | null> {
  const db = await getDb();
  const ttlKey = `ttl:${key}`;

  try {
    const value = await db.get(ttlKey);
    const entry: CacheEntry<T> = JSON.parse(value);

    if (Date.now() > entry.expiresAt) {
      // Cache entry has expired, delete it
      await db.del(ttlKey);
      debug('Cache entry expired', { key });
      return null;
    }

    debug('Cache hit', { key });
    return entry.data;
  } catch (err) {
    if ((err as { code?: string }).code === 'LEVEL_NOT_FOUND') {
      debug('Cache miss', { key });
      return null;
    }
    throw err;
  }
}

/**
 * Set a value in the cache with a TTL.
 */
export async function setCached<T>(key: string, data: T, ttlSeconds?: number): Promise<void> {
  const db = await getDb();
  const config = loadConfig();
  const ttl = ttlSeconds ?? config.cacheTtlSeconds;

  const entry: CacheEntry<T> = {
    data,
    expiresAt: Date.now() + ttl * 1000,
  };

  const ttlKey = `ttl:${key}`;
  await db.put(ttlKey, JSON.stringify(entry));
  debug('Cache set', { key, ttlSeconds: ttl });
}

/**
 * Delete a cached value.
 */
export async function deleteCached(key: string): Promise<boolean> {
  const db = await getDb();
  const ttlKey = `ttl:${key}`;

  try {
    await db.del(ttlKey);
    debug('Cache deleted', { key });
    return true;
  } catch (err) {
    if ((err as { code?: string }).code === 'LEVEL_NOT_FOUND') {
      return false;
    }
    throw err;
  }
}

/**
 * Clear all cached entries (use with caution).
 */
export async function clearCache(): Promise<void> {
  const db = await getDb();
  const keys: string[] = [];

  for await (const [key] of db.iterator({ gt: 'ttl:', lt: 'ttl~' })) {
    keys.push(key);
  }

  for (const key of keys) {
    await db.del(key);
  }

  debug('Cache cleared', { count: keys.length });
}

/**
 * Get remaining TTL for a cached entry in seconds.
 * Returns -1 if entry doesn't exist, -2 if no TTL is set.
 */
export async function getRemainingTtl(key: string): Promise<number> {
  const db = await getDb();
  const ttlKey = `ttl:${key}`;

  try {
    const value = await db.get(ttlKey);
    const entry: CacheEntry<unknown> = JSON.parse(value);
    const remaining = Math.floor((entry.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -1;
  } catch (err) {
    if ((err as { code?: string }).code === 'LEVEL_NOT_FOUND') {
      return -1;
    }
    throw err;
  }
}

/**
 * Refresh the TTL for an existing cached entry.
 */
export async function refreshTtl(key: string, ttlSeconds?: number): Promise<boolean> {
  const db = await getDb();
  const config = loadConfig();
  const ttl = ttlSeconds ?? config.cacheTtlSeconds;
  const ttlKey = `ttl:${key}`;

  try {
    const value = await db.get(ttlKey);
    const entry: CacheEntry<unknown> = JSON.parse(value);
    entry.expiresAt = Date.now() + ttl * 1000;
    await db.put(ttlKey, JSON.stringify(entry));
    debug('Cache TTL refreshed', { key, ttlSeconds: ttl });
    return true;
  } catch (err) {
    if ((err as { code?: string }).code === 'LEVEL_NOT_FOUND') {
      return false;
    }
    throw err;
  }
}
