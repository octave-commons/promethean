import { EventEmitter } from 'events';
// import { createHash } from 'crypto';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  metadata?: Record<string, any>;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  evictionCount: number;
  avgAccessTime: number;
  oldestEntry: number;
  newestEntry: number;
}

export interface CacheConfig {
  maxSize?: number;
  maxMemory?: number;
  defaultTtl?: number;
  cleanupInterval?: number;
  persistToDisk?: boolean;
  diskCacheDir?: string;
  compressionEnabled?: boolean;
  evictionPolicy?: 'lru' | 'lfu' | 'ttl' | 'size';
}

export class AdvancedCache<T = any> extends EventEmitter {
  private cache = new Map<string, CacheEntry<T>>();
  private accessTimes = new Map<string, number>();
  private config: Required<CacheConfig>;
  private stats: CacheStats = {
    totalEntries: 0,
    totalSize: 0,
    hitCount: 0,
    missCount: 0,
    hitRate: 0,
    evictionCount: 0,
    avgAccessTime: 0,
    oldestEntry: 0,
    newestEntry: 0,
  };
  private cleanupInterval?: NodeJS.Timeout;
  private accessTimeHistory: number[] = [];

  constructor(config: CacheConfig = {}) {
    super();
    this.config = {
      maxSize: config.maxSize || 1000,
      maxMemory: config.maxMemory || 100 * 1024 * 1024,
      defaultTtl: config.defaultTtl || 300000,
      cleanupInterval: config.cleanupInterval || 60000,
      persistToDisk: config.persistToDisk || false,
      diskCacheDir: config.diskCacheDir || '.cache',
      compressionEnabled: config.compressionEnabled || false,
      evictionPolicy: config.evictionPolicy || 'lru',
    };

    if (this.config.persistToDisk) {
      this.loadFromDisk();
    }

    this.startCleanup();
  }

  async get(key: string): Promise<T | undefined> {
    const startTime = performance.now();

    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.missCount++;
      this.updateHitRate();
      this.recordAccessTime(performance.now() - startTime);
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      this.stats.missCount++;
      this.stats.evictionCount++;
      this.updateStats();
      this.updateHitRate();
      this.recordAccessTime(performance.now() - startTime);
      return undefined;
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.accessTimes.set(key, entry.lastAccessed);

    this.stats.hitCount++;
    this.updateHitRate();
    this.recordAccessTime(performance.now() - startTime);

    this.emit('cache-hit', { key, entry });
    return entry.value;
  }

  async set(key: string, value: T, ttl?: number, metadata?: Record<string, any>): Promise<void> {
    const size = this.calculateSize(value);
    const now = Date.now();

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: now,
      ttl: ttl || this.config.defaultTtl,
      accessCount: 0,
      lastAccessed: now,
      size,
      metadata,
    };

    await this.ensureCapacity(size);

    const existingEntry = this.cache.get(key);
    if (existingEntry) {
      this.stats.totalSize -= existingEntry.size;
    }

    this.cache.set(key, entry);
    this.accessTimes.set(key, now);
    this.stats.totalSize += size;

    this.updateStats();

    if (this.config.persistToDisk) {
      await this.saveToDisk(key, entry);
    }

    this.emit('cache-set', { key, entry });
  }

  async delete(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.accessTimes.delete(key);
    this.stats.totalSize -= entry.size;
    this.updateStats();

    if (this.config.persistToDisk) {
      await this.deleteFromDisk(key);
    }

    this.emit('cache-delete', { key, entry });
    return true;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.accessTimes.clear();
    this.stats.totalSize = 0;
    this.updateStats();

    if (this.config.persistToDisk) {
      await this.clearDiskCache();
    }

    this.emit('cache-clear');
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
    this.accessTimes.clear();
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private calculateSize(value: T): number {
    try {
      return JSON.stringify(value).length * 2;
    } catch {
      return 1024;
    }
  }

  private async ensureCapacity(newEntrySize: number): Promise<void> {
    while (this.stats.totalSize + newEntrySize > this.config.maxMemory && this.cache.size > 0) {
      await this.evictEntry();
    }

    while (this.cache.size >= this.config.maxSize && this.cache.size > 0) {
      await this.evictEntry();
    }
  }

  private async evictEntry(): Promise<void> {
    let keyToEvict: string | undefined;

    switch (this.config.evictionPolicy) {
      case 'lru':
        keyToEvict = this.findLRUEntry();
        break;
      case 'lfu':
        keyToEvict = this.findLFUEntry();
        break;
      case 'ttl':
        keyToEvict = this.findExpiredEntry();
        break;
      case 'size':
        keyToEvict = this.findLargestEntry();
        break;
    }

    if (keyToEvict) {
      await this.delete(keyToEvict);
      this.stats.evictionCount++;
    }
  }

  private findLRUEntry(): string | undefined {
    let oldestKey: string | undefined;
    let oldestTime = Date.now();

    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private findLFUEntry(): string | undefined {
    let leastUsedKey: string | undefined;
    let leastAccessCount = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.accessCount < leastAccessCount) {
        leastAccessCount = entry.accessCount;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  private findExpiredEntry(): string | undefined {
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        return key;
      }
    }
    return this.findLRUEntry();
  }

  private findLargestEntry(): string | undefined {
    let largestKey: string | undefined;
    let largestSize = 0;

    for (const [key, entry] of this.cache) {
      if (entry.size > largestSize) {
        largestSize = entry.size;
        largestKey = key;
      }
    }

    return largestKey;
  }

  private updateStats(): void {
    this.stats.totalEntries = this.cache.size;

    const timestamps = Array.from(this.cache.values()).map((e) => e.timestamp);
    if (timestamps.length > 0) {
      this.stats.oldestEntry = Math.min(...timestamps);
      this.stats.newestEntry = Math.max(...timestamps);
    } else {
      this.stats.oldestEntry = 0;
      this.stats.newestEntry = 0;
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hitCount + this.stats.missCount;
    this.stats.hitRate = total > 0 ? this.stats.hitCount / total : 0;
  }

  private recordAccessTime(time: number): void {
    this.accessTimeHistory.push(time);
    if (this.accessTimeHistory.length > 1000) {
      this.accessTimeHistory = this.accessTimeHistory.slice(-1000);
    }
    this.stats.avgAccessTime =
      this.accessTimeHistory.reduce((a, b) => a + b, 0) / this.accessTimeHistory.length;
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(async () => {
      await this.cleanup();
    }, this.config.cleanupInterval);
  }

  private async cleanup(): Promise<void> {
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      await this.delete(key);
      this.stats.evictionCount++;
    }

    if (expiredKeys.length > 0) {
      this.emit('cleanup', { evicted: expiredKeys.length });
    }
  }

  // private generateKey(key: any): string {
  //   return createHash('md5').update(JSON.stringify(key)).digest('hex');
  // }

  private async loadFromDisk(): Promise<void> {
    if (!existsSync(this.config.diskCacheDir)) {
      await mkdir(this.config.diskCacheDir, { recursive: true });
      return;
    }
  }

  private async saveToDisk(key: string, entry: CacheEntry<T>): Promise<void> {
    if (!this.config.persistToDisk) return;

    try {
      const cacheFile = join(this.config.diskCacheDir, `${key}.json`);
      await writeFile(cacheFile, JSON.stringify(entry), 'utf8');
    } catch (error) {
      this.emit('disk-save-error', { key, error });
    }
  }

  private async deleteFromDisk(key: string): Promise<void> {
    if (!this.config.persistToDisk) return;

    try {
      const cacheFile = join(this.config.diskCacheDir, `${key}.json`);
      await unlink(cacheFile);
    } catch (error) {
      // Ignore file not found errors
    }
  }

  private async clearDiskCache(): Promise<void> {
    if (!this.config.persistToDisk) return;
  }
}

export class CacheFactory {
  static createLRUCache<T>(config: CacheConfig = {}): AdvancedCache<T> {
    return new AdvancedCache<T>({ ...config, evictionPolicy: 'lru' });
  }

  static createLFUCache<T>(config: CacheConfig = {}): AdvancedCache<T> {
    return new AdvancedCache<T>({ ...config, evictionPolicy: 'lfu' });
  }

  static createTTLCache<T>(config: CacheConfig = {}): AdvancedCache<T> {
    return new AdvancedCache<T>({ ...config, evictionPolicy: 'ttl' });
  }

  static createSizeBasedCache<T>(config: CacheConfig = {}): AdvancedCache<T> {
    return new AdvancedCache<T>({ ...config, evictionPolicy: 'size' });
  }

  static createPersistentCache<T>(config: CacheConfig = {}): AdvancedCache<T> {
    return new AdvancedCache<T>({ ...config, persistToDisk: true });
  }
}

export class MultiLevelCache<T = any> extends EventEmitter {
  private l1Cache: AdvancedCache<T>;
  private l2Cache?: AdvancedCache<T>;

  constructor(config: { l1?: CacheConfig; l2?: CacheConfig } = {}) {
    super();
    this.l1Cache = new AdvancedCache<T>({
      maxSize: 100,
      defaultTtl: 300000,
      ...config.l1,
    });

    if (config.l2) {
      this.l2Cache = new AdvancedCache<T>({
        persistToDisk: true,
        maxSize: 1000,
        defaultTtl: 3600000,
        ...config.l2,
      });
    }

    this.l1Cache.on('cache-hit', (event) => this.emit('l1-hit', event));
    if (this.l2Cache) {
      this.l2Cache.on('cache-hit', (event) => this.emit('l2-hit', event));
    }
  }

  async get(key: string): Promise<T | undefined> {
    let value = await this.l1Cache.get(key);
    if (value !== undefined) {
      return value;
    }

    if (this.l2Cache) {
      value = await this.l2Cache.get(key);
      if (value !== undefined) {
        await this.l1Cache.set(key, value);
        return value;
      }
    }

    return undefined;
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    await this.l1Cache.set(key, value, ttl);
    if (this.l2Cache) {
      await this.l2Cache.set(key, value, ttl);
    }
  }

  async delete(key: string): Promise<boolean> {
    const l1Deleted = await this.l1Cache.delete(key);
    const l2Deleted = this.l2Cache ? await this.l2Cache.delete(key) : false;
    return l1Deleted || l2Deleted;
  }

  async clear(): Promise<void> {
    await this.l1Cache.clear();
    if (this.l2Cache) {
      await this.l2Cache.clear();
    }
  }

  getStats() {
    return {
      l1: this.l1Cache.getStats(),
      l2: this.l2Cache?.getStats(),
    };
  }
}
