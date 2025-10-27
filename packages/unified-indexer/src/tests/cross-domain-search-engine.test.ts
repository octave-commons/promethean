/**
 * Unit Tests for CrossDomainSearchEngine
 *
 * Tests for advanced cross-domain search functionality including
 * result enhancement, analytics, and intelligent search
 */

import test from 'ava';

import { CrossDomainSearchEngine, createCrossDomainSearchEngine } from '../cross-domain-search.js';
import { UnifiedIndexerService } from '../unified-indexer-service.js';
import type {
  CrossDomainSearchOptions,
  EnhancedSearchResult,
  CrossDomainSearchResponse,
} from '../types/search.js';

// Mock types for testing since persistence types aren't available
interface MockSearchQuery {
  query: string;
  limit?: number;
  semantic?: boolean;
  fuzzy?: boolean;
  includeContent?: boolean;
  type?: string;
  source?: string | string[];
  dateFrom?: number;
  dateTo?: number;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

interface MockSearchResult {
  content: MockIndexableContent;
  score: number;
  highlights?: string[];
}

interface MockSearchResponse {
  results: MockSearchResult[];
  total: number;
  took: number;
  query: MockSearchQuery;
}

interface MockIndexableContent {
  id: string;
  type: string;
  source: string;
  content: string;
  metadata: Record<string, unknown>;
  timestamp: number;
}

type MockContentSource =
  | 'filesystem'
  | 'discord'
  | 'opencode'
  | 'kanban'
  | 'agent'
  | 'user'
  | 'system'
  | 'external';
type MockContentType =
  | 'file'
  | 'document'
  | 'message'
  | 'task'
  | 'event'
  | 'session'
  | 'attachment'
  | 'thought'
  | 'board';

// Mock factory functions
const createMockSearchQuery = (overrides: Partial<MockSearchQuery> = {}): MockSearchQuery => ({
  query: 'test query',
  limit: 10,
  semantic: true,
  fuzzy: false,
  includeContent: true,
  ...overrides,
});

const createMockSearchResponse = (
  overrides: Partial<MockSearchResponse> = {},
): MockSearchResponse => ({
  results: [],
  total: 0,
  took: 25,
  query: createMockSearchQuery(),
  ...overrides,
});

const createMockContent = (
  overrides: Partial<MockIndexableContent> = {},
): MockIndexableContent => ({
  id: 'test-id-' + Math.random().toString(36).substring(2, 11),
  type: 'file',
  source: 'filesystem',
  content: 'Test content for indexing',
  metadata: {
    type: 'file',
    source: 'filesystem',
    path: '/test/file.txt',
    size: 25,
  },
  timestamp: Date.now(),
  ...overrides,
});

const createMockContentList = (
  count: number,
  overrides: Partial<MockIndexableContent> = {},
): MockIndexableContent[] =>
  Array.from({ length: count }, (_, index) =>
    createMockContent({
      id: `test-id-${index}`,
      content: `Test content ${index}`,
      metadata: {
        type: 'file',
        source: 'filesystem',
        path: `/test/file-${index}.txt`,
        size: 20 + index,
      },
      ...overrides,
    }),
  );

const measureTime = async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  return { result, duration };
};

// Create a mock service that properly implements the interface
const createMockService = (overrides: Partial<UnifiedIndexerService> = {}) => {
  const service = {
    search: async (query: MockSearchQuery) => createMockSearchResponse(),
    getContext: async () => [],
    ...overrides,
  } as UnifiedIndexerService;

  // Add stub methods for testing
  (service as any).search = {
    called: false,
    calledOnce: false,
    args: [],
    getCall: (index: number) => ({
      args: (service as any).search.args[index] || [],
    }),
  };

  (service as any).getContext = {
    called: false,
    calledOnce: false,
    args: [],
  };

  return service;
};

test('should create cross-domain search engine', (t) => {
  const mockService = {} as UnifiedIndexerService;
  const engine = new CrossDomainSearchEngine(mockService);

  t.truthy(engine);
  t.true(engine instanceof CrossDomainSearchEngine);
});

test('should create cross-domain search engine with factory', (t) => {
  const mockService = {} as UnifiedIndexerService;
  const defaultOptions = { limit: 20, semantic: true };
  const engine = createCrossDomainSearchEngine(mockService, defaultOptions);

  t.truthy(engine);
  t.true(engine instanceof CrossDomainSearchEngine);
});

test('should perform basic search', async (t) => {
  const mockService = createMockService();
  (mockService as any).search = async () =>
    createMockSearchResponse({
      results: [
        {
          content: createMockContent({ content: 'test content' }),
          score: 0.85,
          highlights: ['test'],
        },
      ],
      total: 1,
    });
  (mockService as any).search.calledOnce = false;

  const engine = new CrossDomainSearchEngine(mockService);
  const options: CrossDomainSearchOptions = {
    query: 'test query',
    limit: 10,
    semantic: true,
  };

  const response = await engine.search(options);

  t.true((mockService as any).search.calledOnce);
  t.is(response.results.length, 1);
  t.is(response.total, 1);
  t.true(response.took >= 0);
  t.deepEqual(response.query, options);
});

test('should enhance search results with metadata', async (t) => {
  const now = Date.now();
  const mockContent = createMockContent({
    timestamp: now - 3600000, // 1 hour ago
    source: 'filesystem',
    type: 'file',
  });

  const mockService = createMockService();
  (mockService as any).search = async () =>
    createMockSearchResponse({
      results: [
        {
          content: mockContent,
          score: 0.85,
          highlights: ['test'],
        },
      ],
      total: 1,
    });

  const engine = new CrossDomainSearchEngine(mockService);
  const options: CrossDomainSearchOptions = {
    query: 'test query',
    limit: 10,
    explainScores: true,
  };

  const response = await engine.search(options);
  const result = response.results[0] as EnhancedSearchResult;

  t.is(result.sourceType, 'filesystem');
  t.is(result.contentType, 'file');
  t.true(result.age >= 3599000 && result.age <= 3601000); // ~1 hour
  t.true(result.recencyScore >= 0 && result.recencyScore <= 1);
  t.truthy(result.scoreBreakdown);
  t.truthy(result.explanation);
});

test('should apply source and type weights', async (t) => {
  const mockContent1 = createMockContent({
    source: 'filesystem',
    type: 'file',
  });
  const mockContent2 = createMockContent({
    source: 'discord',
    type: 'message',
  });

  const mockService = createMockService();
  (mockService as any).search = async () =>
    createMockSearchResponse({
      results: [
        { content: mockContent1, score: 0.8, highlights: [] },
        { content: mockContent2, score: 0.8, highlights: [] },
      ],
      total: 2,
    });

  const engine = new CrossDomainSearchEngine(mockService);
  const options: CrossDomainSearchOptions = {
    query: 'test query',
    limit: 10,
    sourceWeights: {
      filesystem: 1.5,
      discord: 1.0,
    },
    typeWeights: {
      file: 1.2,
      message: 1.0,
    },
  };

  const response = await engine.search(options);

  t.is(response.results.length, 2);
  // Filesystem file should have higher score due to weights
  t.true(response.results[0].score > response.results[1].score);
});

test('should apply temporal boost to recent content', async (t) => {
  const now = Date.now();
  const recentContent = createMockContent({ timestamp: now - 60000 }); // 1 minute ago
  const oldContent = createMockContent({ timestamp: now - 86400000 }); // 1 day ago

  const mockService = createMockService();
  (mockService as any).search = async () =>
    createMockSearchResponse({
      results: [
        { content: recentContent, score: 0.7, highlights: [] },
        { content: oldContent, score: 0.7, highlights: [] },
      ],
      total: 2,
    });

  const engine = new CrossDomainSearchEngine(mockService);
  const options: CrossDomainSearchOptions = {
    query: 'test query',
    limit: 10,
    timeBoost: true,
  };

  const response = await engine.search(options);

  t.is(response.results.length, 2);
  // Recent content should have higher score due to temporal boost
  t.true(response.results[0].score > response.results[1].score);
});

test('should deduplicate similar results', async (t) => {
  const mockContent = createMockContent({
    content: 'This is test content for duplication test',
    source: 'filesystem',
    type: 'file',
  });

  const mockService = createMockService();
  (mockService as any).search = async () =>
    createMockSearchResponse({
      results: [
        { content: mockContent, score: 0.85, highlights: [] },
        { content: { ...mockContent, id: 'different-id' }, score: 0.83, highlights: [] },
      ],
      total: 2,
    });

  const engine = new CrossDomainSearchEngine(mockService);
  const options: CrossDomainSearchOptions = {
    query: 'test query',
    limit: 10,
    deduplicate: true,
  };

  const response = await engine.search(options);

  // Should deduplicate similar content
  t.is(response.results.length, 1);
});

test('should group results by source', async (t) => {
  const fileContent = createMockContent({ source: 'filesystem' });
  const discordContent = createMockContent({ source: 'discord' });
  const kanbanContent = createMockContent({ source: 'kanban' });

  const mockService = createMockService();
  (mockService as any).search = async () =>
    createMockSearchResponse({
      results: [
        { content: fileContent, score: 0.9, highlights: [] },
        { content: discordContent, score: 0.8, highlights: [] },
        { content: kanbanContent, score: 0.7, highlights: [] },
      ],
      total: 3,
    });

  const engine = new CrossDomainSearchEngine(mockService);
  const options: CrossDomainSearchOptions = {
    query: 'test query',
    limit: 10,
    groupBySource: true,
    maxResultsPerSource: 1,
  };

  const response = await engine.search(options);

  t.is(response.results.length, 3);
  // Results should be grouped by source
  const sources = response.results.map((r) => (r as EnhancedSearchResult).sourceType);
  t.true(sources.includes('filesystem'));
  t.true(sources.includes('discord'));
  t.true(sources.includes('kanban'));
});

test('should include analytics when requested', async (t) => {
  const mockContentList = createMockContentList(5, {
    source: 'filesystem',
    type: 'file',
  });

  const mockService = createMockService();
  (mockService as any).search = async () =>
    createMockSearchResponse({
      results: mockContentList.map((content) => ({
        content,
        score: Math.random(),
        highlights: [],
      })),
      total: 5,
    });

  const engine = new CrossDomainSearchEngine(mockService);
  const options: CrossDomainSearchOptions = {
    query: 'test query',
    limit: 10,
    includeAnalytics: true,
  };

  const response = await engine.search(options);

  t.truthy(response.analytics);
  t.true(Array.isArray(response.analytics.sourcesSearched));
  t.true(Array.isArray(response.analytics.typesFound));
  t.true(typeof response.analytics.averageScore === 'number');
  t.truthy(response.analytics.scoreDistribution);
  t.truthy(response.analytics.temporalRange);
});

test('should compile context when requested', async (t) => {
  const mockService = createMockService();
  (mockService as any).search = async () =>
    createMockSearchResponse({
      results: [{ content: createMockContent(), score: 0.85, highlights: [] }],
      total: 1,
    });
  (mockService as any).getContext = async () => [
    { role: 'system', content: 'System context' },
    { role: 'user', content: 'User context' },
  ];
  (mockService as any).getContext.calledOnce = false;

  const engine = new CrossDomainSearchEngine(mockService);
  const options: CrossDomainSearchOptions = {
    query: 'test query',
    limit: 10,
    includeContext: true,
    contextLimit: 5,
    formatForLLM: true,
  };

  const response = await engine.search(options);

  t.true((mockService as any).getContext.calledOnce);
  t.true(Array.isArray(response.context));
  t.true(response.context!.length > 0);
});

test('should perform intelligent search with query expansion', async (t) => {
  const mockService = createMockService();
  (mockService as any).search = async () =>
    createMockSearchResponse({
      results: [{ content: createMockContent(), score: 0.85, highlights: [] }],
      total: 1,
    });
  (mockService as any).search.calledOnce = false;

  const engine = new CrossDomainSearchEngine(mockService);

  const response = await engine.intelligentSearch('indexing files', {
    limit: 10,
  });

  t.true((mockService as any).search.calledOnce);
  const searchCall = (mockService as any).search.getCall(0);
  const searchOptions = searchCall.args[0] as CrossDomainSearchOptions;

  t.true(searchOptions.semantic);
  t.true(searchOptions.hybridSearch);
  t.is(searchOptions.keywordWeight, 0.3);
  t.true(searchOptions.includeAnalytics);
});

test('should perform contextual search for LLM consumption', async (t) => {
  const mockService = createMockService();
  (mockService as any).search = async () =>
    createMockSearchResponse({
      results: [{ content: createMockContent(), score: 0.85, highlights: [] }],
      total: 1,
    });
  (mockService as any).getContext = async () => [
    { role: 'system', content: 'System context' },
    { role: 'user', content: 'User context' },
  ];
  (mockService as any).search.calledOnce = false;
  (mockService as any).getContext.calledOnce = false;

  const engine = new CrossDomainSearchEngine(mockService);

  const response = await engine.getContextualSearch(['test query', 'context'], {
    limit: 20,
  });

  t.true((mockService as any).search.calledOnce);
  t.true((mockService as any).getContext.calledOnce);
  t.truthy(response.searchResults);
  t.true(Array.isArray(response.context));
  t.true(response.context.length > 0);
});

test('should handle search errors gracefully', async (t) => {
  const mockService = createMockService();
  (mockService as any).search = async () => {
    throw new Error('Search service unavailable');
  };

  const engine = new CrossDomainSearchEngine(mockService);
  const options: CrossDomainSearchOptions = {
    query: 'test query',
    limit: 10,
  };

  await t.throwsAsync(() => engine.search(options), {
    message: 'Cross-domain search failed: Search service unavailable',
  });
});

test('should handle empty search results', async (t) => {
  const mockService = createMockService();
  (mockService as any).search = async () =>
    createMockSearchResponse({
      results: [],
      total: 0,
    });

  const engine = new CrossDomainSearchEngine(mockService);
  const options: CrossDomainSearchOptions = {
    query: 'test query',
    limit: 10,
    includeAnalytics: true,
  };

  const response = await engine.search(options);

  t.is(response.results.length, 0);
  t.is(response.total, 0);
  t.truthy(response.analytics);
  t.is(response.analytics!.sourcesSearched.length, 0);
  t.is(response.analytics!.typesFound.length, 0);
});

test('should respect result limits', async (t) => {
  const mockContentList = createMockContentList(20);

  const mockService = createMockService();
  (mockService as any).search = async () =>
    createMockSearchResponse({
      results: mockContentList.map((content) => ({
        content,
        score: Math.random(),
        highlights: [],
      })),
      total: 20,
    });

  const engine = new CrossDomainSearchEngine(mockService);
  const options: CrossDomainSearchOptions = {
    query: 'test query',
    limit: 5, // Request only 5 results
  };

  const response = await engine.search(options);

  t.is(response.results.length, 5);
  t.is(response.total, 20); // Total should reflect all available results
});

test('should calculate recency scores correctly', async (t) => {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  const oneDayAgo = now - 86400000;

  const recentContent = createMockContent({ timestamp: oneHourAgo });
  const oldContent = createMockContent({ timestamp: oneDayAgo });

  const mockService = createMockService();
  (mockService as any).search = async () =>
    createMockSearchResponse({
      results: [
        { content: recentContent, score: 0.7, highlights: [] },
        { content: oldContent, score: 0.7, highlights: [] },
      ],
      total: 2,
    });

  const engine = new CrossDomainSearchEngine(mockService);
  const options: CrossDomainSearchOptions = {
    query: 'test query',
    limit: 10,
    recencyDecay: 24, // 24 hours decay
  };

  const response = await engine.search(options);
  const results = response.results as EnhancedSearchResult[];

  // Recent content should have higher recency score
  t.true(results[0].recencyScore > results[1].recencyScore);
  t.true(results[0].recencyScore >= 0 && results[0].recencyScore <= 1);
  t.true(results[1].recencyScore >= 0 && results[1].recencyScore <= 1);
});

test('should handle boundary values in options', async (t) => {
  const mockService = createMockService();
  (mockService as any).search = async () => createMockSearchResponse();
  (mockService as any).getContext = async () => [];

  const engine = new CrossDomainSearchEngine(mockService);

  const boundaryOptions: CrossDomainSearchOptions = {
    query: 'test',
    limit: 1,
    semanticThreshold: 0,
    keywordWeight: 0,
    recencyDecay: 0.1,
    maxResultsPerSource: 1,
    contextLimit: 1,
  };

  await t.notThrowsAsync(() => engine.search(boundaryOptions));
});

test('should expand queries with related terms', async (t) => {
  const mockService = createMockService();
  (mockService as any).search = async () => createMockSearchResponse();
  (mockService as any).search.calledOnce = false;

  const engine = new CrossDomainSearchEngine(mockService);

  await engine.intelligentSearch('indexing context');

  t.true((mockService as any).search.calledOnce);
  const searchCall = (mockService as any).search.getCall(0);
  const searchOptions = searchCall.args[0] as CrossDomainSearchOptions;

  // Should include original query
  t.true(searchOptions.query.includes('indexing context'));
});

test('should measure search performance', async (t) => {
  const mockService = createMockService();
  (mockService as any).search = async () => createMockSearchResponse();

  const engine = new CrossDomainSearchEngine(mockService);
  const options: CrossDomainSearchOptions = {
    query: 'test query',
    limit: 10,
  };

  const { result, duration } = await measureTime(() => engine.search(options));

  t.truthy(result);
  t.true(duration >= 0);
  t.true(typeof result.took === 'number');
  t.true(result.took <= duration); // Response time should be <= total time
});
