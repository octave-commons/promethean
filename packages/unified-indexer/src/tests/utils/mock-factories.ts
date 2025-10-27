/**
 * Mock Factories for Unified Indexer Tests
 *
 * Factory functions to create mock objects and configurations
 */

import type { UnifiedIndexerServiceConfig, ServiceStatus } from '../../unified-indexer-service.js';

import type { CrossDomainSearchOptions } from '../../cross-domain-search.js';

import type {
  SearchQuery,
  SearchResponse,
  IndexableContent,
  ContentType,
  ContentSource,
  ContentMetadata,
  FileMetadata,
} from '@promethean-os/persistence';

/**
 * Create minimal valid configuration for testing
 */
export function createMinimalConfig(): UnifiedIndexerServiceConfig {
  return {
    indexing: {
      vectorStore: {
        type: 'chromadb',
        connectionString: 'test://localhost:8000',
        indexName: 'test-index',
      },
      metadataStore: {
        type: 'mongodb',
        connectionString: 'test://localhost:27017',
        tableName: 'test_content',
      },
      embedding: {
        model: 'test-model',
        dimensions: 1536,
        batchSize: 100,
      },
      cache: {
        enabled: true,
        ttl: 300000,
        maxSize: 1000,
      },
      validation: {
        strict: false,
        skipVectorValidation: true,
        maxContentLength: 1000000,
      },
    },
    contextStore: {
      collections: {
        files: 'test-files',
        discord: 'test-discord',
        opencode: 'test-opencode',
        kanban: 'test-kanban',
        unified: 'test-unified',
      },
    },
    sources: {
      files: {
        enabled: false,
        paths: [],
      },
      discord: {
        enabled: false,
      },
      opencode: {
        enabled: false,
      },
      kanban: {
        enabled: false,
      },
    },
    sync: {
      interval: 1000,
      batchSize: 10,
      retryAttempts: 1,
      retryDelay: 100,
    },
  };
}

/**
 * Create full configuration for testing
 */
export function createFullConfig(): UnifiedIndexerServiceConfig {
  return {
    indexing: {
      vectorStore: {
        type: 'chromadb',
        connectionString: 'http://localhost:8000',
        indexName: 'promethean-test',
      },
      metadataStore: {
        type: 'mongodb',
        connectionString: 'mongodb://localhost:27017',
        tableName: 'test_unified_content',
      },
      embedding: {
        model: 'text-embedding-ada-002',
        dimensions: 1536,
        batchSize: 100,
      },
      cache: {
        enabled: true,
        ttl: 300000,
        maxSize: 1000,
      },
      validation: {
        strict: true,
        skipVectorValidation: false,
        maxContentLength: 1000000,
      },
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
      assistantName: 'TestAssistant',
    },
    sources: {
      files: {
        enabled: true,
        paths: ['./test-data'],
        options: {
          batchSize: 50,
          excludePatterns: ['node_modules/**', '.git/**'],
          includePatterns: ['*.ts', '*.js', '*.md'],
          followSymlinks: false,
          maxDepth: 5,
        },
      },
      discord: {
        enabled: true,
        provider: 'test-provider',
        tenant: 'test-tenant',
      },
      opencode: {
        enabled: true,
        sessionId: 'test-session-123',
      },
      kanban: {
        enabled: true,
        boardId: 'test-board-456',
      },
    },
    sync: {
      interval: 60000,
      batchSize: 100,
      retryAttempts: 3,
      retryDelay: 5000,
    },
  };
}

/**
 * Create mock search query
 */
export function createMockSearchQuery(overrides: Partial<SearchQuery> = {}): SearchQuery {
  return {
    query: 'test query',
    limit: 10,
    semantic: true,
    fuzzy: false,
    includeContent: true,
    ...overrides,
  };
}

/**
 * Create mock search response
 */
export function createMockSearchResponse(overrides: Partial<SearchResponse> = {}): SearchResponse {
  return {
    results: [],
    total: 0,
    took: 25,
    query: createMockSearchQuery(),
    ...overrides,
  };
}

/**
 * Create mock indexable content
 */
export function createMockContent(overrides: Partial<IndexableContent> = {}): IndexableContent {
  const fileMetadata: FileMetadata = {
    type: 'file',
    source: 'filesystem',
    path: '/test/file.txt',
    size: 25,
  };

  return {
    id: 'test-id-' + Math.random().toString(36).substring(2, 11),
    type: 'file' as ContentType,
    source: 'filesystem' as ContentSource,
    content: 'Test content for indexing',
    metadata: fileMetadata as ContentMetadata,
    timestamp: Date.now(),
    ...overrides,
  };
}

/**
 * Create multiple mock content items
 */
export function createMockContentList(
  count: number,
  overrides: Partial<IndexableContent> = {},
): IndexableContent[] {
  return Array.from({ length: count }, (_, index) =>
    createMockContent({
      id: `test-id-${index}`,
      content: `Test content ${index}`,
      metadata: {
        type: 'file',
        source: 'filesystem',
        path: `/test/file-${index}.txt`,
        size: 20 + index,
      } as ContentMetadata,
      ...overrides,
    }),
  );
}

/**
 * Create mock service status
 */
export function createMockServiceStatus(overrides: Partial<ServiceStatus> = {}): ServiceStatus {
  return {
    healthy: true,
    indexing: false,
    lastSync: Date.now(),
    nextSync: Date.now() + 300000,
    activeSources: ['filesystem' as ContentSource],
    issues: [],
    ...overrides,
  };
}

/**
 * Create mock cross-domain search options
 */
export function createMockCrossDomainSearchOptions(
  overrides: Partial<CrossDomainSearchOptions> = {},
): CrossDomainSearchOptions {
  return {
    query: 'test query',
    limit: 10,
    semantic: true,
    includeContext: false,
    timeBoost: false,
    deduplicate: true,
    groupBySource: false,
    includeAnalytics: false,
    explainScores: false,
    ...overrides,
  };
}

/**
 * Create invalid configuration for error testing
 */
export function createInvalidConfig(): Partial<UnifiedIndexerServiceConfig> {
  return {
    indexing: {
      vectorStore: {
        type: 'invalid' as any,
        connectionString: '',
        indexName: '',
      },
      metadataStore: {
        type: 'invalid' as any,
        connectionString: '',
        tableName: '',
      },
      embedding: {
        model: '',
        dimensions: -1,
        batchSize: -1,
      },
      cache: {
        enabled: false,
        ttl: -1,
        maxSize: -1,
      },
      validation: {
        strict: false,
        skipVectorValidation: false,
        maxContentLength: -1,
      },
    },
    contextStore: {
      collections: {
        files: '',
        discord: '',
        opencode: '',
        kanban: '',
        unified: '',
      },
    },
    sources: {
      files: {
        enabled: true,
        paths: [''],
      },
      discord: {
        enabled: true,
      },
      opencode: {
        enabled: true,
      },
      kanban: {
        enabled: true,
      },
    },
    sync: {
      interval: -1,
      batchSize: -1,
      retryAttempts: -1,
      retryDelay: -1,
    },
  };
}

/**
 * Create mock indexer with common methods
 */
export function createMockIndexer() {
  return {
    indexDirectory: jest.fn().mockResolvedValue({
      totalFiles: 10,
      indexedFiles: 8,
      skippedFiles: 2,
      errors: [],
      duration: 1000,
    }),
    cleanup: jest.fn().mockResolvedValue(undefined),
  };
}

/**
 * Create mock unified client
 */
export function createMockUnifiedClient() {
  return {
    search: jest.fn().mockResolvedValue(createMockSearchResponse()),
    getStats: jest.fn().mockResolvedValue({
      totalContent: 100,
      contentByType: {} as Record<ContentType, number>,
      contentBySource: {} as Record<ContentSource, number>,
      lastIndexed: Date.now(),
      storageStats: {
        vectorSize: 1024000,
        metadataSize: 512000,
        totalSize: 1536000,
      },
    }),
    healthCheck: jest.fn().mockResolvedValue({
      healthy: true,
      issues: [],
    }),
    close: jest.fn().mockResolvedValue(undefined),
  };
}

/**
 * Create mock context store
 */
export function createMockContextStore() {
  const collections = new Map();

  return {
    collections,
    formatTime: (ms: number) => new Date(ms).toISOString(),
    assistantName: 'TestAssistant',
  };
}
