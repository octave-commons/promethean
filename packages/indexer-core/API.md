# API Reference - @promethean/indexer-core

This document provides detailed API reference for the `@promethean/indexer-core` package.

## Table of Contents

- [Core Functions](#core-functions)
- [IndexerManager Class](#indexermanager-class)
- [State Management](#state-management)
- [Embedding Integration](#embedding-integration)
- [File Pattern Matching](#file-pattern-matching)
- [Type Definitions](#type-definitions)

## Core Functions

### `createIndexerManager(): IndexerManager`

Creates a new instance of the IndexerManager class.

**Returns:**
- `IndexerManager` - A new indexer manager instance

**Example:**
```typescript
import { createIndexerManager } from '@promethean/indexer-core';

const manager = createIndexerManager();
```

### `gatherRepoFiles(rootPath, options?): Promise<FileGatherResult>`

Discovers files in a repository using glob patterns with security validation.

**Parameters:**
- `rootPath: string` - Absolute path to the repository root
- `options?: FileGatherOptions` - Optional configuration
  - `include?: readonly string[]` - Inclusion glob patterns
  - `exclude?: readonly string[]` - Exclusion glob patterns

**Returns:**
- `Promise<FileGatherResult>` - Object containing discovered files and metadata

**Example:**
```typescript
const { files, fileInfo } = await gatherRepoFiles('/path/to/repo', {
  include: ['**/*.ts', '**/*.md'],
  exclude: ['node_modules/**', 'test/**']
});
```

### `search(rootPath, query, n?): Promise<SearchResult[]>`

Performs semantic search on indexed content using vector similarity.

**Parameters:**
- `rootPath: string` - Path to the indexed repository
- `query: string` - Search query text
- `n?: number` - Maximum number of results (default: 8)

**Returns:**
- `Promise<SearchResult[]>` - Array of search results with metadata

**Example:**
```typescript
const results = await search('/path/to/repo', 'authentication logic', 10);
console.log(results);
// Output: [{ id: 'src/auth.ts#0', path: 'src/auth.ts', score: 0.85, ... }]
```

### `indexFile(rootPath, relativePath, options?): Promise<IndexResult>`

Indexes a single file with chunking and embedding generation.

**Parameters:**
- `rootPath: string` - Repository root path
- `relativePath: string` - Relative path to the file
- `options?: Record<string, unknown>` - Additional options (currently unused)

**Returns:**
- `Promise<IndexResult>` - Result indicating success/failure and metadata

**Example:**
```typescript
const result = await indexFile('/path/to/repo', 'src/auth.ts');
if (result.ok) {
  console.log(`Indexed ${result.processed} chunks`);
}
```

### `removeFileFromIndex(rootPath, relativePath): Promise<ControlResult>`

Removes a file and all its chunks from the index.

**Parameters:**
- `rootPath: string` - Repository root path
- `relativePath: string` - Relative path to the file

**Returns:**
- `Promise<ControlResult>` - Result indicating success/failure

**Example:**
```typescript
const result = await removeFileFromIndex('/path/to/repo', 'src/old-file.ts');
```

### `reindexAll(rootPath, options?): Promise<ReindexResult>`

Reindexes all files in a repository, replacing existing index.

**Parameters:**
- `rootPath: string` - Repository root path
- `options?: ReindexOptions` - Optional configuration
  - `include?: string[]` - Inclusion patterns
  - `exclude?: string[]` - Exclusion patterns
  - `limit?: number` - Maximum files to process

**Returns:**
- `Promise<ReindexResult>` - Result with processing statistics

**Example:**
```typescript
const result = await reindexAll('/path/to/repo', {
  include: ['**/*.ts'],
  limit: 100
});
```

### `reindexSubset(rootPath, globs, options?): Promise<ReindexResult>`

Reindexes files matching specific glob patterns.

**Parameters:**
- `rootPath: string` - Repository root path
- `globs: string | string[]` - Glob patterns to match
- `options?: ReindexOptions` - Optional configuration

**Returns:**
- `Promise<ReindexResult>` - Result with processing statistics

**Example:**
```typescript
const result = await reindexSubset('/path/to/repo', 'src/**/*.ts');
```

## IndexerManager Class

The main class for managing file indexing operations with queue management and state persistence.

### Constructor

```typescript
class IndexerManager {
  constructor()
}
```

### Methods

#### `ensureBootstrap(rootPath): Promise<void>`

Initializes or resumes the indexing process for a repository.

**Parameters:**
- `rootPath: string` - Path to the repository

**Behavior:**
- Resumes previous bootstrap state if available
- Starts fresh bootstrap if no previous state
- Automatically begins processing files

**Example:**
```typescript
await manager.ensureBootstrap('/path/to/repo');
```

#### `status(): IndexerStatus`

Returns the current status of the indexer.

**Returns:**
- `IndexerStatus` - Current indexer state and statistics

**Example:**
```typescript
const status = manager.status();
console.log(`Mode: ${status.mode}, Processed: ${status.processedFiles}`);
```

#### `isBusy(): boolean`

Checks if the indexer is currently processing files.

**Returns:**
- `boolean` - True if actively processing or has queued files

**Example:**
```typescript
if (manager.isBusy()) {
  console.log('Indexer is working...');
}
```

#### `scheduleReindexAll(): Promise<ScheduleResult>`

Queues all files for reindexing (only works in indexed mode).

**Returns:**
- `Promise<ScheduleResult>` - Result indicating if files were queued

**Example:**
```typescript
const result = await manager.scheduleReindexAll();
console.log(`Queued ${result.queued} files for reindexing`);
```

#### `scheduleReindexSubset(globs): Promise<ScheduleResult>`

Queues files matching glob patterns for reindexing.

**Parameters:**
- `globs: string | string[]` - Glob patterns to match

**Returns:**
- `Promise<ScheduleResult>` - Result indicating if files were queued

**Example:**
```typescript
const result = await manager.scheduleReindexSubset(['src/**/*.ts', 'docs/**/*.md']);
```

#### `scheduleIndexFile(path): Promise<ScheduleResult>`

Queues a single file for indexing.

**Parameters:**
- `path: string` - Relative path to the file

**Returns:**
- `Promise<ScheduleResult>` - Result indicating if file was queued

**Example:**
```typescript
const result = await manager.scheduleIndexFile('src/new-file.ts');
```

#### `removeFile(path): Promise<ControlResult>`

Removes a file from the index.

**Parameters:**
- `path: string` - Relative path to the file

**Returns:**
- `Promise<ControlResult>` - Result indicating success/failure

**Example:**
```typescript
const result = await manager.removeFile('src/obsolete.ts');
```

#### `resetAndBootstrap(rootPath): Promise<ControlResult>`

Resets the indexer state and starts fresh bootstrap.

**Parameters:**
- `rootPath: string` - Path to the repository

**Returns:**
- `Promise<ControlResult>` - Result indicating success/failure

**Example:**
```typescript
const result = await manager.resetAndBootstrap('/path/to/repo');
```

## State Management

### `createLevelCacheStateStore(cachePath?): IndexerStateStore`

Creates a state store using LevelDB for persistence.

**Parameters:**
- `cachePath?: string` - Path for cache storage (default: ".cache/indexer-core")

**Returns:**
- `IndexerStateStore` - State store implementation

**Example:**
```typescript
const stateStore = createLevelCacheStateStore('./custom-cache');
setIndexerStateStore(stateStore);
```

### `createMemoryStateStore(): IndexerStateStore`

Creates an in-memory state store for testing or temporary use.

**Returns:**
- `IndexerStateStore` - In-memory state store implementation

**Example:**
```typescript
const stateStore = createMemoryStateStore();
setIndexerStateStore(stateStore);
```

### `setIndexerStateStore(store): void`

Sets the global state store implementation.

**Parameters:**
- `store: IndexerStateStore` - State store implementation

**Example:**
```typescript
setIndexerStateStore(createLevelCacheStateStore());
```

### `loadBootstrapState(rootPath): Promise<BootstrapState | null>`

Loads the bootstrap state for a repository.

**Parameters:**
- `rootPath: string` - Repository path

**Returns:**
- `Promise<BootstrapState | null>` - Bootstrap state or null if not found

### `saveBootstrapState(rootPath, state): Promise<void>`

Saves the bootstrap state for a repository.

**Parameters:**
- `rootPath: string` - Repository path
- `state: IndexerStateBody` - State to save (excluding rootPath)

### `deleteBootstrapState(rootPath): Promise<void>`

Deletes the bootstrap state for a repository.

**Parameters:**
- `rootPath: string` - Repository path

## Embedding Integration

### `buildEmbeddingFn(): Promise<any>`

Builds an embedding function based on environment configuration.

**Returns:**
- `Promise<any>` - Configured embedding function

**Example:**
```typescript
const embeddingFn = await buildEmbeddingFn();
const embeddings = await embeddingFn.generate(['text to embed']);
```

### `embeddingEnvConfig(): EmbeddingConfig`

Returns the current embedding configuration from environment variables.

**Returns:**
- `EmbeddingConfig` - Current embedding settings

**Example:**
```typescript
const config = embeddingEnvConfig();
console.log(`Using ${config.driver} with ${config.fn}`);
```

### `setEmbeddingFactory(factory): void`

Sets a custom embedding factory for testing or custom implementations.

**Parameters:**
- `factory: (() => Promise<any>) | null` - Factory function or null to reset

**Example:**
```typescript
setEmbeddingFactory(async () => ({
  generate: async (texts) => /* custom logic */
}));
```

### `setEmbeddingOverride(override): void`

Sets a custom embedding override with timeout protection.

**Parameters:**
- `override: EmbeddingOverride | null` - Override function or null to reset

**Example:**
```typescript
setEmbeddingOverride(async (ctx) => {
  // Custom embedding logic with timeout protection
  return customEmbedding(ctx.texts);
});
```

## File Pattern Matching

### `createInclusionChecker(patterns, options?): (path: string) => boolean`

Creates a function to check if a path matches inclusion patterns.

**Parameters:**
- `patterns: readonly string[]` - Glob patterns
- `options?: Partial<Limits>` - Optional limits for pattern compilation

**Returns:**
- `(path: string) => boolean` - Function that tests path inclusion

**Example:**
```typescript
const shouldInclude = createInclusionChecker(['**/*.ts', '**/*.js']);
if (shouldInclude('src/component.ts')) {
  console.log('File should be included');
}
```

### `deriveExtensions(patterns, options?): Set<string> | undefined`

Derives file extensions from glob patterns.

**Parameters:**
- `patterns: readonly string[]` - Glob patterns
- `options?: DeriveOptions` - Optional configuration

**Returns:**
- `Set<string> | undefined` - Set of extensions or undefined if patterns are complex

**Example:**
```typescript
const extensions = deriveExtensions(['**/*.ts', '**/*.js']);
console.log(extensions); // Set { '.ts', '.js' }
```

### `expandBraces(pattern: string): string[]`

Expands brace patterns in glob strings.

**Parameters:**
- `pattern: string` - Pattern with brace expansion

**Returns:**
- `string[]` - Expanded patterns

**Example:**
```typescript
const expanded = expandBraces('src/**/*.{ts,js}');
// Returns: ['src/**/*.ts', 'src/**/*.js']
```

### `toPosixPath(value: string): string`

Converts a path to POSIX format (forward slashes).

**Parameters:**
- `value: string` - Path to convert

**Returns:**
- `string` - POSIX-formatted path

**Example:**
```typescript
const posix = toPosixPath('src\\components\\Button.tsx');
// Returns: 'src/components/Button.tsx'
```

## Type Definitions

### IndexerStatus

```typescript
interface IndexerStatus {
  mode: 'bootstrap' | 'indexed';
  active: boolean;
  queuedFiles: number;
  processedFiles: number;
  startedAt: number | null;
  finishedAt: number | null;
  lastError: string | null;
  bootstrap?: {
    total: number;
    cursor: number;
    remaining: number;
  };
}
```

### SearchResult

```typescript
interface SearchResult {
  id: string;
  path: string;
  chunkIndex: number;
  startLine: number;
  endLine: number;
  score?: number;
  text: string;
}
```

### FileGatherResult

```typescript
interface FileGatherResult {
  files: string[];
  fileInfo: Record<string, { size: number; mtimeMs: number }>;
}
```

### IndexResult

```typescript
interface IndexResult {
  ok: boolean;
  path?: string;
  processed?: number;
  error?: string;
}
```

### ControlResult

```typescript
interface ControlResult {
  ok: boolean;
  error?: string;
}
```

### ScheduleResult

```typescript
interface ScheduleResult {
  ok: boolean;
  queued?: number;
  ignored?: boolean;
  mode?: string;
}
```

### ReindexResult

```typescript
interface ReindexResult {
  family: string;
  version: string;
  processed: number;
}
```

### BootstrapState

```typescript
interface BootstrapState {
  rootPath: string;
  mode?: string;
  cursor?: number;
  fileList?: readonly string[];
  startedAt?: number;
  finishedAt?: number;
  fileInfo?: Record<string, { readonly size: number; readonly mtimeMs: number }>;
}
```

### IndexerStateStore

```typescript
interface IndexerStateStore {
  load(rootPath: string): Promise<BootstrapState | null>;
  save(rootPath: string, state: IndexerStateBody): Promise<void>;
  delete(rootPath: string): Promise<void>;
}
```

### EmbeddingConfig

```typescript
interface EmbeddingConfig {
  driver: string;
  fn: string;
}
```

### EmbeddingOverride

```typescript
type EmbeddingOverride = (ctx: EmbeddingOverrideContext) => Promise<any>;
```

### EmbeddingOverrideContext

```typescript
interface EmbeddingOverrideContext {
  texts: string[];
  timeoutMs: number;
}
```

## Global Configuration

### ChromaDB Integration

```typescript
// Set custom ChromaDB client
setChromaClient(customChromaClient);

// Reset to default ChromaDB client
resetChroma();
```

### Logger Configuration

```typescript
import { setIndexerLogger, createLogger } from '@promethean/utils';

setIndexerLogger(createLogger({ 
  service: 'indexer-core', 
  level: 'debug' 
}));
```

### Collection Management

```typescript
// Get or create a collection for specific configuration
const collection = await collectionForFamily('repo_files', 'v1', {
  driver: 'ollama',
  fn: 'nomic-embed-text',
  dims: 768
});
```