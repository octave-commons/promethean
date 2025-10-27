/**
 * Unit Tests for CrossDomainSearchEngine
 *
 * Tests for advanced cross-domain search functionality including
 * result enhancement, analytics, and intelligent search
 */

import test from 'ava';

import { CrossDomainSearchEngine, createCrossDomainSearchEngine } from '../cross-domain-search.js';
import { UnifiedIndexerService } from '../unified-indexer-service.js';
import type { CrossDomainSearchOptions, EnhancedSearchResult } from '../types/search.js';

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

// Create a mock service that properly implements the interface
const createMockService = (overrides: Partial<UnifiedIndexerService> = {}) => {
  const service = {
    search: async (_query: MockSearchQuery) => createMockSearchResponse(),
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
      opencode: 1.0,
      kanban: 1.0,
      agent: 1.0,
      user: 1.0,
      system: 1.0,
      external: 1.0,
    },
    typeWeights: {
      file: 1.2,
      message: 1.0,
      document: 1.0,
      task: 1.0,
      event: 1.0,
      session: 1.0,
      attachment: 1.0,
      thought: 1.0,
      board: 1.0,
    },
  };

  const response = await engine.search(options);

  t.is(response.results.length, 2);
  // Filesystem file should have higher score due to weights
  if (response.results[0] && response.results[1]) {
    t.true(response.results[0].score > response.results[1].score);
  }
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
  if (response.analytics) {
    t.is(response.analytics.sourcesSearched.length, 0);
    t.is(response.analytics.typesFound.length, 0);
  }
});
