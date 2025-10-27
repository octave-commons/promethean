/**
 * Simple Mock Factories for Testing
 *
 * Simplified mock factories that match actual type definitions
 */

import type {
  UnifiedIndexerServiceConfig,
  UnifiedIndexerStats,
  ServiceStatus,
} from '../../types/service.js';
import type {
  CrossDomainSearchOptions,
  EnhancedSearchResult,
  CrossDomainSearchResponse,
} from '../../types/search.js';
import type {
  ContentType,
  ContentSource,
  IndexingStats,
  FileIndexingStats,
  ContextMessage,
  SearchQuery,
  SearchResult,
  IndexableContent,
} from '@promethean-os/persistence';

/**
 * Create minimal service configuration
 */
export const createMinimalConfig = (): UnifiedIndexerServiceConfig => ({
  indexing: {
    vectorStore: {
      type: 'chromadb',
      connectionString: 'http://localhost:8000',
      indexName: 'test-index',
    },
    metadataStore: {
      type: 'mongodb',
      connectionString: 'mongodb://localhost:27017',
      tableName: 'test-table',
    },
    embedding: {
      model: 'test-model',
      dimensions: 1536,
      batchSize: 100,
    },
    cache: {
      enabled: true,
      ttl: 3600,
      maxSize: 1000,
    },
    validation: {
      strict: false,
      skipVectorValidation: true,
      maxContentLength: 10000,
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
  },
  sources: {
    files: {
      enabled: true,
      paths: ['/test/path'],
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
    interval: 60000,
    batchSize: 50,
    retryAttempts: 3,
    retryDelay: 5000,
  },
});

/**
 * Create mock service status
 */
export const createMockServiceStatus = (overrides: Partial<ServiceStatus> = {}): ServiceStatus => ({
  healthy: true,
  indexing: false,
  lastSync: Date.now() - 60000,
  nextSync: Date.now() + 60000,
  activeSources: ['filesystem'],
  issues: [],
  ...overrides,
});

/**
 * Create mock indexing stats
 */
export const createMockIndexingStats = (overrides: Partial<IndexingStats> = {}): IndexingStats => ({
  totalContent: 100,
  contentByType: {
    file: 50,
    message: 30,
    event: 10,
    session: 5,
    attachment: 3,
    thought: 2,
  } as Record<ContentType, number>,
  contentBySource: {
    filesystem: 60,
    discord: 20,
    opencode: 10,
    agent: 5,
    user: 3,
    system: 2,
  } as Record<ContentSource, number>,
  lastIndexed: Date.now() - 60000,
  storageStats: {
    vectorSize: 1000000,
    metadataSize: 500000,
    totalSize: 1500000,
  },
  ...overrides,
});

/**
 * Create mock file indexing stats
 */
export const createMockFileIndexingStats = (
  overrides: Partial<FileIndexingStats> = {},
): FileIndexingStats => ({
  totalFiles: 100,
  indexedFiles: 95,
  skippedFiles: 5,
  errors: [],
  duration: 30000,
  ...overrides,
});

/**
 * Create mock cross-domain search options
 */
export const createMockCrossDomainSearchOptions = (
  overrides: Partial<CrossDomainSearchOptions> = {},
): CrossDomainSearchOptions => ({
  query: 'test query',
  sources: ['filesystem'],
  types: ['file'],
  limit: 10,
  offset: 0,
  filters: {},
  includeContext: false,
  includeAnalytics: false,
  ...overrides,
});

/**
 * Create mock enhanced search result
 */
export const createMockEnhancedSearchResult = (
  overrides: Partial<EnhancedSearchResult> = {},
): EnhancedSearchResult => ({
  id: 'test-result-1',
  content: 'Test content',
  metadata: {
    path: '/test/path',
    size: 1000,
    type: 'file',
    source: 'filesystem',
  },
  score: 0.85,
  source: 'filesystem',
  type: 'file',
  timestamp: Date.now(),
  ...overrides,
});

/**
 * Create mock cross-domain search response
 */
export const createMockCrossDomainSearchResponse = (
  overrides: Partial<CrossDomainSearchResponse> = {},
): CrossDomainSearchResponse => ({
  results: [createMockEnhancedSearchResult()],
  total: 1,
  query: 'test query',
  sources: ['filesystem'],
  types: ['file'],
  limit: 10,
  offset: 0,
  hasMore: false,
  executionTime: 150,
  ...overrides,
});

/**
 * Create mock unified indexer stats
 */
export const createMockUnifiedIndexerStats = (
  overrides: Partial<UnifiedIndexerStats> = {},
): UnifiedIndexerStats => ({
  total: createMockIndexingStats(),
  bySource: {
    filesystem: createMockFileIndexingStats(),
  },
  byType: {
    file: 50,
    message: 30,
    event: 10,
    session: 5,
    attachment: 3,
    thought: 2,
  } as Record<ContentType, number>,
  lastSync: Date.now() - 60000,
  syncDuration: 30000,
  errors: [],
  ...overrides,
});

/**
 * Create mock context message
 */
export const createMockContextMessage = (
  overrides: Partial<ContextMessage> = {},
): ContextMessage => ({
  role: 'user',
  content: 'Test message content',
  images: [],
  ...overrides,
});
