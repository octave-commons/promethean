# Chroma Write Queue Implementation

## Overview

The Chroma Write Queue is a batching system designed to reduce ChromaDB connection errors by grouping individual writes into batches. This addresses the 422 status errors that occur when too many concurrent writes overwhelm the ChromaDB server.

## Problem Solved

**Before**: Individual ChromaDB writes for each event

```
Event 1 → chromaCollection.add() → 422 Error
Event 2 → chromaCollection.add() → 422 Error
Event 3 → chromaCollection.add() → 422 Error
```

**After**: Batched writes with retry logic

```
Event 1, 2, 3 → Queue → Batch → chromaCollection.add() → Success
```

## Architecture

### Core Components

1. **ChromaWriteQueue Class**

   - Batches writes by configurable size and time
   - Implements exponential backoff retry logic
   - Provides graceful degradation on failures

2. **Integration Points**
   - `DualStoreManager.insert()` now uses queue instead of direct writes
   - Queue instances are cached per collection name
   - Automatic cleanup on shutdown

### Configuration

```typescript
interface WriteQueueConfig {
  batchSize: number; // Default: 10
  flushIntervalMs: number; // Default: 1000ms
  maxRetries: number; // Default: 3
  retryDelayMs: number; // Default: 2000ms
  enabled: boolean; // Default: true
}
```

### Environment Variables

- `CHROMA_QUEUE_BATCH_SIZE`: Override batch size
- `CHROMA_QUEUE_FLUSH_INTERVAL`: Override flush interval
- `CHROMA_QUEUE_MAX_RETRIES`: Override max retries
- `CHROMA_QUEUE_ENABLED`: Enable/disable queue (true/false)

## Usage

### Basic Usage (Automatic)

The queue is automatically used when creating `DualStoreManager` instances:

```typescript
const store = await DualStoreManager.create('events', 'text', 'timestamp');
await store.insert({ text: 'Hello', metadata: { type: 'event' } });
// Write is automatically queued and batched
```

### Monitoring Queue Status

```typescript
const stats = store.getChromaQueueStats();
console.log(stats);
// {
//   queueLength: 0,
//   processing: false,
//   config: { batchSize: 10, flushIntervalMs: 1000, ... }
// }
```

### Manual Configuration

```typescript
const store = await DualStoreManager.create('events', 'text', 'timestamp');
const queue = store.getChromaQueue();
queue.updateConfig({ batchSize: 20, flushIntervalMs: 500 });
```

## Behavior

### Batching Logic

1. **Auto-flush on batch size**: When `queue.length >= batchSize`
2. **Periodic flush**: Every `flushIntervalMs` milliseconds
3. **Force flush**: Available via `queue.forceFlush()`

### Retry Logic

- Exponential backoff: `delay = retryDelayMs * 2^(attempt-1)`
- Max retries: `maxRetries` (default: 3)
- Failed writes are rejected after max retries

### Error Handling

- MongoDB writes continue regardless of ChromaDB status
- Vector write status tracked in MongoDB metadata
- Graceful degradation when ChromaDB is unavailable

## Testing

### Unit Tests

```bash
pnpm --filter @promethean-os/persistence test -- --match="*chroma-write-queue*"
```

### Integration Test

```bash
cd packages/persistence
node dist/test-queue-integration.js
```

## Migration

The queue is backward compatible:

1. **Existing code**: No changes required
2. **Direct writes**: Set `enabled: false` in config
3. **Monitoring**: Use `getChromaQueueStats()` for visibility

## Performance Impact

### Benefits

- **Reduced ChromaDB load**: Fewer concurrent connections
- **Better error recovery**: Automatic retries with backoff
- **Improved reliability**: Graceful degradation on failures
- **Monitoring**: Queue statistics for observability

### Trade-offs

- **Slight latency**: Batching adds up to `flushIntervalMs` delay
- **Memory usage**: Queued writes held in memory
- **Complexity**: Additional retry logic to manage

## Troubleshooting

### Common Issues

1. **Queue not flushing**: Check `flushIntervalMs` and `batchSize`
2. **High memory usage**: Reduce `batchSize` or `flushIntervalMs`
3. **Persistent failures**: Check ChromaDB server status and network

### Debug Logging

Enable debug logging to see queue operations:

```bash
DEBUG=chroma-write-queue:* node your-app.js
```

## Future Enhancements

1. **Dynamic scaling**: Auto-adjust batch size based on error rates
2. **Priority queuing**: Urgent writes bypass queue
3. **Persistence**: Queue state survives restarts
4. **Metrics**: Prometheus integration for monitoring
