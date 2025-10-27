/**
 * Enhanced Mock Factories
 *
 * Type-safe mock data generators for comprehensive testing
 */

import type {
  SearchResult,
  IndexableContent,
  ContentType,
  ContentSource,
  ContextMessage,
} from '@promethean-os/persistence';

import type {
  UnifiedIndexerServiceConfig,
  ServiceStatus,
  UnifiedIndexerStats,
} from '../../types/service.js';

import type {
  CrossDomainSearchOptions,
  EnhancedSearchResult,
  CrossDomainSearchResponse,
} from '../../types/search.js';

/**
 * Create mock enhanced search result with full metadata
 */
export function createMockEnhancedSearchResult(
  overrides: Partial<EnhancedSearchResult> = {},
): EnhancedSearchResult {
  const baseContent: IndexableContent = {
    id: 'mock-content-id',
    type: 'file' as ContentType,
    source: 'filesystem' as ContentSource,
    content: 'Mock content for testing',
    metadata: {
      type: 'file',
      source: 'filesystem',
      path: '/mock/path/file.txt',
      size: 1024,
    },
    timestamp: Date.now(),
  };

  const baseResult: SearchResult = {
    content: baseContent,
    score: 0.85,
    highlights: ['mock', 'highlight'],
  };

  const now = Date.now();
  const age = 3600000; // 1 hour in ms

  return {
    ...baseResult,
    sourceType: 'filesystem' as ContentSource,
    contentType: 'file' as ContentType,
    age,
    recencyScore: 0.5,
    context: [
      {
        role: 'system',
        content: 'System context message',
        timestamp: now - 7200000,
      },
      {
        role: 'user',
        content: 'User context message',
        timestamp: now - 3600000,
      },
    ],
    contextRelevance: 0.75,
    scoreBreakdown: {
      semantic: 0.6,
      keyword: 0.3,
      temporal: 0.1,
      source: 1.2,
      type: 1.1,
      final: 0.85,
    },
    explanation:
      'Score: 0.850 (semantic: 0.600, keyword: 0.300, temporal: 0.100, source: 1.20, type: 1.10)',
    ...overrides,
  };
}

/**
 * Create mock cross-domain search response with analytics
 */
export function createMockCrossDomainSearchResponse(
  overrides: Partial<CrossDomainSearchResponse> = {},
): CrossDomainSearchResponse {
  const now = Date.now();
  const results = [
    createMockEnhancedSearchResult(),
    createMockEnhancedSearchResult({
      score: 0.75,
      sourceType: 'discord' as ContentSource,
      contentType: 'message' as ContentType,
      age: 1800000, // 30 minutes
      recencyScore: 0.75,
    }),
    createMockEnhancedSearchResult({
      score: 0.65,
      sourceType: 'opencode' as ContentSource,
      contentType: 'document' as ContentType,
      age: 7200000, // 2 hours
      recencyScore: 0.25,
    }),
  ];

  return {
    results,
    total: 150,
    took: 45,
    query: createMockCrossDomainSearchOptions(),
    analytics: {
      sourcesSearched: ['filesystem', 'discord', 'opencode'] as ContentSource[],
      typesFound: ['file', 'message', 'document'] as ContentType[],
      averageScore: 0.75,
      scoreDistribution: {
        min: 0.1,
        max: 0.95,
        median: 0.8,
        mean: 0.75,
        p95: 0.9,
      },
      temporalRange: {
        oldest: now - 7200000, // 2 hours ago
        newest: now - 1800000, // 30 minutes ago
        span: 5400000, // 1.5 hours
      },
    },
    context: [
      {
        role: 'assistant',
        content: 'Compiled context for LLM',
        timestamp: now,
      },
    ],
    ...overrides,
  };
}

/**
 * Create mock cross-domain search options with all features
 */
export function createMockCrossDomainSearchOptions(
  overrides: Partial<CrossDomainSearchOptions> = {},
): CrossDomainSearchOptions {
  return {
    query: 'test search query',
    limit: 10,
    semantic: true,
    fuzzy: false,
    includeContent: true,
    // Context compilation options
    includeContext: true,
    contextLimit: 5,
    formatForLLM: true,
    // Source weighting
    sourceWeights: {
      filesystem: 1.2,
      discord: 1.0,
      opencode: 1.1,
      kanban: 1.0,
      agent: 1.0,
      user: 1.0,
      system: 1.0,
      external: 0.8,
    },
    typeWeights: {
      file: 1.2,
      document: 1.1,
      message: 1.0,
      task: 1.3,
      event: 0.9,
      session: 1.0,
      attachment: 0.8,
      thought: 1.1,
      board: 1.0,
    },
    // Temporal filtering
    timeBoost: true,
    recencyDecay: 24, // 24 hours
    // Semantic search options
    semanticThreshold: 0.5,
    hybridSearch: true,
    keywordWeight: 0.3,
    // Result processing
    deduplicate: true,
    groupBySource: false,
    maxResultsPerSource: 3,
    // Analytics
    includeAnalytics: true,
    explainScores: true,
    ...overrides,
  };
}

/**
 * Create mock service status with comprehensive data
 */
export function createMockServiceStatus(overrides: Partial<ServiceStatus> = {}): ServiceStatus {
  const now = Date.now();

  return {
    healthy: true,
    indexing: false,
    lastSync: now - 300000, // 5 minutes ago
    nextSync: now + 2700000, // 45 minutes from now
    activeSources: ['filesystem', 'discord', 'opencode'] as ContentSource[],
    issues: [],
    ...overrides,
  };
}

/**
 * Create mock unified indexer stats with detailed breakdown
 */
export function createMockUnifiedIndexerStats(
  overrides: Partial<UnifiedIndexerStats> = {},
): UnifiedIndexerStats {
  const now = Date.now();

  return {
    total: {
      totalContent: 1250,
      totalFiles: 1000,
      totalMessages: 250,
      indexedFiles: 950,
      skippedFiles: 50,
      errors: [],
    },
    bySource: {
      filesystem: {
        totalFiles: 1000,
        indexedFiles: 950,
        skippedFiles: 50,
        errors: [],
        duration: 12000,
      },
      discord: {
        totalMessages: 250,
        indexedMessages: 240,
        skippedMessages: 10,
        errors: [],
        duration: 8000,
      },
      opencode: {
        totalDocuments: 0,
        indexedDocuments: 0,
        skippedDocuments: 0,
        errors: [],
        duration: 0,
      },
      kanban: {
        totalTasks: 0,
        indexedTasks: 0,
        skippedTasks: 0,
        errors: [],
        duration: 0,
      },
    },
    byType: {
      file: 1000,
      document: 150,
      message: 250,
      task: 50,
      event: 25,
      session: 10,
      attachment: 15,
      thought: 30,
      board: 20,
    },
    lastSync: now - 300000, // 5 minutes ago
    syncDuration: 20000, // 20 seconds
    errors: [],
    ...overrides,
  };
}

/**
 * Create mock service configuration with all features enabled
 */
export function createMockFullServiceConfig(
  overrides: Partial<UnifiedIndexerServiceConfig> = {},
): UnifiedIndexerServiceConfig {
  return {
    indexing: {
      vectorStore: {
        type: 'chromadb',
        connectionString: 'http://localhost:8000',
        indexName: 'test-unified-index',
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
        ttl: 300000, // 5 minutes
        maxSize: 10000,
      },
      validation: {
        strict: false,
        skipVectorValidation: false,
        maxContentLength: 1000000,
      },
    },
    contextStore: {
      collections: {
        files: 'test_files_collection',
        discord: 'test_discord_collection',
        opencode: 'test_opencode_collection',
        kanban: 'test_kanban_collection',
        unified: 'test_unified_collection',
      },
      formatTime: (ms: number) => new Date(ms).toISOString(),
      assistantName: 'TestAssistant',
    },
    sources: {
      files: {
        enabled: true,
        paths: ['/test/files', '/test/docs'],
        options: {
          includePatterns: ['*.ts', '*.js', '*.md'],
          excludePatterns: ['node_modules', '.git'],
          maxFileSize: 1048576, // 1MB
        },
      },
      discord: {
        enabled: true,
        provider: 'discord-test-provider',
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
      interval: 60000, // 1 minute
      batchSize: 50,
      retryAttempts: 3,
      retryDelay: 5000, // 5 seconds
    },
    ...overrides,
  };
}

/**
 * Create mock context messages for testing
 */
export function createMockContextMessages(count: number = 5): ContextMessage[] {
  const now = Date.now();
  const messages: ContextMessage[] = [];

  for (let i = 0; i < count; i++) {
    messages.push({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Mock context message ${i + 1}`,
      timestamp: now - (count - i) * 60000, // 1 minute apart
    });
  }

  return messages;
}

/**
 * Create mock search results with varying scores
 */
export function createMockSearchResultsWithScores(scores: number[]): SearchResult[] {
  return scores.map((score, index) => ({
    content: {
      id: `mock-result-${index}`,
      type: 'file' as ContentType,
      source: 'filesystem' as ContentSource,
      content: `Mock content ${index + 1}`,
      metadata: {
        type: 'file',
        source: 'filesystem',
        path: `/mock/file-${index + 1}.txt`,
        size: 100 + index * 10,
      },
      timestamp: Date.now() - index * 60000,
    },
    score,
    highlights: [`highlight-${index + 1}`],
  }));
}

/**
 * Create mock enhanced search results with different sources
 */
export function createMockEnhancedResultsFromSources(
  sources: ContentSource[],
): EnhancedSearchResult[] {
  return sources.map((source, index) =>
    createMockEnhancedSearchResult({
      sourceType: source,
      score: 0.9 - index * 0.1,
      age: index * 1800000, // Different ages
      recencyScore: 1.0 - index * 0.15,
    }),
  );
}

/**
 * Create edge case search options for testing validation
 */
export function createEdgeCaseSearchOptions(): Record<string, CrossDomainSearchOptions> {
  return {
    emptyQuery: {
      query: '',
      limit: 10,
    },
    negativeLimit: {
      query: 'test',
      limit: -1,
    },
    zeroLimit: {
      query: 'test',
      limit: 0,
    },
    invalidThreshold: {
      query: 'test',
      semanticThreshold: -0.1,
    },
    invalidWeight: {
      query: 'test',
      keywordWeight: 1.5,
    },
    invalidRecencyDecay: {
      query: 'test',
      recencyDecay: 0,
    },
    invalidMaxResults: {
      query: 'test',
      maxResultsPerSource: 0,
    },
  };
}

/**
 * Create edge case service configurations for testing validation
 */
export function createEdgeCaseServiceConfigs(): Record<
  string,
  Partial<UnifiedIndexerServiceConfig>
> {
  return {
    missingIndexing: {
      // Missing indexing config
      contextStore: {
        collections: {
          files: 'test',
          discord: 'test',
          opencode: 'test',
          kanban: 'test',
          unified: 'test',
        },
      },
      sources: {
        files: { enabled: false, paths: [] },
        discord: { enabled: false },
        opencode: { enabled: false },
        kanban: { enabled: false },
      },
      sync: {
        interval: 60000,
        batchSize: 50,
        retryAttempts: 3,
        retryDelay: 5000,
      },
    },
    missingCollections: {
      indexing: {
        vectorStore: {
          type: 'chromadb',
          connectionString: 'http://localhost:8000',
          indexName: 'test',
        },
        metadataStore: {
          type: 'mongodb',
          connectionString: 'mongodb://localhost:27017',
          tableName: 'test',
        },
        embedding: {
          model: 'test-model',
          dimensions: 1536,
          batchSize: 100,
        },
      },
      // Missing collections in contextStore
      contextStore: {},
      sources: {
        files: { enabled: false, paths: [] },
        discord: { enabled: false },
        opencode: { enabled: false },
        kanban: { enabled: false },
      },
      sync: {
        interval: 60000,
        batchSize: 50,
        retryAttempts: 3,
        retryDelay: 5000,
      },
    },
    invalidSyncValues: {
      indexing: {
        vectorStore: {
          type: 'chromadb',
          connectionString: 'http://localhost:8000',
          indexName: 'test',
        },
        metadataStore: {
          type: 'mongodb',
          connectionString: 'mongodb://localhost:27017',
          tableName: 'test',
        },
        embedding: {
          model: 'test-model',
          dimensions: 1536,
          batchSize: 100,
        },
      },
      contextStore: {
        collections: {
          files: 'test',
          discord: 'test',
          opencode: 'test',
          kanban: 'test',
          unified: 'test',
        },
      },
      sources: {
        files: { enabled: false, paths: [] },
        discord: { enabled: false },
        opencode: { enabled: false },
        kanban: { enabled: false },
      },
      sync: {
        interval: -1, // Invalid negative
        batchSize: 0, // Invalid zero
        retryAttempts: -1, // Invalid negative
        retryDelay: -1, // Invalid negative
      },
    },
  };
}
