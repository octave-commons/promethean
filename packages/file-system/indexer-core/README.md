# @promethean/indexer-core

Core indexing functionality for the Promethean Framework, providing file scanning, embedding generation, and semantic search capabilities with ChromaDB integration.

## 🚀 Overview

`@promethean/indexer-core` is the foundational package for file indexing and semantic search within the Promethean Framework. It provides:

- **File Scanning**: Intelligent repository file discovery with glob patterns and exclusion rules
- **Embedding Generation**: Integration with various embedding services (Ollama, OpenAI, etc.)
- **Semantic Search**: Vector-based search using ChromaDB for finding relevant code and documentation
- **State Management**: Persistent state tracking for bootstrap and incremental indexing
- **Queue Management**: Robust file processing queue with error handling and retry logic

## 📦 Installation

```bash
pnpm add @promethean/indexer-core
```

## 🏗️ Architecture

The package follows a modular architecture with clear separation of concerns:

```
indexer-core/
├── indexer.ts          # Main IndexerManager and core functionality
├── embedding.ts        # Embedding service integration
├── glob.ts            # File pattern matching and utilities
├── state/
│   └── index.ts       # State management and persistence
└── tests/
    └── unit/
        └── indexer.test.ts
```

### Core Components

- **IndexerManager**: Orchestrates the indexing process with queue management
- **File Scanner**: Discovers files using glob patterns with security validation
- **Embedding Integration**: Pluggable embedding service support
- **State Store**: Persistent state management for bootstrap/incremental indexing
- **Search Interface**: Semantic search capabilities with metadata filtering

## 🚀 Quick Start

### Basic Usage

```typescript
import { 
  createIndexerManager, 
  setIndexerStateStore,
  createLevelCacheStateStore 
} from '@promethean/indexer-core';

// Configure state storage
setIndexerStateStore(createLevelCacheStateStore('./.cache/indexer'));

// Create and configure indexer
const manager = createIndexerManager();

// Start indexing a repository
await manager.ensureBootstrap('/path/to/repository');

// Wait for indexing to complete
while (manager.isBusy()) {
  await new Promise(resolve => setTimeout(resolve, 100));
}

// Search the indexed content
import { search } from '@promethean/indexer-core';
const results = await search('/path/to/repository', 'authentication logic');
console.log(results);
```

### Environment Configuration

```bash
# Embedding configuration
EMBEDDING_DRIVER=ollama
EMBEDDING_FUNCTION=nomic-embed-text
EMBED_DIMS=768

# Collection configuration
COLLECTION_FAMILY=repo_files
EMBED_VERSION=dev

# Indexing behavior
INDEXER_FILE_DELAY_MS=250
EXCLUDE_GLOBS=node_modules/**,.git/**,dist/**,build/**

# Root path for indexing
ROOT_PATH=/path/to/repository
```

## 📚 API Reference

### Core Functions

#### `createIndexerManager()`
Creates a new indexer manager instance.

```typescript
const manager = createIndexerManager();
```

#### `gatherRepoFiles(rootPath, options)`
Discovers files in a repository using glob patterns.

```typescript
const { files, fileInfo } = await gatherRepoFiles('/path/to/repo', {
  include: ['**/*.ts', '**/*.md'],
  exclude: ['node_modules/**', 'test/**']
});
```

#### `search(rootPath, query, n?)`
Performs semantic search on indexed content.

```typescript
const results = await search('/path/to/repo', 'user authentication', 10);
```

#### `indexFile(rootPath, relativePath)`
Indexes a single file.

```typescript
const result = await indexFile('/path/to/repo', 'src/auth.ts');
```

### IndexerManager Class

#### Methods

- `ensureBootstrap(rootPath)`: Initialize or resume indexing
- `scheduleReindexAll()`: Queue all files for reindexing
- `scheduleReindexSubset(globs)`: Queue specific file patterns
- `scheduleIndexFile(path)`: Queue a single file
- `removeFile(path)`: Remove a file from the index
- `status()`: Get current indexer status
- `isBusy()`: Check if indexer is processing
- `resetAndBootstrap(rootPath)`: Reset and restart indexing

#### Status Object

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

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EMBEDDING_DRIVER` | `ollama` | Embedding service provider |
| `EMBEDDING_FUNCTION` | `nomic-embed-text` | Embedding model name |
| `EMBED_DIMS` | `768` | Embedding dimensions |
| `COLLECTION_FAMILY` | `repo_files` | ChromaDB collection family |
| `EMBED_VERSION` | `dev` | Embedding version identifier |
| `INDEXER_FILE_DELAY_MS` | `250` | Delay between file processing |
| `EXCLUDE_GLOBS` | `node_modules/**,.git/**` | Default exclusion patterns |
| `ROOT_PATH` | `process.cwd()` | Default repository root |

### Supported File Types

The indexer supports these file extensions by default:
- `.md`, `.txt` - Documentation
- `.js`, `.ts`, `.jsx`, `.tsx` - JavaScript/TypeScript
- `.py` - Python
- `.go` - Go
- `.rs` - Rust
- `.json`, `.yml`, `.yaml` - Configuration
- `.sh` - Shell scripts

## 🔒 Security Features

### Path Traversal Protection
The indexer includes robust path traversal protection:

```typescript
// All file paths are validated against the root directory
// Prevents access to files outside the repository
const resolved = await resolveWithinRoot(rootPath, userInput);
```

### Input Validation
- File paths are sanitized and validated
- Glob patterns are parsed with limits to prevent ReDoS attacks
- Collection names and metadata are validated

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm coverage

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Test Structure

```typescript
// Example test
import test from 'ava';
import { createIndexerManager, createMemoryStateStore } from '@promethean/indexer-core';

test('indexer processes files correctly', async (t) => {
  const manager = createIndexerManager();
  // Test implementation
});
```

## 🔄 Integration Patterns

### With ChromaDB

```typescript
import { setChromaClient, ChromaClient } from 'chromadb';
import { setChromaClient as setIndexerChroma } from '@promethean/indexer-core';

const chroma = new ChromaClient();
setIndexerChroma(chroma);
```

### Custom Embedding Functions

```typescript
import { setEmbeddingFactory } from '@promethean/indexer-core';

setEmbeddingFactory(async () => {
  return {
    generate: async (texts: string[]) => {
      // Custom embedding logic
      return embeddings;
    }
  };
});
```

### Custom State Store

```typescript
import { setIndexerStateStore } from '@promethean/indexer-core';

const customStore = {
  async load(rootPath: string) { /* ... */ },
  async save(rootPath: string, state: any) { /* ... */ },
  async delete(rootPath: string) { /* ... */ }
};

setIndexerStateStore(customStore);
```

## 📊 Performance Considerations

### File Chunking
Files are automatically chunked for optimal embedding generation:
- Default chunk size: 2000 characters
- Overlap: 200 characters
- Preserves line numbers and byte offsets

### Queue Management
- Configurable delay between files to prevent resource exhaustion
- Error handling with retry logic
- Bootstrap and incremental indexing modes

### Memory Usage
- Streaming file processing to minimize memory footprint
- Efficient state persistence with LevelDB
- Configurable embedding function caching

## 🐛 Troubleshooting

### Common Issues

#### "File is outside index root"
Ensure all file paths are relative to the configured root directory.

#### "Embedding timeout"
Increase timeout or check embedding service availability:
```typescript
setEmbeddingOverride((ctx) => 
  withTimeout(customEmbedding(ctx), ctx.timeoutMs)
);
```

#### "ChromaDB connection failed"
Verify ChromaDB is running and accessible:
```typescript
// Test connection
const chroma = new ChromaClient();
await chroma.heartbeat();
```

### Debug Logging

```typescript
import { setIndexerLogger, createLogger } from '@promethean/utils';

setIndexerLogger(createLogger({ 
  service: 'indexer-core', 
  level: 'debug' 
}));
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure all linting and type checking passes

## 📄 License

This package is part of the Promethean Framework. See the main project license for details.

## 🔗 Related Packages

- `@promethean/indexer-service` - HTTP service wrapper
- `@promethean/embedding` - Embedding service abstractions
- `@promethean/file-indexer` - File scanning utilities
- `@promethean/level-cache` - LevelDB caching utilities