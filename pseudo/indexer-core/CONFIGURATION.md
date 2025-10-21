# Configuration Guide - @promethean/indexer-core

This document provides comprehensive configuration options for the `@promethean/indexer-core` package.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Configuration Examples](#configuration-examples)
- [Embedding Configuration](#embedding-configuration)
- [Indexing Configuration](#indexing-configuration)
- [Security Configuration](#security-configuration)
- [Performance Configuration](#performance-configuration)
- [State Management Configuration](#state-management-configuration)
- [ChromaDB Configuration](#chromadb-configuration)
- [Logging Configuration](#logging-configuration)

## Environment Variables

### Core Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ROOT_PATH` | string | `process.cwd()` | Default repository root path |
| `INDEX_ROOT` | string | `ROOT_PATH` | Alternative root path specification |
| `COLLECTION_FAMILY` | string | `repo_files` | ChromaDB collection family name |
| `EMBED_VERSION` | string | `dev` | Embedding version identifier |

### Embedding Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `EMBEDDING_DRIVER` | string | `ollama` | Embedding service provider (`ollama`, `openai`, `custom`) |
| `EMBEDDING_FUNCTION` | string | `nomic-embed-text` | Embedding model name |
| `EMBED_DIMS` | number | `768` | Embedding dimensions |
| `BROKER_URL` | string | `""` | URL for embedding service broker |

### Indexing Behavior

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `INDEXER_FILE_DELAY_MS` | number | `250` | Delay between file processing (milliseconds) |
| `EXCLUDE_GLOBS` | string | `node_modules/**,.git/**,dist/**,build/**,.obsidian/**` | Default exclusion patterns (comma-separated) |

### Cache and Storage

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `INDEX_CACHE_PATH` | string | `undefined` | Path for indexer cache |
| `INDEXER_CACHE_PATH` | string | `undefined` | Alternative cache path |

## Configuration Examples

### Basic Development Setup

```bash
# .env file for development
EMBEDDING_DRIVER=ollama
EMBEDDING_FUNCTION=nomic-embed-text
EMBED_DIMS=768
COLLECTION_FAMILY=repo_files
EMBED_VERSION=dev
INDEXER_FILE_DELAY_MS=100
EXCLUDE_GLOBS=node_modules/**,.git/**,dist/**,build/**
ROOT_PATH=/path/to/your/repository
```

### Production Setup with OpenAI

```bash
# Production configuration
EMBEDDING_DRIVER=openai
EMBEDDING_FUNCTION=text-embedding-3-small
EMBED_DIMS=1536
COLLECTION_FAMILY=production_docs
EMBED_VERSION=v1.2.0
INDEXER_FILE_DELAY_MS=500
EXCLUDE_GLOBS=node_modules/**,.git/**,dist/**,build/**,tmp/**,logs/**
ROOT_PATH=/app/repository
INDEX_CACHE_PATH=/app/cache/indexer
```

### High-Performance Setup

```bash
# High-performance configuration
EMBEDDING_DRIVER=ollama
EMBEDDING_FUNCTION=nomic-embed-text
EMBED_DIMS=768
COLLECTION_FAMILY=large_repo
EMBED_VERSION=perf
INDEXER_FILE_DELAY_MS=50
EXCLUDE_GLOBS=node_modules/**,.git/**,dist/**,build/**,coverage/**,.nyc_output/**
ROOT_PATH=/large/codebase
```

## Embedding Configuration

### Ollama Configuration

```bash
# Local Ollama setup
EMBEDDING_DRIVER=ollama
EMBEDDING_FUNCTION=nomic-embed-text
EMBED_DIMS=768
BROKER_URL=http://localhost:11434
```

**Available Ollama Models:**
- `nomic-embed-text` (768 dimensions)
- `mxbai-embed-large` (1024 dimensions)
- `all-minilm` (384 dimensions)

### OpenAI Configuration

```bash
# OpenAI setup
EMBEDDING_DRIVER=openai
EMBEDDING_FUNCTION=text-embedding-3-small
EMBED_DIMS=1536
BROKER_URL=https://api.openai.com/v1
OPENAI_API_KEY=your-api-key-here
```

**Available OpenAI Models:**
- `text-embedding-3-small` (1536 dimensions)
- `text-embedding-3-large` (3072 dimensions)
- `text-embedding-ada-002` (1536 dimensions)

### Custom Embedding Service

```typescript
import { setEmbeddingFactory } from '@promethean/indexer-core';

// Configure custom embedding service
setEmbeddingFactory(async () => {
  return {
    generate: async (texts: string[]) => {
      // Custom embedding logic
      const response = await fetch('https://your-embedding-service.com/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts })
      });
      
      const result = await response.json();
      return result.embeddings;
    }
  };
});
```

## Indexing Configuration

### File Type Configuration

The indexer supports these file extensions by default:

```typescript
const SUPPORTED_EXTENSIONS = new Set([
  '.md', '.txt',           // Documentation
  '.js', '.ts', '.jsx', '.tsx',  // JavaScript/TypeScript
  '.py',                   // Python
  '.go',                   // Go
  '.rs',                   // Rust
  '.json', '.yml', '.yaml', // Configuration
  '.sh'                    // Shell scripts
]);
```

### Custom File Patterns

```typescript
import { gatherRepoFiles } from '@promethean/indexer-core';

// Include specific file types
const { files } = await gatherRepoFiles('/path/to/repo', {
  include: [
    '**/*.ts',      // TypeScript files
    '**/*.tsx',     // TypeScript React
    '**/*.md',      // Markdown
    '**/*.json'     // JSON configuration
  ],
  exclude: [
    'node_modules/**',  // Dependencies
    'dist/**',          // Build output
    'coverage/**',      // Test coverage
    '**/*.test.*',      // Test files
    '**/*.spec.*'       // Specification files
  ]
});
```

### Advanced Pattern Matching

```typescript
import { createInclusionChecker, expandBraces } from '@promethean/indexer-core';

// Complex pattern matching
const patterns = expandBraces('src/**/*.{ts,tsx,js,jsx}');
const shouldInclude = createInclusionChecker(patterns);

// Use in custom file scanning
if (shouldInclude(filePath)) {
  // Process file
}
```

## Security Configuration

### Path Traversal Protection

The indexer includes built-in path traversal protection. No additional configuration is required, but you can customize the behavior:

```typescript
import { resolveWithinRoot } from '@promethean/indexer-core';

// Custom path validation
try {
  const { abs, rel } = await resolveWithinRoot(rootPath, userInput);
  console.log(`Safe path: ${rel}`);
} catch (error) {
  console.error('Path validation failed:', error.message);
}
```

### Input Validation Limits

```typescript
import { createInclusionChecker } from '@promethean/indexer-core';

// Configure validation limits
const shouldInclude = createInclusionChecker(patterns, {
  maxLength: 1000,      // Maximum pattern length
  maxCompiled: 500      // Maximum compiled patterns
});
```

## Performance Configuration

### File Processing Speed

```bash
# Fast processing (development)
INDEXER_FILE_DELAY_MS=50

# Moderate processing (default)
INDEXER_FILE_DELAY_MS=250

# Slow processing (resource-constrained)
INDEXER_FILE_DELAY_MS=1000
```

### Memory Usage Configuration

```typescript
import { setEmbeddingOverride } from '@promethean/indexer-core';

// Configure timeout for embedding operations
setEmbeddingOverride(async (ctx) => {
  // Custom timeout handling
  const timeoutMs = 30000; // 30 seconds
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Embedding timeout')), timeoutMs);
  });
  
  return Promise.race([
    originalEmbedding(ctx),
    timeoutPromise
  ]);
});
```

### Chunking Configuration

```typescript
import { makeChunks } from '@promethean/indexer-core';

// Custom chunking strategy
const chunks = makeChunks(fileContent, {
  maxLen: 1500,    // Smaller chunks for precision
  overlap: 150     // Reduced overlap for efficiency
});
```

## State Management Configuration

### LevelDB Configuration

```typescript
import { createLevelCacheStateStore } from '@promethean/indexer-core';

// Custom cache location
const stateStore = createLevelCacheStateStore('./custom/cache/path');
setIndexerStateStore(stateStore);
```

### In-Memory Configuration (Testing)

```typescript
import { createMemoryStateStore } from '@promethean/indexer-core';

// Use in-memory store for testing
const stateStore = createMemoryStateStore();
setIndexerStateStore(stateStore);
```

### Custom State Store

```typescript
import { setIndexerStateStore, type IndexerStateStore } from '@promethean/indexer-core';

// Implement custom state store
class CustomStateStore implements IndexerStateStore {
  async load(rootPath: string) {
    // Custom loading logic (e.g., database, cloud storage)
    return await this.customLoadImplementation(rootPath);
  }
  
  async save(rootPath: string, state) {
    // Custom saving logic
    await this.customSaveImplementation(rootPath, state);
  }
  
  async delete(rootPath: string) {
    // Custom deletion logic
    await this.customDeleteImplementation(rootPath);
  }
}

setIndexerStateStore(new CustomStateStore());
```

## ChromaDB Configuration

### Default ChromaDB Setup

```typescript
import { setChromaClient, ChromaClient } from 'chromadb';
import { setChromaClient as setIndexerChroma } from '@promethean/indexer-core';

// Use default ChromaDB client
const chroma = new ChromaClient({
  path: "http://localhost:8000"
});
setIndexerChroma(chroma);
```

### Custom ChromaDB Configuration

```typescript
// Custom ChromaDB client with authentication
const chroma = new ChromaClient({
  path: "https://your-chromadb.com",
  auth: {
    provider: "chromadb",
    credentials: "your-token-here"
  },
  tenant: "your-tenant",
  database: "your-database"
});

setIndexerChroma(chroma);
```

### Collection Configuration

```typescript
import { collectionForFamily } from '@promethean/indexer-core';

// Create collection with custom metadata
const collection = await collectionForFamily(
  'custom_family',    // Collection family
  'v1.0.0',          // Version
  {
    driver: 'ollama',
    fn: 'nomic-embed-text',
    dims: 768,
    // Custom metadata
    description: 'Custom code repository',
    project: 'my-project',
    environment: 'production'
  }
);
```

## Logging Configuration

### Basic Logger Setup

```typescript
import { setIndexerLogger, createLogger } from '@promethean/utils';

// Configure logger
setIndexerLogger(createLogger({
  service: 'indexer-core',
  level: 'info',  // debug, info, warn, error
  format: 'json' // json, pretty
}));
```

### Advanced Logger Configuration

```typescript
import { setIndexerLogger } from '@promethean/indexer-core';

// Custom logger implementation
setIndexerLogger({
  debug: (message, meta) => console.debug(`[DEBUG] ${message}`, meta),
  info: (message, meta) => console.info(`[INFO] ${message}`, meta),
  warn: (message, meta) => console.warn(`[WARN] ${message}`, meta),
  error: (message, meta) => console.error(`[ERROR] ${message}`, meta)
});
```

### Environment-based Logging

```bash
# Set log level via environment
LOG_LEVEL=debug

# Or in code
const logLevel = process.env.LOG_LEVEL || 'info';
setIndexerLogger(createLogger({ level: logLevel }));
```

## Complete Configuration Examples

### Development Environment

```typescript
// config/development.ts
import { 
  setIndexerLogger, 
  setIndexerStateStore,
  createLevelCacheStateStore,
  createLogger
} from '@promethean/indexer-core';
import { setChromaClient, ChromaClient } from 'chromadb';

// Logger configuration
setIndexerLogger(createLogger({
  service: 'indexer-core-dev',
  level: 'debug',
  format: 'pretty'
}));

// State store configuration
setIndexerStateStore(createLevelCacheStateStore('./dev-cache/indexer'));

// ChromaDB configuration
const chroma = new ChromaClient({
  path: 'http://localhost:8000'
});
setChromaClient(chroma);

// Environment variables
process.env.EMBEDDING_DRIVER = 'ollama';
process.env.EMBEDDING_FUNCTION = 'nomic-embed-text';
process.env.INDEXER_FILE_DELAY_MS = '100';
```

### Production Environment

```typescript
// config/production.ts
import { 
  setIndexerLogger,
  setIndexerStateStore,
  createLevelCacheStateStore,
  createLogger
} from '@promethean/indexer-core';
import { setChromaClient, ChromaClient } from 'chromadb';

// Logger configuration
setIndexerLogger(createLogger({
  service: 'indexer-core-prod',
  level: 'info',
  format: 'json'
}));

// State store configuration
setIndexerStateStore(createLevelCacheStateStore('/app/cache/indexer'));

// ChromaDB configuration
const chroma = new ChromaClient({
  path: process.env.CHROMADB_URL,
  auth: {
    provider: 'chromadb',
    credentials: process.env.CHROMADB_TOKEN
  }
});
setChromaClient(chroma);

// Environment variables
process.env.EMBEDDING_DRIVER = 'openai';
process.env.EMBEDDING_FUNCTION = 'text-embedding-3-small';
process.env.INDEXER_FILE_DELAY_MS = '500';
```

### Testing Environment

```typescript
// config/test.ts
import { 
  setIndexerLogger,
  setIndexerStateStore,
  createMemoryStateStore,
  createLogger
} from '@promethean/indexer-core';

// Silent logger for tests
setIndexerLogger(createLogger({
  service: 'indexer-core-test',
  level: 'error'  // Only show errors in tests
}));

// In-memory state store for tests
setIndexerStateStore(createMemoryStateStore());

// Mock ChromaDB for tests
import { setChromaClient } from '@promethean/indexer-core';

setChromaClient({
  async getOrCreateCollection() {
    return {
      upsert: async () => {},
      delete: async () => {},
      query: async () => ({
        ids: [],
        documents: [],
        metadatas: [],
        distances: []
      })
    };
  }
});
```

## Configuration Validation

### Validate Configuration

```typescript
// Validate required environment variables
const requiredEnvVars = [
  'EMBEDDING_DRIVER',
  'EMBEDDING_FUNCTION',
  'ROOT_PATH'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Validate numeric values
const fileDelay = Number(process.env.INDEXER_FILE_DELAY_MS);
if (!Number.isFinite(fileDelay) || fileDelay < 0) {
  throw new Error('INDEXER_FILE_DELAY_MS must be a non-negative number');
}
```

### Configuration Schema

```typescript
interface IndexerConfig {
  embedding: {
    driver: string;
    function: string;
    dimensions: number;
    brokerUrl?: string;
  };
  indexing: {
    fileDelayMs: number;
    excludeGlobs: string[];
    includeGlobs?: string[];
  };
  storage: {
    rootPath: string;
    cachePath?: string;
    collectionFamily: string;
    embedVersion: string;
  };
  performance: {
    chunkSize: number;
    chunkOverlap: number;
    maxConcurrency: number;
  };
}
```

This configuration guide provides comprehensive options for customizing the indexer behavior to suit different environments and use cases.