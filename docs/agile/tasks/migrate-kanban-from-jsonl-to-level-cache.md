---
uuid: 48d398a7-9f4e-4c2a-8b15-3d7e8f9c2a1b
title: Migrate kanban system from JSONL to level-cache for memory efficiency
status: breakdown
priority: P1
labels:
  - kanban
  - architecture
  - performance
  - level-cache
  - memory-optimization
created_at: '2025-10-05T00:00:00.000Z'
---

## 🛠️ Task: Migrate kanban system from JSONL to level-cache for memory efficiency

## 🐛 Problem Statement

The current kanban system loads **all tasks into memory** using a JSONL index file, causing:
- **Memory exhaustion**: Heap crashes with 300+ tasks (demonstrated in current session)
- **Poor scalability**: O(n) memory usage regardless of operation
- **No streaming**: All operations require full dataset in memory
- **Performance degradation**: Linear search through all tasks for queries

## 🎯 Desired Outcome

### Performance Goals:
- **O(1) memory usage** regardless of task count (10, 100, 1000+ tasks)
- **O(log n) query performance** vs current O(n) scanning
- **Streaming operations** for large result sets
- **Constant-time lookups** by UUID, status, priority, labels

### Functional Goals:
- **Backward compatibility**: Maintain existing CLI API surface
- **Zero-downtime migration**: Seamless transition from JSONL to level-cache
- **Cache management**: TTL, cleanup, rebuild capabilities
- **Reliability**: No more heap exhaustion crashes

## 📋 Requirements

### Phase 1: TaskCache Interface Design
- [ ] Create `TaskCache` interface abstracting level-cache operations
- [ ] Define cache key structure for task indexing
- [ ] Design streaming APIs for large result sets
- [ ] Plan backward-compatible API surface

### Phase 2: Cache Schema Design
```typescript
// Cache structure design:
tasks/by-id/{uuid}           → IndexedTask (full task data)
tasks/by-status/{status}     → Set<uuid> (status indexes)
tasks/by-priority/{priority} → Set<uuid> (priority indexes)
tasks/by-label/{label}       → Set<uuid> (label indexes)
tasks/search-index/{term}    → Set<uuid> (full-text search)
meta/last-indexed            → timestamp (cache metadata)
meta/task-count              → number (cache statistics)
```

### Phase 3: Core Implementation
- [ ] Implement `TaskCache` class using `@promethean/level-cache`
- [ ] Create task indexing and storage methods
- [ ] Implement query methods (by UUID, status, priority, labels)
- [ ] Add streaming result iteration
- [ ] Implement cache rebuild/refresh functionality

### Phase 4: API Migration
- [ ] Update `packages/kanban/src/board/indexer.ts` to use TaskCache
- [ ] Modify `indexTasks` to return TaskCache instead of Array<IndexedTask>
- [ ] Update `searchTasks`, `getColumn`, etc. to use streaming APIs
- [ ] Maintain backward compatibility for CLI commands
- [ ] Add migration utilities and fallback handling

### Phase 5: Configuration & Migration
- [ ] Add `cachePath` to kanban config (default: `.kanban/cache`)
- [ ] Create migration script: JSONL → level-cache
- [ ] Add cache validation and repair tools
- [ ] Update documentation for new architecture
- [ ] Add cache management CLI commands

### Phase 6: Testing & Performance
- [ ] Unit tests for TaskCache operations
- [ ] Integration tests with large datasets (1000+ tasks)
- [ ] Memory usage profiling and validation
- [ ] Performance benchmarks vs JSONL approach
- [ ] CLI compatibility testing

## 🏗️ Implementation Plan

### Step 1: TaskCache Interface
```typescript
interface TaskCache {
  // Direct access
  getTask(uuid: string): Promise<IndexedTask | undefined>
  hasTask(uuid: string): Promise<boolean>

  // Query operations (streaming)
  getTasksByStatus(status: string): AsyncIterable<IndexedTask>
  getTasksByPriority(priority: string): AsyncIterable<IndexedTask>
  getTasksByLabel(label: string): AsyncIterable<IndexedTask>
  searchTasks(query: string): AsyncIterable<IndexedTask>

  // Cache management
  indexTasks(tasks: Iterable<IndexedTask>): Promise<number>
  rebuildIndex(): Promise<void>
  sweepExpired(): Promise<number>
  close(): Promise<void>
}
```

### Step 2: Replace Memory-Heavy Operations
- **Before**: `indexTasks()` → `Array<IndexedTask>` (all in memory)
- **After**: `indexTasks()` → `TaskCache` (key-based access)

### Step 3: Streaming Query Results
- **Before**: `getColumn(board, column)` → `Array<Task>` (loaded all)
- **After**: `getColumn(cache, column)` → `AsyncIterable<Task>` (streaming)

## 📊 Cache Schema Design

### Key Structure:
```typescript
// Namespaced keys using level-cache
"tasks/by-id/123e4567-e89b-12d3-a456-426614174000"
"tasks/by-status/todo"           → Set<uuid>
"tasks/by-priority/P2"           → Set<uuid>
"tasks/by-label/kanban"          → Set<uuid>
"tasks/search-index/keyword"     → Set<uuid>
"meta/last-indexed"              → timestamp
```

### Value Types:
```typescript
// Full task data (only stored once per task)
type CachedTask = IndexedTask

// Index sets (UUID arrays for fast lookups)
type UUIDSet = string[]

// Metadata
type CacheMeta = {
  lastIndexed: number
  taskCount: number
  version: string
}
```

## 🔄 Migration Strategy

### Zero-Downtime Approach:
1. **Dual mode**: Support both JSONL and level-cache during transition
2. **Automatic migration**: Detect JSONL, migrate to level-cache on first run
3. **Fallback handling**: Graceful degradation if level-cache fails
4. **Validation**: Verify migrated data integrity

### Migration Steps:
1. Create level-cache instance
2. Read existing JSONL index (if exists)
3. Populate level-cache with task data and indexes
4. Validate migrated data completeness
5. Switch to level-cache as primary store
6. Archive/remove JSONL file (optional)

## ⚡ Performance Benefits

### Memory Usage:
- **Current**: O(n) where n = total tasks (316+ tasks = ~50MB+)
- **After**: O(1) constant memory (~1MB cache overhead)

### Query Performance:
- **Current**: O(n) linear scan through all tasks
- **After**: O(log n) key-based lookup + streaming

### Scalability:
- **Current**: Fails at ~300+ tasks (heap exhaustion)
- **After**: Handles 10,000+ tasks with constant memory

## 🔗 Related Resources

- **Current code**: `packages/kanban/src/board/indexer.ts`
- **Memory issue**: JSONL index loading all tasks into memory
- **Level cache**: `packages/level-cache/src/index.ts` (Cache interface)
- **Config**: `promethean.kanban.json` (needs cachePath addition)
- **CLI commands**: All kanban operations need updating

## ✅ Acceptance Criteria

1. **Memory Efficiency**: Kanban operations work with 1000+ tasks without memory issues
2. **Performance**: Query operations complete in <100ms regardless of task count
3. **Backward Compatibility**: All existing CLI commands work unchanged
4. **Migration**: Automatic JSONL → level-cache migration with data integrity
5. **Reliability**: No more heap exhaustion crashes during normal operations
6. **Documentation**: Updated architecture docs and cache management guide

## 📝 Technical Notes

### level-cache Interface (reviewed):
```typescript
interface Cache<T> {
  get(key: string): Promise<T | undefined>
  set(key: string, value: T, opts?: PutOptions): Promise<void>
  del(key: string): Promise<void>
  batch(ops: Array<PutOp|DelOp>): Promise<void>
  entries(opts?: {limit?: number}): AsyncGenerator<[string, T]>
  sweepExpired(): Promise<number>
  withNamespace(ns: string): Cache<T>
  close(): Promise<void>
}
```

### Key Advantages:
- **Namespaces**: Logical separation (tasks/, meta/, indexes/)
- **TTL**: Automatic expiration of stale cache entries
- **Batch operations**: Efficient bulk updates
- **Streaming**: `entries()` provides AsyncGenerator for iteration
- **No background processes**: Predictable resource usage

This migration will solve the fundamental scaling issue causing current memory exhaustion and provide a robust foundation for future kanban system growth.