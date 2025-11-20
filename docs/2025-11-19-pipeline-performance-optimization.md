# Pipeline Performance Optimization Specification

## Overview

This specification addresses performance issues identified in @pipelines/ directory to improve processing speed, resource utilization, and scalability across all pipeline implementations.

## Current Performance Issues

### 1. Sequential File Processing

**Problem**: Pipelines process files sequentially without batching or concurrency control.

**Impact**: 
- Poor CPU utilization on multi-core systems
- Slow processing of large file sets
- Inefficient memory usage patterns

**Examples**:
- `simtask/src/01-scan.ts` lines 63-75: Sequential package scanning
- `boardrev/src/utils.ts` lines 38-93: Sequential file hashing
- `sonarflow/src/02-fetch.ts` lines 79-96: Sequential API requests

### 2. Inefficient Memory Usage

**Problem**: Large datasets loaded entirely into memory without streaming or pagination.

**Impact**:
- High memory consumption for large repositories
- Potential out-of-memory errors
- Poor garbage collection performance

**Examples**:
- `simtask` loads all function code into memory for embedding
- `boardrev` loads entire repository index into memory
- `readmeflow` loads all package metadata simultaneously

### 3. Suboptimal Caching Strategies

**Problem**: Inefficient cache key generation, TTL management, and cache invalidation.

**Impact**:
- Cache misses due to poor key strategies
- Stale data serving
- Unnecessary cache rebuilds

**Examples**:
- No cache versioning for schema changes
- Fixed TTL values regardless of data characteristics
- Cache key collisions in some pipelines

## Performance Optimization Solutions

### 1. Parallel File Processing

**Purpose**: Implement efficient parallel processing with configurable concurrency.

#### Implementation Plan

1. **Create `pipelines/core/src/performance/parallel-processor.ts`**:
```typescript
export interface ParallelProcessorOptions {
  concurrency?: number;
  batchSize?: number;
  maxMemory?: number; // MB
  progressCallback?: (completed: number, total: number) => void;
}

export interface ProcessingResult<T> {
  results: T[];
  errors: Array<{ item: any; error: Error }>;
  stats: {
    totalProcessed: number;
    successful: number;
    failed: number;
    duration: number;
    memoryPeak: number;
  };
}

export class ParallelProcessor<T, R> {
  private readonly options: Required<ParallelProcessorOptions>;
  private readonly semaphore: Semaphore;
  private memoryMonitor: MemoryMonitor;
  
  constructor(
    private readonly processor: (item: T) => Promise<R>,
    options: ParallelProcessorOptions = {}
  ) {
    this.options = {
      concurrency: options.concurrency || Math.max(1, Math.floor(require('os').cpus().length / 2)),
      batchSize: options.batchSize || 50,
      maxMemory: options.maxMemory || 1024, // 1GB default
      ...options
    };
    
    this.semaphore = new Semaphore(this.options.concurrency);
    this.memoryMonitor = new MemoryMonitor(this.options.maxMemory);
  }
  
  async process(items: T[]): Promise<ProcessingResult<R>> {
    const startTime = performance.now();
    const batches = this.createBatches(items);
    const results: R[] = [];
    const errors: Array<{ item: T; error: Error }> = [];
    let totalProcessed = 0;
    
    for (const batch of batches) {
      // Check memory usage before processing batch
      if (this.memoryMonitor.isLimitExceeded()) {
        await this.memoryMonitor.waitForMemory();
      }
      
      const batchResults = await this.processBatch(batch);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push({
            item: this.getItemFromError(result.reason),
            error: result.reason
          });
        }
      });
      
      totalProcessed += batch.length;
      
      // Report progress
      if (this.options.progressCallback) {
        this.options.progressCallback(totalProcessed, items.length);
      }
    }
    
    const duration = performance.now() - startTime;
    
    return {
      results,
      errors,
      stats: {
        totalProcessed,
        successful: results.length,
        failed: errors.length,
        duration,
        memoryPeak: this.memoryMonitor.getPeakUsage()
      }
    };
  }
  
  private createBatches(items: T[]): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += this.options.batchSize) {
      batches.push(items.slice(i, i + this.options.batchSize));
    }
    return batches;
  }
  
  private async processBatch(batch: T[]): Promise<PromiseSettledResult<R>[]> {
    const concurrentBatch = batch.slice(0, this.options.concurrency);
    
    return Promise.allSettled(
      concurrentBatch.map(item => 
        this.semaphore.execute(async () => {
          return await this.processor(item);
        })
      )
    );
  }
  
  private getItemFromError(error: unknown): T {
    return (error as any)?.item || error as T;
  }
}

// Semaphore implementation for concurrency control
class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];
  
  constructor(private maxPermits: number) {
    this.permits = maxPermits;
  }
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await operation();
    } finally {
      this.release();
    }
  }
  
  private async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    
    return new Promise(resolve => {
      this.waitQueue.push(resolve);
    });
  }
  
  private release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift()!;
      this.permits--;
      resolve();
    }
  }
}

// Memory monitoring for resource management
class MemoryMonitor {
  private readonly maxMemory: number;
  private peakUsage: number = 0;
  private samples: number[] = [];
  
  constructor(maxMemoryMB: number) {
    this.maxMemory = maxMemoryMB * 1024 * 1024; // Convert to bytes
  }
  
  isLimitExceeded(): boolean {
    const currentUsage = this.getCurrentMemoryUsage();
    this.samples.push(currentUsage);
    
    // Keep only last 100 samples
    if (this.samples.length > 100) {
      this.samples = this.samples.slice(-100);
    }
    
    this.peakUsage = Math.max(this.peakUsage, currentUsage);
    return currentUsage > this.maxMemory * 0.8; // 80% threshold
  }
  
  async waitForMemory(): Promise<void> {
    while (this.isLimitExceeded()) {
      await this.delay(1000); // Wait 1 second
      // Trigger garbage collection if available
      if (global.gc) {
        global.gc();
      }
    }
  }
  
  getPeakUsage(): number {
    return this.peakUsage;
  }
  
  private getCurrentMemoryUsage(): number {
    const usage = process.memoryUsage();
    return usage.heapUsed;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

2. **Migration Steps**:
   - Update `simtask` to use parallel file scanning
   - Update `boardrev` to use parallel file processing
   - Update `sonarflow` to use parallel API requests
   - Add memory monitoring to all pipelines

**Acceptance Criteria**:
- [ ] File processing uses parallel execution
- [ ] Configurable concurrency limits
- [ ] Memory usage monitoring and throttling
- [ ] Progress reporting for long-running operations
- [ ] 50%+ improvement in processing speed

### 2. Streaming Data Processing

**Purpose**: Implement streaming for large datasets to reduce memory footprint.

#### Implementation Plan

1. **Create `pipelines/core/src/performance/stream-processor.ts`**:
```typescript
export interface StreamProcessorOptions {
  chunkSize?: number;
  maxConcurrency?: number;
  backpressure?: 'buffer' | 'drop' | 'throttle';
  bufferSize?: number;
}

export interface StreamResult<T> {
  items: T[];
  stats: {
    totalItems: number;
    processedItems: number;
    droppedItems: number;
    duration: number;
    memoryUsage: number;
  };
}

export class StreamProcessor<T, R> {
  private readonly options: Required<StreamProcessorOptions>;
  private readonly buffer: Array<{ item: T; timestamp: number }> = [];
  private processing = false;
  private stats = { total: 0, processed: 0, dropped: 0 };
  
  constructor(
    private readonly processor: (item: T) => Promise<R>,
    options: StreamProcessorOptions = {}
  ) {
    this.options = {
      chunkSize: options.chunkSize || 100,
      maxConcurrency: options.maxConcurrency || 10,
      backpressure: options.backpressure || 'buffer',
      bufferSize: options.bufferSize || 1000,
      ...options
    };
  }
  
  async process(stream: NodeJS.ReadableStream): Promise<StreamResult<R>> {
    const startTime = performance.now();
    const results: R[] = [];
    
    return new Promise((resolve, reject) => {
      stream.on('data', async (chunk) => {
        const items = this.parseChunk(chunk);
        this.stats.totalItems += items.length;
        
        for (const item of items) {
          if (this.shouldProcessItem()) {
            try {
              this.processing = true;
              const result = await this.processor(item);
              results.push(result);
              this.stats.processed++;
            } catch (error) {
              this.handleProcessingError(item, error);
            } finally {
              this.processing = false;
            }
          } else {
            this.stats.dropped++;
          }
        }
      });
      
      stream.on('error', reject);
      stream.on('end', () => {
        const duration = performance.now() - startTime;
        resolve({
          items: results,
          stats: {
            ...this.stats,
            duration,
            memoryUsage: process.memoryUsage().heapUsed
          }
        });
      });
    });
  }
  
  private parseChunk(chunk: Buffer): T[] {
    const content = chunk.toString();
    const lines = content.split('\n').filter(line => line.trim());
    
    // Try parsing as JSON array first
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // Fallback to line-by-line parsing
      return lines
        .filter(line => line)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(item => item !== null) as T[];
    }
  }
  
  private shouldProcessItem(): boolean {
    switch (this.options.backpressure) {
      case 'buffer':
        return this.buffer.length < this.options.bufferSize;
      case 'drop':
        return this.buffer.length < this.options.bufferSize && !this.processing;
      case 'throttle':
        return this.buffer.length < this.options.bufferSize / 2;
      default:
        return true;
    }
  }
  
  private handleProcessingError(item: T, error: Error): void {
    console.error(`Processing error for item:`, item, error);
    this.stats.dropped++;
  }
}
```

2. **Migration Steps**:
   - Update `simtask` to use streaming for large codebases
   - Update `boardrev` to use streaming for repository processing
   - Update `readmeflow` to use streaming for package scanning
   - Add backpressure handling to all data ingestion points

**Acceptance Criteria**:
- [ ] Large datasets processed without loading entirely into memory
- [ ] Configurable chunk sizes and buffer limits
- [ ] Backpressure handling prevents memory overflow
- [ ] Streaming maintains data integrity
- [ ] 70%+ reduction in memory usage for large datasets

### 3. Intelligent Caching

**Purpose**: Implement smart caching with versioning, invalidation, and performance monitoring.

#### Implementation Plan

1. **Create `pipelines/core/src/performance/smart-cache.ts`**:
```typescript
export interface CacheOptions {
  ttl?: number;
  maxSize?: number; // MB
  version?: string;
  compressionEnabled?: boolean;
  metricsEnabled?: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  hitRate: number;
  currentSize: number;
  maxSize: number;
}

export class SmartCache<T = any> {
  private readonly cache = new Map<string, CacheEntry<T>>();
  private readonly options: Required<CacheOptions>;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    hitRate: 0,
    currentSize: 0,
    maxSize: 0
  };
  private currentSize = 0;
  
  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 3600000, // 1 hour default
      maxSize: options.maxSize || 100, // 100MB default
      version: options.version || '1.0.0',
      compressionEnabled: options.compressionEnabled || false,
      metricsEnabled: options.metricsEnabled || true,
      ...options
    };
    
    this.metrics.maxSize = this.options.maxSize;
    
    // Start cleanup interval
    if (this.options.ttl > 0) {
      setInterval(() => this.cleanup(), 60000); // Every minute
    }
  }
  
  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }
    
    // Check if entry is expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.metrics.evictions++;
      this.currentSize -= entry.size;
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }
    
    // Check version compatibility
    if (!this.isVersionCompatible(entry)) {
      this.cache.delete(key);
      this.metrics.evictions++;
      this.currentSize -= entry.size;
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }
    
    // Update access metadata
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    this.metrics.hits++;
    this.updateHitRate();
    
    return this.decompress(entry.data);
  }
  
  async set(key: string, data: T, options?: { ttl?: number; version?: string }): Promise<void> {
    const ttl = options?.ttl || this.options.ttl;
    const version = options?.version || this.options.version;
    const compressedData = this.compress(data);
    const size = this.calculateSize(compressedData);
    
    // Check if we need to evict entries
    await this.ensureCapacity(size);
    
    const entry: CacheEntry<T> = {
      data: compressedData,
      timestamp: Date.now(),
      ttl,
      version,
      size,
      accessCount: 0,
      lastAccessed: Date.now()
    };
    
    this.cache.set(key, entry);
    this.currentSize += size;
    this.metrics.sets++;
  }
  
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    this.cache.delete(key);
    this.currentSize -= entry.size;
    this.metrics.deletes++;
    return true;
  }
  
  getMetrics(): CacheMetrics {
    return { ...this.metrics, currentSize: this.currentSize };
  }
  
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
  
  private isVersionCompatible(entry: CacheEntry<T>): boolean {
    // Simple version comparison - can be enhanced
    return entry.version === this.options.version;
  }
  
  private compress(data: T): T {
    if (!this.options.compressionEnabled) {
      return data;
    }
    
    // Simple compression - can be enhanced with better algorithms
    if (typeof data === 'string') {
      return require('zlib').gzipSync(data) as any;
    }
    
    return data;
  }
  
  private decompress(data: T): T {
    if (!this.options.compressionEnabled) {
      return data;
    }
    
    try {
      if (typeof data === 'string' && (data as string).startsWith('\x1f\x8b')) {
        return require('zlib').gunzipSync(data) as any;
      }
    } catch {
      return data;
    }
    
    return data;
  }
  
  private calculateSize(data: T): number {
    if (typeof data === 'string') {
      return Buffer.byteLength(data);
    } else if (Buffer.isBuffer(data)) {
      return data.length;
    } else {
      return Buffer.byteLength(JSON.stringify(data));
    }
  }
  
  private async ensureCapacity(requiredSize: number): Promise<void> {
    while (this.currentSize + requiredSize > this.options.maxSize * 1024 * 1024) {
      // Evict least recently used entries
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      if (entries.length === 0) break;
      
      const [key, entry] = entries[0];
      this.cache.delete(key);
      this.currentSize -= entry.size;
      this.metrics.evictions++;
    }
  }
  
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        toDelete.push(key);
      }
    }
    
    toDelete.forEach(key => {
      const entry = this.cache.get(key)!;
      this.cache.delete(key);
      this.currentSize -= entry.size;
      this.metrics.evictions++;
    });
  }
  
  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
  }
}
```

2. **Migration Steps**:
   - Replace LevelDB usage with SmartCache in all pipelines
   - Add cache metrics collection and reporting
   - Implement cache versioning for schema changes
   - Add compression for large cache entries

**Acceptance Criteria**:
- [ ] Cache hit rate > 80% for repeated operations
- [ ] Memory usage stays within configured limits
- [ ] Automatic cleanup of expired entries
- [ ] Version-aware cache invalidation
- [ ] Performance metrics collection and reporting

## Implementation Timeline

### Phase 1: Parallel Processing (Week 1)
1. **Implement ParallelProcessor class** - 2 days
2. **Update simtask pipeline** - 2 days
3. **Update boardrev pipeline** - 2 days
4. **Performance testing and optimization** - 1 day

### Phase 2: Streaming Processing (Week 2)
1. **Implement StreamProcessor class** - 2 days
2. **Update large dataset processing** - 2 days
3. **Add backpressure handling** - 1 day
4. **Memory usage testing** - 2 days

### Phase 3: Smart Caching (Week 3)
1. **Implement SmartCache class** - 3 days
2. **Replace existing cache implementations** - 2 days
3. **Add cache metrics and monitoring** - 1 day
4. **Performance benchmarking** - 1 day

## Performance Targets

### Processing Speed
- [ ] 50%+ improvement in file processing speed
- [ ] 70%+ reduction in processing time for large datasets
- [ ] Parallel execution utilization > 80% on multi-core systems

### Memory Usage
- [ ] 60%+ reduction in peak memory usage
- [ ] Stable memory usage for long-running operations
- [ ] No memory leaks in 24-hour stress tests

### Cache Performance
- [ ] Cache hit rate > 85% for repeated operations
- [ ] Cache size stays within configured limits
- [ ] Sub-second cache access times

### Resource Utilization
- [ ] CPU utilization > 70% on multi-core systems
- [ ] I/O operations overlapped with computation
- [ ] Efficient disk usage with minimal temporary files

## Testing Strategy

### Performance Tests
- [ ] Benchmark current vs optimized performance
- [ ] Load testing with large datasets
- [ ] Memory leak detection tests
- [ ] Concurrency stress tests

### Regression Tests
- [ ] All existing functionality preserved
- [ ] No performance degradation in single-threaded scenarios
- [ ] Backward compatibility maintained
- [ ] Configuration options still respected

### Monitoring Tests
- [ ] Performance metrics collection accuracy
- [ ] Memory monitoring accuracy
- [ ] Cache metrics accuracy
- [ ] Resource cleanup verification

## Success Metrics

### Quantitative Improvements
- [ ] 50%+ reduction in processing time
- [ ] 60%+ reduction in memory usage
- [ ] 85%+ cache hit rate
- [ ] 80%+ CPU utilization on multi-core systems

### Qualitative Improvements
- [ ] Better responsiveness for large datasets
- [ ] Improved system stability under load
- [ ] Enhanced debugging and monitoring capabilities
- [ ] Reduced resource contention

### Scalability Improvements
- [ ] Linear performance scaling with dataset size
- [ ] Efficient resource utilization at scale
- [ ] Graceful degradation under resource pressure
- [ ] Predictable performance characteristics

This specification provides a comprehensive approach to dramatically improving pipeline performance while maintaining reliability and backward compatibility.