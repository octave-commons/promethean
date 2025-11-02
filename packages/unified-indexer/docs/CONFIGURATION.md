# Configuration Guide - @promethean-os/unified-indexer

This comprehensive guide covers all configuration options for the unified-indexer package, including environment-specific setups, data source configuration, and performance tuning.

## Table of Contents

- [Overview](#overview)
- [Core Configuration](#core-configuration)
- [Data Source Configuration](#data-source-configuration)
- [Storage Configuration](#storage-configuration)
- [Search Configuration](#search-configuration)
- [Performance Configuration](#performance-configuration)
- [Environment-Specific Setups](#environment-specific-setups)
- [Configuration Templates](#configuration-templates)
- [Validation and Troubleshooting](#validation-and-troubleshooting)

---

## Overview

The unified-indexer package uses a hierarchical configuration system that allows fine-grained control over all aspects of indexing and search functionality.

### Configuration Structure

```typescript
interface UnifiedIndexerServiceConfig {
  // Core indexing and storage
  indexing: UnifiedIndexingConfig;

  // Context store settings
  contextStore: {
    collections: Record<string, string>;
    formatTime?: (epochMs: number) => string;
    assistantName?: string;
  };

  // Data source configurations
  sources: {
    files: FileSourceConfig;
    discord: DiscordSourceConfig;
    opencode: OpenCodeSourceConfig;
    kanban: KanbanSourceConfig;
  };

  // Synchronization settings
  sync: {
    interval: number;
    batchSize: number;
    retryAttempts: number;
    retryDelay: number;
  };
}
```

### Environment Variables

All configuration options can be overridden using environment variables. The package follows these naming conventions:

- `UNIFIED_INDEXER_<SECTION>_<OPTION>` (e.g., `UNIFIED_INDEXER_SYNC_INTERVAL`)
- Section-specific prefixes (e.g., `INDEXING_VECTOR_STORE_TYPE`)
- Nested options use double underscores (e.g., `SOURCES_FILES__ENABLED`)

---

## Core Configuration

### Indexing Configuration

```typescript
interface UnifiedIndexingConfig {
  // Vector store for semantic search
  vectorStore: {
    type: 'chromadb' | 'pinecone' | 'weaviate' | 'qdrant';
    connectionString: string;
    indexName?: string;
    apiKey?: string;
    environment?: string;
  };

  // Metadata store for document storage
  metadataStore: {
    type: 'mongodb' | 'postgresql' | 'sqlite';
    connectionString: string;
    tableName?: string;
    username?: string;
    password?: string;
  };

  // Embedding model configuration
  embedding: {
    model: string;
    dimensions: number;
    batchSize: number;
    apiKey?: string;
    provider?: 'openai' | 'huggingface' | 'local';
  };

  // Caching configuration
  cache?: {
    enabled: boolean;
    ttl: number; // milliseconds
    maxSize: number;
    provider?: 'memory' | 'redis' | 'memcached';
  };

  // Content validation
  validation?: {
    strict: boolean;
    skipVectorValidation: boolean;
    maxContentLength: number;
    allowedMimeTypes?: string[];
  };
}
```

#### Vector Store Options

**ChromaDB (Recommended)**

```typescript
vectorStore: {
  type: 'chromadb',
  connectionString: 'http://localhost:8000',
  indexName: 'promethean-unified',
  // Optional ChromaDB settings
  apiKey: process.env.CHROMA_API_KEY,
  environment: process.env.CHROMA_ENVIRONMENT,
}
```

**Pinecone**

```typescript
vectorStore: {
  type: 'pinecone',
  connectionString: process.env.PINECONE_API_KEY,
  indexName: 'promethean-unified',
  environment: 'us-west1-gcp',
  apiKey: process.env.PINECONE_API_KEY,
}
```

**Weaviate**

```typescript
vectorStore: {
  type: 'weaviate',
  connectionString: 'http://localhost:8080',
  indexName: 'promethean-unified',
  apiKey: process.env.WEAVIATE_API_KEY,
}
```

#### Metadata Store Options

**MongoDB (Recommended)**

```typescript
metadataStore: {
  type: 'mongodb',
  connectionString: 'mongodb://localhost:27017/promethean',
  tableName: 'unified_content',
  username: process.env.MONGODB_USERNAME,
  password: process.env.MONGODB_PASSWORD,
}
```

**PostgreSQL**

```typescript
metadataStore: {
  type: 'postgresql',
  connectionString: 'postgresql://user:password@localhost:5432/promethean',
  tableName: 'unified_content',
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
}
```

**SQLite (Development)**

```typescript
metadataStore: {
  type: 'sqlite',
  connectionString: './data/unified-indexer.db',
  tableName: 'unified_content',
}
```

#### Embedding Configuration

**OpenAI Embeddings**

```typescript
embedding: {
  model: 'text-embedding-ada-002',
  dimensions: 1536,
  batchSize: 100,
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
}
```

**HuggingFace Embeddings**

```typescript
embedding: {
  model: 'sentence-transformers/all-MiniLM-L6-v2',
  dimensions: 384,
  batchSize: 32,
  provider: 'huggingface',
  apiKey: process.env.HUGGINGFACE_API_KEY,
}
```

**Local Embeddings**

```typescript
embedding: {
  model: 'local',
  dimensions: 768,
  batchSize: 16,
  provider: 'local',
}
```

### Context Store Configuration

```typescript
contextStore: {
  collections: {
    files: 'files',
    discord: 'discord',
    opencode: 'opencode',
    kanban: 'kanban',
    unified: 'unified',
  },
  formatTime: (epochMs: number) => new Date(epochMs).toISOString(),
  assistantName: 'Promethean',
}
```

#### Custom Time Formatting

```typescript
contextStore: {
  // ... other settings
  formatTime: (epochMs: number) => {
    const date = new Date(epochMs);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
}
```

---

## Data Source Configuration

### File System Configuration

```typescript
interface FileSourceConfig {
  enabled: boolean;
  paths: readonly string[];
  options?: FileIndexingOptions;
}

interface FileIndexingOptions {
  batchSize?: number; // Default: 50
  excludePatterns?: readonly string[];
  includePatterns?: readonly string[];
  maxFileSize?: number; // Default: 10MB
  followSymlinks?: boolean; // Default: false
  watchMode?: boolean; // Default: false
  ignoreHidden?: boolean; // Default: true
}
```

#### Basic File Indexing

```typescript
sources: {
  files: {
    enabled: true,
    paths: ['./src', './docs', './packages'],
    options: {
      batchSize: 100,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      excludePatterns: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**',
        'coverage/**',
        '*.log',
        '.env*',
      ],
      includePatterns: [
        '*.ts',
        '*.js',
        '*.tsx',
        '*.jsx',
        '*.md',
        '*.json',
        '*.yaml',
        '*.yml',
      ],
      followSymlinks: false,
      ignoreHidden: true,
    },
  },
}
```

#### Advanced File Filtering

```typescript
sources: {
  files: {
    enabled: true,
    paths: ['./'],
    options: {
      // Include only specific file types
      includePatterns: [
        'src/**/*.ts',
        'src/**/*.tsx',
        'docs/**/*.md',
        'config/**/*.json',
        'scripts/**/*.js',
      ],

      // Exclude development artifacts
      excludePatterns: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
        '**/.git/**',
        '**/logs/**',
        '**/tmp/**',
      ],

      // Size and behavior settings
      maxFileSize: 5 * 1024 * 1024, // 5MB
      batchSize: 200,
      followSymlinks: false,
      ignoreHidden: true,
      watchMode: true, // Enable file watching
    },
  },
}
```

### Discord Configuration

```typescript
interface DiscordSourceConfig {
  enabled: boolean;
  provider?: string;
  tenant?: string;
  botToken?: string;
  guildIds?: string[];
  channelIds?: string[];
  options?: DiscordIndexingOptions;
}

interface DiscordIndexingOptions {
  indexAttachments?: boolean; // Default: true
  indexThreads?: boolean; // Default: true
  maxMessageAge?: number; // Default: 30 days
  batchSize?: number; // Default: 100
  excludeChannels?: string[];
  includeChannels?: string[];
}
```

#### Discord Integration Setup

```typescript
sources: {
  discord: {
    enabled: true,
    provider: 'discord-api',
    botToken: process.env.DISCORD_BOT_TOKEN,
    guildIds: [
      process.env.DISCORD_GUILD_ID,
    ],
    options: {
      indexAttachments: true,
      indexThreads: true,
      maxMessageAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      batchSize: 200,
      excludeChannels: [
        'bot-commands',
        'off-topic',
      ],
      includeChannels: [
        'development',
        'documentation',
        'support',
      ],
    },
  },
}
```

### OpenCode Configuration

```typescript
interface OpenCodeSourceConfig {
  enabled: boolean;
  sessionId?: string;
  apiEndpoint?: string;
  apiKey?: string;
  options?: OpenCodeIndexingOptions;
}

interface OpenCodeIndexingOptions {
  indexSessions?: boolean; // Default: true
  indexEvents?: boolean; // Default: true
  indexMessages?: boolean; // Default: true
  indexCode?: boolean; // Default: true
  maxSessionAge?: number; // Default: 7 days
  batchSize?: number; // Default: 50
}
```

#### OpenCode Integration Setup

```typescript
sources: {
  opencode: {
    enabled: true,
    sessionId: process.env.OPENCODE_SESSION_ID,
    apiEndpoint: process.env.OPENCODE_API_ENDPOINT || 'http://localhost:3001',
    apiKey: process.env.OPENCODE_API_KEY,
    options: {
      indexSessions: true,
      indexEvents: true,
      indexMessages: true,
      indexCode: true,
      maxSessionAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      batchSize: 100,
    },
  },
}
```

### Kanban Configuration

```typescript
interface KanbanSourceConfig {
  enabled: boolean;
  boardId?: string;
  apiEndpoint?: string;
  apiKey?: string;
  options?: KanbanIndexingOptions;
}

interface KanbanIndexingOptions {
  indexTasks?: boolean; // Default: true
  indexProjects?: boolean; // Default: true
  indexComments?: boolean; // Default: true
  indexAttachments?: boolean; // Default: true
  maxTaskAge?: number; // Default: 90 days
  batchSize?: number; // Default: 50
}
```

#### Kanban Integration Setup

```typescript
sources: {
  kanban: {
    enabled: true,
    boardId: process.env.KANBAN_BOARD_ID,
    apiEndpoint: process.env.KANBAN_API_ENDPOINT || 'http://localhost:3002',
    apiKey: process.env.KANBAN_API_KEY,
    options: {
      indexTasks: true,
      indexProjects: true,
      indexComments: true,
      indexAttachments: true,
      maxTaskAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      batchSize: 75,
    },
  },
}
```

---

## Storage Configuration

### Vector Store Optimization

#### ChromaDB Production Settings

```typescript
vectorStore: {
  type: 'chromadb',
  connectionString: process.env.CHROMA_DB_URL,
  indexName: 'promethean-production',

  // Production-specific settings
  apiKey: process.env.CHROMA_API_KEY,
  environment: 'production',

  // Connection pooling
  maxConnections: 20,
  connectionTimeout: 30000,

  // Index optimization
  metric: 'cosine',
  efConstruction: 200,
  efSearch: 50,

  // Persistence
  persistDirectory: '/data/chroma',
  allowReset: false,
}
```

#### Pinecone Production Settings

```typescript
vectorStore: {
  type: 'pinecone',
  connectionString: process.env.PINECONE_API_KEY,
  indexName: 'promethean-production',
  environment: 'us-west1-gcp',

  // Index configuration
  dimension: 1536,
  metric: 'cosine',
  pods: 1,
  replicas: 1,
  podType: 'p1.x1',

  // Performance settings
  deletionProtection: true,
  collectionMetadata: {
    environment: 'production',
    version: '1.0.0',
  },
}
```

### Metadata Store Optimization

#### MongoDB Production Settings

```typescript
metadataStore: {
  type: 'mongodb',
  connectionString: process.env.MONGODB_URL,
  tableName: 'unified_content',
  username: process.env.MONGODB_USERNAME,
  password: process.env.MONGODB_PASSWORD,

  // Connection settings
  maxPoolSize: 20,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,

  // Index configuration
  indexes: [
    { field: 'id', unique: true },
    { field: 'source' },
    { field: 'type' },
    { field: 'timestamp' },
    { field: 'metadata.tags' },
    { field: 'content', type: 'text' },
  ],

  // Performance settings
  writeConcern: { w: 'majority', j: true },
  readConcern: { level: 'majority' },
  readPreference: 'secondaryPreferred',
}
```

#### PostgreSQL Production Settings

```typescript
metadataStore: {
  type: 'postgresql',
  connectionString: process.env.DATABASE_URL,
  tableName: 'unified_content',
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,

  // Connection pool settings
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,

  // Performance settings
  statement_timeout: 30000,
  query_timeout: 30000,

  // Index configuration
  indexes: [
    'CREATE INDEX IF NOT EXISTS idx_content_id ON unified_content(id)',
    'CREATE INDEX IF NOT EXISTS idx_content_source ON unified_content(source)',
    'CREATE INDEX IF NOT EXISTS idx_content_type ON unified_content(type)',
    'CREATE INDEX IF NOT EXISTS idx_content_timestamp ON unified_content(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_content_tags ON unified_content USING GIN(metadata)',
    'CREATE INDEX IF NOT EXISTS idx_content_search ON unified_content USING GIN(to_tsvector(\'english\', content))',
  ],
}
```

---

## Search Configuration

### Default Search Options

```typescript
import { DEFAULT_SEARCH_OPTIONS } from '@promethean-os/unified-indexer';

// Use defaults as base
const searchEngine = createCrossDomainSearchEngine(service, {
  ...DEFAULT_SEARCH_OPTIONS,

  // Custom overrides
  semantic: true,
  timeBoost: true,
  includeAnalytics: true,
});
```

### Search Engine Configuration

```typescript
const searchEngine = createCrossDomainSearchEngine(service, {
  // Search modes
  semantic: true, // Enable semantic search
  hybridSearch: true, // Combine semantic + keyword
  keywordWeight: 0.3, // Weight for keyword search (0-1)

  // Temporal settings
  timeBoost: true, // Boost recent content
  recencyDecay: 24, // Hours for decay calculation

  // Result processing
  deduplicate: true, // Remove duplicate results
  groupBySource: false, // Group results by source
  maxResultsPerSource: 10, // Max results per source when grouped

  // Analytics and debugging
  includeAnalytics: false, // Include search analytics
  explainScores: false, // Include score explanations

  // Source weighting
  sourceWeights: {
    filesystem: 1.2, // Boost file system content
    discord: 1.0, // Normal priority for Discord
    opencode: 1.1, // Slight boost for OpenCode
    kanban: 1.0, // Normal priority for Kanban
    agent: 1.0, // Normal priority for agent content
    user: 1.0, // Normal priority for user content
    system: 1.0, // Normal priority for system content
    external: 0.8, // Lower priority for external content
  },

  // Type weighting
  typeWeights: {
    file: 1.2, // Boost files
    document: 1.1, // Boost documentation
    message: 1.0, // Normal priority for messages
    task: 1.3, // Boost tasks
    event: 0.9, // Lower priority for events
    session: 1.0, // Normal priority for sessions
    attachment: 0.8, // Lower priority for attachments
    thought: 1.1, // Boost thoughts/analysis
    board: 1.0, // Normal priority for boards
  },
});
```

### Context Compilation Configuration

```typescript
// Context compilation options
const contextOptions = {
  // Context limits
  contextLimit: 10, // Max context messages
  recentLimit: 5, // Max recent messages
  queryLimit: 3, // Max query-related messages
  limit: 15, // Overall limit

  // Formatting
  formatForLLM: true, // Format for LLM consumption
  includeMetadata: false, // Include metadata in context
  truncateContent: true, // Truncate long content

  // Content selection
  minRelevanceScore: 0.5, // Minimum relevance for context
  maxContentLength: 2000, // Max content length per message
  prioritizeRecent: true, // Prioritize recent content
};
```

---

## Performance Configuration

### Caching Configuration

```typescript
cache: {
  enabled: true,
  ttl: 300000,                // 5 minutes
  maxSize: 1000,              // Max cached items
  provider: 'redis',           // Cache provider

  // Redis-specific settings
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: 'unified-indexer:',
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
  },

  // Cache strategies
  strategies: {
    search: {
      enabled: true,
      ttl: 60000,           // 1 minute
      maxSize: 500,
    },
    context: {
      enabled: true,
      ttl: 300000,          // 5 minutes
      maxSize: 200,
    },
    metadata: {
      enabled: true,
      ttl: 600000,          // 10 minutes
      maxSize: 1000,
    },
  },
}
```

### Batch Processing Configuration

```typescript
sync: {
  interval: 300000,             // 5 minutes
  batchSize: 100,               // Items per batch
  retryAttempts: 3,             // Max retry attempts
  retryDelay: 5000,             // Delay between retries (ms)

  // Concurrency settings
  maxConcurrentBatches: 5,      // Max concurrent batches
  maxConcurrentIndexers: 3,     // Max concurrent indexers

  // Progress tracking
  progressReporting: true,       // Enable progress reporting
  progressInterval: 10000,       // Progress report interval (ms)

  // Resource limits
  maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
  maxCpuUsage: 80,            // Max CPU usage percentage
}
```

### Embedding Optimization

```typescript
embedding: {
  model: 'text-embedding-ada-002',
  dimensions: 1536,
  batchSize: 100,
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,

  // Performance settings
  maxConcurrency: 10,          // Max concurrent embedding requests
  requestTimeout: 30000,        // Request timeout (ms)
  retryAttempts: 3,            // Max retry attempts
  retryDelay: 1000,            // Retry delay (ms)

  // Caching
  cacheEmbeddings: true,         // Cache embedding results
  embeddingCache: {
    ttl: 86400000,            // 24 hours
    maxSize: 10000,            // Max cached embeddings
  },

  // Optimization
  normalizeEmbeddings: true,     // Normalize embedding vectors
  compressEmbeddings: false,     // Compress for storage (experimental)
}
```

---

## Environment-Specific Setups

### Development Environment

```typescript
const developmentConfig: UnifiedIndexerServiceConfig = {
  indexing: {
    vectorStore: {
      type: 'chromadb',
      connectionString: 'http://localhost:8000',
      indexName: 'promethean-dev',
    },
    metadataStore: {
      type: 'sqlite',
      connectionString: './data/dev-unified.db',
      tableName: 'unified_content',
    },
    embedding: {
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      batchSize: 50,
      provider: 'openai',
    },
    cache: {
      enabled: true,
      ttl: 60000, // 1 minute
      maxSize: 100,
      provider: 'memory',
    },
    validation: {
      strict: false, // More lenient in development
      skipVectorValidation: true,
      maxContentLength: 500000, // 500KB
    },
  },

  sources: {
    files: {
      enabled: true,
      paths: ['./src', './docs'],
      options: {
        batchSize: 25,
        maxFileSize: 1024 * 1024, // 1MB
        watchMode: true, // Enable file watching
      },
    },
    discord: { enabled: false },
    opencode: { enabled: false },
    kanban: { enabled: false },
  },

  sync: {
    interval: 60000, // 1 minute for fast feedback
    batchSize: 25,
    retryAttempts: 2,
    retryDelay: 1000,
  },

  contextStore: {
    collections: {
      files: 'files-dev',
      discord: 'discord-dev',
      opencode: 'opencode-dev',
      kanban: 'kanban-dev',
      unified: 'unified-dev',
    },
    formatTime: (ms: number) => new Date(ms).toISOString(),
    assistantName: 'Promethean-Dev',
  },
};
```

### Staging Environment

```typescript
const stagingConfig: UnifiedIndexerServiceConfig = {
  indexing: {
    vectorStore: {
      type: 'chromadb',
      connectionString: process.env.CHROMA_STAGING_URL,
      indexName: 'promethean-staging',
      apiKey: process.env.CHROMA_API_KEY,
    },
    metadataStore: {
      type: 'mongodb',
      connectionString: process.env.MONGODB_STAGING_URL,
      tableName: 'unified_content_staging',
      username: process.env.MONGODB_USERNAME,
      password: process.env.MONGODB_PASSWORD,
    },
    embedding: {
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      batchSize: 75,
      provider: 'openai',
    },
    cache: {
      enabled: true,
      ttl: 300000, // 5 minutes
      maxSize: 500,
      provider: 'redis',
      redis: {
        host: process.env.REDIS_STAGING_HOST,
        port: parseInt(process.env.REDIS_STAGING_PORT || '6379'),
        password: process.env.REDIS_STAGING_PASSWORD,
      },
    },
    validation: {
      strict: true,
      skipVectorValidation: false,
      maxContentLength: 2000000, // 2MB
    },
  },

  sources: {
    files: {
      enabled: true,
      paths: ['./src', './docs', './packages'],
      options: {
        batchSize: 75,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        watchMode: false,
      },
    },
    discord: {
      enabled: true,
      provider: 'discord-api',
      botToken: process.env.DISCORD_STAGING_BOT_TOKEN,
      guildIds: [process.env.DISCORD_STAGING_GUILD_ID],
      options: {
        indexAttachments: true,
        maxMessageAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        batchSize: 100,
      },
    },
    opencode: {
      enabled: true,
      sessionId: process.env.OPENCODE_STAGING_SESSION_ID,
      apiEndpoint: process.env.OPENCODE_STAGING_URL,
      options: {
        maxSessionAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        batchSize: 50,
      },
    },
    kanban: {
      enabled: false, // Enable in production
    },
  },

  sync: {
    interval: 300000, // 5 minutes
    batchSize: 75,
    retryAttempts: 3,
    retryDelay: 3000,
  },

  contextStore: {
    collections: {
      files: 'files-staging',
      discord: 'discord-staging',
      opencode: 'opencode-staging',
      kanban: 'kanban-staging',
      unified: 'unified-staging',
    },
    formatTime: (ms: number) => new Date(ms).toISOString(),
    assistantName: 'Promethean-Staging',
  },
};
```

### Production Environment

```typescript
const productionConfig: UnifiedIndexerServiceConfig = {
  indexing: {
    vectorStore: {
      type: 'chromadb',
      connectionString: process.env.CHROMA_PRODUCTION_URL,
      indexName: 'promethean-production',
      apiKey: process.env.CHROMA_API_KEY,
      environment: 'production',
    },
    metadataStore: {
      type: 'mongodb',
      connectionString: process.env.MONGODB_PRODUCTION_URL,
      tableName: 'unified_content',
      username: process.env.MONGODB_USERNAME,
      password: process.env.MONGODB_PASSWORD,
      maxPoolSize: 20,
      minPoolSize: 5,
      writeConcern: { w: 'majority', j: true },
      readConcern: { level: 'majority' },
    },
    embedding: {
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      batchSize: 100,
      provider: 'openai',
      maxConcurrency: 10,
      cacheEmbeddings: true,
    },
    cache: {
      enabled: true,
      ttl: 600000, // 10 minutes
      maxSize: 2000,
      provider: 'redis',
      redis: {
        host: process.env.REDIS_PRODUCTION_HOST,
        port: parseInt(process.env.REDIS_PRODUCTION_PORT || '6379'),
        password: process.env.REDIS_PRODUCTION_PASSWORD,
        maxRetriesPerRequest: 3,
      },
    },
    validation: {
      strict: true,
      skipVectorValidation: false,
      maxContentLength: 10000000, // 10MB
    },
  },

  sources: {
    files: {
      enabled: true,
      paths: (process.env.INDEX_PATHS || './src,./docs,./packages').split(','),
      options: {
        batchSize: 100,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        excludePatterns: [
          'node_modules/**',
          '.git/**',
          'dist/**',
          'build/**',
          'coverage/**',
          '*.log',
          '.env*',
        ],
        includePatterns: ['*.ts', '*.js', '*.tsx', '*.jsx', '*.md', '*.json', '*.yaml', '*.yml'],
      },
    },
    discord: {
      enabled: process.env.DISCORD_ENABLED === 'true',
      provider: 'discord-api',
      botToken: process.env.DISCORD_BOT_TOKEN,
      guildIds: process.env.DISCORD_GUILD_IDS?.split(',') || [],
      options: {
        indexAttachments: true,
        indexThreads: true,
        maxMessageAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        batchSize: 200,
      },
    },
    opencode: {
      enabled: process.env.OPENCODE_ENABLED === 'true',
      sessionId: process.env.OPENCODE_SESSION_ID,
      apiEndpoint: process.env.OPENCODE_API_ENDPOINT,
      apiKey: process.env.OPENCODE_API_KEY,
      options: {
        indexSessions: true,
        indexEvents: true,
        indexMessages: true,
        indexCode: true,
        maxSessionAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        batchSize: 100,
      },
    },
    kanban: {
      enabled: process.env.KANBAN_ENABLED === 'true',
      boardId: process.env.KANBAN_BOARD_ID,
      apiEndpoint: process.env.KANBAN_API_ENDPOINT,
      apiKey: process.env.KANBAN_API_KEY,
      options: {
        indexTasks: true,
        indexProjects: true,
        indexComments: true,
        indexAttachments: true,
        maxTaskAge: 90 * 24 * 60 * 60 * 1000, // 90 days
        batchSize: 75,
      },
    },
  },

  sync: {
    interval: parseInt(process.env.SYNC_INTERVAL || '300000'), // 5 minutes
    batchSize: parseInt(process.env.SYNC_BATCH_SIZE || '100'),
    retryAttempts: parseInt(process.env.SYNC_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.SYNC_RETRY_DELAY || '5000'),
    maxConcurrentBatches: 5,
    progressReporting: true,
  },

  contextStore: {
    collections: {
      files: 'files',
      discord: 'discord',
      opencode: 'opencode',
      kanban: 'kanban',
      unified: 'unified',
    },
    formatTime: (ms: number) => new Date(ms).toISOString(),
    assistantName: process.env.ASSISTANT_NAME || 'Promethean',
  },
};
```

---

## Configuration Templates

### Minimal Configuration

```typescript
const minimalConfig: UnifiedIndexerServiceConfig = {
  indexing: {
    vectorStore: {
      type: 'chromadb',
      connectionString: 'http://localhost:8000',
      indexName: 'minimal',
    },
    metadataStore: {
      type: 'sqlite',
      connectionString: './minimal.db',
    },
    embedding: {
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      batchSize: 50,
    },
  },

  sources: {
    files: {
      enabled: true,
      paths: ['./src'],
    },
    discord: { enabled: false },
    opencode: { enabled: false },
    kanban: { enabled: false },
  },

  sync: {
    interval: 60000, // 1 minute
    batchSize: 25,
    retryAttempts: 2,
    retryDelay: 1000,
  },

  contextStore: {
    collections: {
      files: 'files',
      discord: 'discord',
      opencode: 'opencode',
      kanban: 'kanban',
      unified: 'unified',
    },
  },
};
```

### High-Performance Configuration

```typescript
const highPerformanceConfig: UnifiedIndexerServiceConfig = {
  indexing: {
    vectorStore: {
      type: 'chromadb',
      connectionString: process.env.CHROMA_DB_URL,
      indexName: 'promethean-hp',
      apiKey: process.env.CHROMA_API_KEY,
    },
    metadataStore: {
      type: 'mongodb',
      connectionString: process.env.MONGODB_URL,
      tableName: 'unified_content',
      maxPoolSize: 50,
      minPoolSize: 10,
    },
    embedding: {
      model: 'text-embedding-ada-002',
      dimensions: 1536,
      batchSize: 200,
      maxConcurrency: 20,
      cacheEmbeddings: true,
    },
    cache: {
      enabled: true,
      ttl: 300000, // 5 minutes
      maxSize: 5000,
      provider: 'redis',
    },
  },

  sources: {
    files: {
      enabled: true,
      paths: ['./src', './docs', './packages'],
      options: {
        batchSize: 200,
        maxFileSize: 20 * 1024 * 1024, // 20MB
      },
    },
    discord: {
      enabled: true,
      botToken: process.env.DISCORD_BOT_TOKEN,
      options: {
        batchSize: 300,
        maxMessageAge: 60 * 24 * 60 * 60 * 1000, // 60 days
      },
    },
    opencode: {
      enabled: true,
      options: {
        batchSize: 150,
        maxSessionAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      },
    },
    kanban: {
      enabled: true,
      options: {
        batchSize: 100,
        maxTaskAge: 180 * 24 * 60 * 60 * 1000, // 180 days
      },
    },
  },

  sync: {
    interval: 60000, // 1 minute for high frequency
    batchSize: 200,
    retryAttempts: 5,
    retryDelay: 2000,
    maxConcurrentBatches: 10,
  },

  contextStore: {
    collections: {
      files: 'files',
      discord: 'discord',
      opencode: 'opencode',
      kanban: 'kanban',
      unified: 'unified',
    },
  },
};
```

---

## Validation and Troubleshooting

### Configuration Validation

```typescript
import { validateConfig } from '@promethean-os/unified-indexer';

async function validateConfiguration(config: UnifiedIndexerServiceConfig) {
  try {
    const validation = await validateConfig(config);

    if (validation.isValid) {
      console.log('✅ Configuration is valid');
      return true;
    } else {
      console.error('❌ Configuration validation failed:');
      validation.errors.forEach((error) => {
        console.error(`  - ${error.path}: ${error.message}`);
      });

      if (validation.warnings.length > 0) {
        console.warn('⚠️ Configuration warnings:');
        validation.warnings.forEach((warning) => {
          console.warn(`  - ${warning.path}: ${warning.message}`);
        });
      }

      return false;
    }
  } catch (error) {
    console.error('❌ Configuration validation error:', error);
    return false;
  }
}
```

### Common Configuration Issues

#### Vector Store Connection Issues

```typescript
// Test vector store connection
async function testVectorStore(config: UnifiedIndexingConfig) {
  try {
    console.log('🔍 Testing vector store connection...');

    // This would be implemented based on the vector store type
    const connection = await createVectorStoreConnection(config.vectorStore);
    const healthCheck = await connection.healthCheck();

    if (healthCheck.healthy) {
      console.log('✅ Vector store connection successful');
      return true;
    } else {
      console.error('❌ Vector store health check failed:', healthCheck.issues);
      return false;
    }
  } catch (error) {
    console.error('❌ Vector store connection failed:', error);

    // Common solutions
    console.log('💡 Common solutions:');
    console.log('  - Check if the vector store service is running');
    console.log('  - Verify connection string format');
    console.log('  - Check network connectivity');
    console.log('  - Validate API keys and credentials');

    return false;
  }
}
```

#### Metadata Store Connection Issues

```typescript
// Test metadata store connection
async function testMetadataStore(config: UnifiedIndexingConfig) {
  try {
    console.log('🔍 Testing metadata store connection...');

    const connection = await createMetadataStoreConnection(config.metadataStore);
    const healthCheck = await connection.healthCheck();

    if (healthCheck.healthy) {
      console.log('✅ Metadata store connection successful');
      return true;
    } else {
      console.error('❌ Metadata store health check failed:', healthCheck.issues);
      return false;
    }
  } catch (error) {
    console.error('❌ Metadata store connection failed:', error);

    // Common solutions
    console.log('💡 Common solutions:');
    console.log('  - Check database server status');
    console.log('  - Verify connection string and credentials');
    console.log('  - Ensure database exists and is accessible');
    console.log('  - Check network connectivity and firewall rules');

    return false;
  }
}
```

#### Performance Issues

```typescript
// Diagnose performance issues
async function diagnosePerformance(config: UnifiedIndexerServiceConfig) {
  console.log('🔍 Diagnosing performance configuration...');

  const issues = [];

  // Check batch sizes
  if (config.sync.batchSize > 200) {
    issues.push({
      type: 'warning',
      message: 'Large batch size may cause memory issues',
      solution: 'Consider reducing batch size to 100-200',
    });
  }

  // Check sync interval
  if (config.sync.interval < 30000) {
    issues.push({
      type: 'warning',
      message: 'Very short sync interval may impact performance',
      solution: 'Consider increasing interval to at least 30 seconds',
    });
  }

  // Check embedding batch size
  if (config.indexing.embedding.batchSize > 100) {
    issues.push({
      type: 'warning',
      message: 'Large embedding batch size may hit API limits',
      solution: 'Consider reducing embedding batch size to 50-100',
    });
  }

  // Check cache configuration
  if (!config.indexing.cache?.enabled) {
    issues.push({
      type: 'recommendation',
      message: 'Caching is disabled - enabling it may improve performance',
      solution: 'Enable caching with appropriate TTL and size limits',
    });
  }

  // Report findings
  if (issues.length === 0) {
    console.log('✅ No performance issues detected');
  } else {
    console.log(`📊 Found ${issues.length} performance considerations:`);
    issues.forEach((issue, index) => {
      const icon = issue.type === 'warning' ? '⚠️' : '💡';
      console.log(`${index + 1}. ${icon} ${issue.message}`);
      console.log(`   Solution: ${issue.solution}`);
    });
  }

  return issues;
}
```

### Environment Variable Validation

```typescript
function validateEnvironmentVariables() {
  const required = ['OPENAI_API_KEY', 'MONGODB_URL', 'CHROMA_DB_URL'];

  const optional = [
    'REDIS_HOST',
    'REDIS_PORT',
    'DISCORD_BOT_TOKEN',
    'OPENCODE_API_KEY',
    'KANBAN_API_KEY',
  ];

  const missing = required.filter((env) => !process.env[env]);
  const present = optional.filter((env) => process.env[env]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((env) => {
      console.error(`  - ${env}`);
    });
    return false;
  }

  console.log('✅ All required environment variables are set');

  if (present.length > 0) {
    console.log('ℹ️ Optional environment variables found:');
    present.forEach((env) => {
      console.log(`  - ${env}`);
    });
  }

  return true;
}
```

---

This configuration guide provides comprehensive coverage of all configuration options for the unified-indexer package. Use the templates and examples as starting points, and customize them based on your specific requirements and environment.
