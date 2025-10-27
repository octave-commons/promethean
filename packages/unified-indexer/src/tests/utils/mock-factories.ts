/**
 * Mock Factories for Unified Indexer Tests
 *
 * Factory functions to create mock objects and configurations
 */

import type {
  SearchQuery,
  SearchResponse,
  IndexableContent,
  ContentType,
  ContentSource,
  ContentMetadata,
  FileMetadata,
} from '@promethean-os/persistence';

import type { UnifiedIndexerServiceConfig, ServiceStatus } from '../../types/service.js';
import type { CrossDomainSearchOptions } from '../../types/search.js';

/**
 * Create test indexing configuration
 */
const createTestIndexingConfig = () => ({
  vectorStore: {
    type: 'chromadb' as const,
    connectionString: 'test://localhost:8000',
    indexName: 'test-index',
  },
  metadataStore: {
    type: 'mongodb' as const,
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
});

/**
 * Create test context store configuration
 */
const createTestContextStoreConfig = () => ({
  collections: {
    files: 'test-files',
    discord: 'test-discord',
    opencode: 'test-opencode',
    kanban: 'test-kanban',
    unified: 'test-unified',
  },
});

/**
 * Create test sources configuration
 */
const createTestSourcesConfig = () => ({
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
});

/**
 * Create test sync configuration
 */
const createTestSyncConfig = () => ({
  interval: 1000,
  batchSize: 10,
  retryAttempts: 1,
  retryDelay: 100,
});

/**
 * Create minimal valid configuration for testing
 */
export const createMinimalConfig = (): UnifiedIndexerServiceConfig => ({
  indexing: createTestIndexingConfig(),
  contextStore: createTestContextStoreConfig(),
  sources: createTestSourcesConfig(),
  sync: createTestSyncConfig(),
});

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
 * Create mock indexer with common methods
 */
export const createMockIndexer = (): {
  indexDirectory: () => Promise<{
    totalFiles: number;
    indexedFiles: number;
    skippedFiles: number;
    errors: string[];
    duration: number;
  }>;
  cleanup: () => Promise<void>;
} => ({
  indexDirectory: async () => ({
    totalFiles: 10,
    indexedFiles: 8,
    skippedFiles: 2,
    errors: [],
    duration: 1000,
  }),
  cleanup: async () => undefined,
});

/**
 * Create mock unified client
 */
export const createMockUnifiedClient = (): {
  search: () => Promise<SearchResponse>;
  getStats: () => Promise<{
    totalContent: number;
    contentByType: Record<ContentType, number>;
    contentBySource: Record<ContentSource, number>;
    lastIndexed: number;
    storageStats: { vectorSize: number; metadataSize: number; totalSize: number };
  }>;
  healthCheck: () => Promise<{ healthy: boolean; issues: string[] }>;
  close: () => Promise<void>;
} => ({
  search: async () => createMockSearchResponse(),
  getStats: async () => ({
    totalContent: 100,
    contentByType: {
      file: 80,
      document: 20,
      message: 0,
      event: 0,
      session: 0,
      attachment: 0,
      thought: 0,
      task: 0,
      board: 0,
    } as Record<ContentType, number>,
    contentBySource: {
      filesystem: 100,
      discord: 0,
      opencode: 0,
      agent: 0,
      user: 0,
      system: 0,
      external: 0,
      kanban: 0,
    } as Record<ContentSource, number>,
    lastIndexed: Date.now(),
    storageStats: {
      vectorSize: 1024000,
      metadataSize: 512000,
      totalSize: 1536000,
    },
  }),
  healthCheck: async () => ({
    healthy: true,
    issues: [],
  }),
  close: async () => undefined,
});

/**
 * Create mock context store
 */
export const createMockContextStore = (): {
  collections: Map<string, unknown>;
  formatTime: (ms: number) => string;
  assistantName: string;
} => {
  const collections: Map<string, unknown> = new Map();

  return {
    collections,
    formatTime: (ms: number) => new Date(ms).toISOString(),
    assistantName: 'TestAssistant',
  };
};
