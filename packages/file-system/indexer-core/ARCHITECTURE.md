# Architecture Documentation - @promethean/indexer-core

This document describes the architecture, design patterns, and internal workings of the `@promethean/indexer-core` package.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Design Patterns](#design-patterns)
- [Security Architecture](#security-architecture)
- [Performance Architecture](#performance-architecture)
- [State Management](#state-management)
- [Error Handling](#error-handling)
- [Extensibility](#extensibility)

## Overview

The `@promethean/indexer-core` package is designed as a modular, extensible system for file indexing and semantic search. It follows a layered architecture with clear separation of concerns, making it suitable for both standalone use and integration into larger systems.

### Key Architectural Principles

1. **Modularity**: Each component has a single responsibility and clear interfaces
2. **Security**: Path traversal protection and input validation at all boundaries
3. **Performance**: Efficient file processing with chunking and queuing
4. **Reliability**: Robust error handling and state persistence
5. **Extensibility**: Pluggable components for embedding and state storage

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  IndexerManager  │  Search Interface  │  File Operations    │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Queue Manager  │  State Manager  │  Embedding Service     │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                      │
├─────────────────────────────────────────────────────────────┤
│  File Scanner   │  ChromaDB Client │  State Store          │
├─────────────────────────────────────────────────────────────┤
│                    System Layer                             │
├─────────────────────────────────────────────────────────────┤
│  File System    │  Network I/O     │  Process Management   │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### Application Layer
- **IndexerManager**: Main orchestrator for indexing operations
- **Search Interface**: Public API for semantic search
- **File Operations**: High-level file manipulation functions

#### Service Layer
- **Queue Manager**: Manages file processing queues and scheduling
- **State Manager**: Handles persistence and recovery of indexer state
- **Embedding Service**: Abstracts embedding generation and caching

#### Infrastructure Layer
- **File Scanner**: Low-level file discovery and validation
- **ChromaDB Client**: Vector database operations
- **State Store**: Pluggable persistence backends

#### System Layer
- **File System**: Raw file I/O operations
- **Network I/O**: External service communication
- **Process Management**: Resource management and cleanup

## Core Components

### IndexerManager

The central orchestrator that coordinates all indexing operations.

```typescript
class IndexerManager {
  // State management
  mode: 'bootstrap' | 'indexed';
  queue: string[];
  active: boolean;
  
  // Core operations
  async ensureBootstrap(rootPath: string): Promise<void>
  async scheduleReindexAll(): Promise<ScheduleResult>
  async scheduleReindexSubset(globs: string[]): Promise<ScheduleResult>
  
  // Queue management
  enqueueFiles(rels: string[]): void
  async _drain(): Promise<void>
  
  // State persistence
  async _scheduleIncremental(prev: BootstrapState): Promise<void>
}
```

**Key Design Decisions:**
- **Queue-based Processing**: Prevents resource exhaustion and enables progress tracking
- **State Persistence**: Allows resuming interrupted operations
- **Mode Switching**: Separate bootstrap and incremental modes for optimal performance

### File Scanner

Handles secure file discovery with glob pattern matching.

```typescript
export async function gatherRepoFiles(
  rootPath: string,
  options: { include?: readonly string[]; exclude?: readonly string[] }
): Promise<FileGatherResult>
```

**Security Features:**
- **Path Validation**: All paths resolved and validated against root directory
- **Traversal Protection**: Prevents access to files outside repository
- **Pattern Limits**: Prevents ReDoS attacks with compilation limits

**Performance Optimizations:**
- **Extension Filtering**: Early filtering by file extension
- **Parallel Processing**: Concurrent file stat operations
- **Memory Efficiency**: Streaming file discovery

### Embedding Integration

Pluggable embedding service with caching and timeout protection.

```typescript
export async function buildEmbeddingFn(): Promise<any>
export function setEmbeddingFactory(factory: (() => Promise<any>) | null): void
export function setEmbeddingOverride(override: EmbeddingOverride | null): void
```

**Architecture Benefits:**
- **Service Abstraction**: Supports multiple embedding providers
- **Caching**: Reduces redundant embedding generation
- **Timeout Protection**: Prevents hanging operations
- **Fallback Support**: Graceful degradation when services fail

### State Management

Persistent state management with pluggable backends.

```typescript
export interface IndexerStateStore {
  load(rootPath: string): Promise<BootstrapState | null>
  save(rootPath: string, state: IndexerStateBody): Promise<void>
  delete(rootPath: string): Promise<void>
}
```

**Available Implementations:**
- **LevelDB Store**: Persistent disk-based storage
- **Memory Store**: In-memory storage for testing
- **Custom Stores**: User-defined persistence backends

## Data Flow

### Bootstrap Indexing Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Start         │    │ Load Previous   │    │ Scan Files      │
│   Bootstrap     │───▶│   State         │───▶│   Repository    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Create        │    │   Compare       │    │   Queue Files   │
│   File List     │───▶│   File States   │───▶│   for Processing│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Process       │    │   Update        │    │   Save State    │
│   Queue         │───▶│   Progress      │───▶│   Periodically  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Incremental Indexing Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Previous │    │   Scan Current  │    │   Compare       │
│   State         │───▶│   Repository    │───▶│   Changes       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Identify      │    │   Queue         │    │   Remove        │
│   New/Changed   │───▶│   for Indexing  │───▶│   Deleted Files │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Search Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Receive       │    │   Generate      │    │   Query         │
│   Search Query  │───▶│   Embedding     │───▶│   ChromaDB      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Rank Results  │    │   Load File     │    │   Return        │
│   by Similarity │───▶│   Metadata      │───▶│   Formatted     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Design Patterns

### 1. Strategy Pattern

Used for embedding services and state stores to allow runtime selection of implementations.

```typescript
// Embedding strategies
interface EmbeddingStrategy {
  generate(texts: string[]): Promise<number[][]>;
}

// State store strategies
interface StateStoreStrategy {
  load(key: string): Promise<any>;
  save(key: string, value: any): Promise<void>;
}
```

### 2. Observer Pattern

Used for progress tracking and event notification during indexing.

```typescript
interface IndexingObserver {
  onFileProcessed(file: string, success: boolean): void;
  onProgress(progress: number): void;
  onError(error: Error): void;
}
```

### 3. Factory Pattern

Used for creating configured instances of embedding functions and state stores.

```typescript
export function createLevelCacheStateStore(path?: string): IndexerStateStore
export function createMemoryStateStore(): IndexerStateStore
export async function buildEmbeddingFn(): Promise<EmbeddingFunction>
```

### 4. Command Pattern

Used for queuing and executing indexing operations.

```typescript
interface IndexingCommand {
  execute(): Promise<void>;
  canExecute(): boolean;
}
```

### 5. State Pattern

Used for managing different indexer modes (bootstrap vs indexed).

```typescript
interface IndexerState {
  processFile(file: string): Promise<void>;
  canReindex(): boolean;
}

class BootstrapState implements IndexerState { /* ... */ }
class IndexedState implements IndexerState { /* ... */ }
```

## Security Architecture

### Path Traversal Protection

Multi-layered path validation prevents directory traversal attacks:

```typescript
// 1. Path normalization and resolution
const resolved = await resolveWithinRoot(rootPath, userInput);

// 2. Relative path validation
if (!isSafeRelPath(rel)) {
  throw new Error('Invalid path');
}

// 3. Realpath validation
const realPath = await realpathOrNull(rootAbs, candidate);
if (!realPath || !isPathWithinRoot(rootReal, realPath)) {
  throw new Error('Path escapes index root');
}
```

### Input Validation

All external inputs are validated at entry points:

- **Glob Patterns**: Length limits and character validation
- **File Paths**: Format validation and character restrictions
- **Search Queries**: Length limits and content sanitization
- **Configuration**: Type checking and range validation

### Resource Limits

Prevents resource exhaustion attacks:

- **Pattern Compilation**: Limits on number of compiled patterns
- **File Processing**: Configurable delays between files
- **Memory Usage**: Streaming processing and chunking
- **Network Requests**: Timeout protection for embedding services

## Performance Architecture

### File Chunking Strategy

Files are chunked to optimize embedding generation and search relevance:

```typescript
function makeChunks(text: string, maxLen = 2000, overlap = 200) {
  // Creates overlapping chunks preserving context
  // Maintains line number and byte offset information
  // Optimized for embedding model context windows
}
```

**Benefits:**
- **Context Preservation**: Overlapping chunks maintain context
- **Search Precision**: Smaller chunks provide more precise matches
- **Memory Efficiency**: Processes large files in streaming fashion
- **Parallel Processing**: Chunks can be processed independently

### Queue Management

Intelligent queue management prevents resource exhaustion:

```typescript
class IndexerManager {
  private queue: string[] = [];
  private _draining: boolean = false;
  
  async _drain(): Promise<void> {
    const delayMs = Number(process.env.INDEXER_FILE_DELAY_MS || 250);
    
    while (this.queue.length) {
      // Process single file
      // Apply delay between files
      // Update progress
      // Persist state
    }
  }
}
```

**Features:**
- **Rate Limiting**: Configurable delays prevent resource spikes
- **Progress Tracking**: Real-time progress updates
- **State Persistence**: Resume capability after interruptions
- **Error Isolation**: Individual file failures don't stop processing

### Caching Strategy

Multi-level caching improves performance:

```typescript
// 1. Embedding function caching
let EMBEDDING_INSTANCE: any = null;
let EMBEDDING_INSTANCE_KEY: string | null = null;

// 2. Collection caching
const collectionCache = new Map<string, CollectionLike>();

// 3. State caching
const stateCache = createLevelCacheStateStore();
```

## State Management

### Bootstrap State

Tracks the complete indexing process:

```typescript
interface BootstrapState {
  rootPath: string;
  mode: 'bootstrap' | 'indexed';
  cursor?: number;           // Current position in file list
  fileList?: string[];       // Complete file list
  startedAt?: number;        // Process start time
  finishedAt?: number;       // Process completion time
  fileInfo?: Record<string, { size: number; mtimeMs: number }>;
}
```

### State Persistence

State is persisted at key points:

1. **Before Processing**: Initial state saved
2. **After Each File**: Progress updated
3. **On Completion**: Final state saved
4. **On Error**: Error state preserved

### Recovery Mechanisms

Multiple recovery strategies ensure reliability:

- **Bootstrap Recovery**: Resume interrupted bootstrap
- **Incremental Recovery**: Detect and process changes
- **Error Recovery**: Skip problematic files and continue
- **State Validation**: Verify state integrity on load

## Error Handling

### Error Categories

1. **Validation Errors**: Input validation failures
2. **File System Errors**: I/O operations and permissions
3. **Network Errors**: Embedding service failures
4. **State Errors**: Persistence and corruption issues
5. **Resource Errors**: Memory and exhaustion issues

### Error Handling Strategy

```typescript
try {
  await indexFile(rootPath, rel);
  this.processedFiles++;
} catch (e: any) {
  this.errors.push(String(e?.message || e));
  logger.error("index queue error", { err: e, path: rel });
  
  // Advance cursor to prevent stuck state
  if (this.mode === 'bootstrap' && this.bootstrap) {
    this.bootstrap.cursor++;
  }
}
```

### Error Recovery

- **Graceful Degradation**: Continue processing when possible
- **Error Logging**: Comprehensive error context and logging
- **State Preservation**: Maintain valid state despite errors
- **Retry Logic**: Automatic retry for transient failures

## Extensibility

### Plugin Architecture

The system supports multiple extension points:

```typescript
// 1. Custom embedding services
setEmbeddingFactory(async () => customEmbeddingService);

// 2. Custom state stores
setIndexerStateStore(customStateStore);

// 3. Custom ChromaDB clients
setChromaClient(customChromaClient);

// 4. Custom file scanners
// (Through dependency injection in gatherRepoFiles)
```

### Configuration Points

Multiple configuration options allow customization:

- **Environment Variables**: Runtime configuration
- **Factory Functions**: Custom component creation
- **Override Functions**: Behavior modification
- **Options Objects**: Feature configuration

### Integration Patterns

The package supports various integration patterns:

- **Library Integration**: Direct API usage
- **Service Integration**: HTTP wrapper (indexer-service)
- **CLI Integration**: Command-line tools
- **Agent Integration**: AI agent workflows

## Future Architecture Considerations

### Scalability

- **Horizontal Scaling**: Multiple indexer instances
- **Distributed Processing**: Parallel file processing
- **Load Balancing**: Work distribution across instances
- **Caching Layers**: Multi-level caching strategies

### Performance

- **Streaming Processing**: Large file handling
- **Parallel Embedding**: Concurrent embedding generation
- **Batch Operations**: Bulk processing optimizations
- **Memory Management**: Efficient memory usage patterns

### Monitoring

- **Metrics Collection**: Performance and health metrics
- **Progress Tracking**: Real-time progress monitoring
- **Error Analytics**: Error pattern analysis
- **Resource Monitoring**: Resource usage tracking

### Security

- **Authentication**: Access control mechanisms
- **Authorization**: Permission-based access
- **Audit Logging**: Comprehensive audit trails
- **Encryption**: Data protection mechanisms