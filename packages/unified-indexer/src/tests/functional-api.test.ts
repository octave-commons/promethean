/**
 * Basic Tests for Cross-Domain Search Functional API
 *
 * Simple test suite to verify modular search functionality works
 */

import test from 'ava';

// Import our new functional API
import {
  createCrossDomainSearchEngine,
  search,
  intelligentSearch,
  getContextualSearch,
  type CrossDomainSearchEngineState,
} from '../cross-domain-search-functional.js';

import type { CrossDomainSearchOptions } from '../types/search.js';

// Mock indexer service state for testing
const createMockIndexerService = (): any => ({
  unifiedClient: {
    search: async () => ({
      results: [
        {
          content: {
            id: 'test-1',
            content: 'Test content about search functionality',
            type: 'file' as const,
            source: 'filesystem' as const,
            timestamp: Date.now(),
            metadata: {
              type: 'file' as const,
              source: 'filesystem' as const,
              path: '/test/file.txt',
            },
          },
          score: 0.9,
        },
      ],
      total: 1,
      took: 10,
      query: { query: 'test' },
    }),
  },
});

test('should export cross-domain search functions', (t) => {
  t.is(typeof createCrossDomainSearchEngine, 'function');
  t.is(typeof search, 'function');
  t.is(typeof intelligentSearch, 'function');
  t.is(typeof getContextualSearch, 'function');
});

test('should create cross-domain search engine', (t) => {
  const mockService = createMockIndexerService();
  const engine = createCrossDomainSearchEngine(mockService, {
    semantic: true,
    limit: 10,
  });

  t.truthy(engine);
  t.truthy(engine.indexerService);
  t.truthy(engine.defaultOptions);
});

test('should have correct engine state type', (t) => {
  const mockService = createMockIndexerService();
  const engine = createCrossDomainSearchEngine(mockService);

  // Type assertion to ensure our types are working
  const typedEngine: CrossDomainSearchEngineState = engine;
  t.truthy(typedEngine);
  t.truthy(typedEngine.indexerService);
  t.truthy(typedEngine.defaultOptions);
});

test('should perform basic search', async (t) => {
  const mockService = createMockIndexerService();
  const engine = createCrossDomainSearchEngine(mockService);

  const options: CrossDomainSearchOptions = {
    query: 'test search',
    limit: 5,
    semantic: true,
  };

  const result = await search(engine, options);

  t.truthy(result);
  t.truthy(result.results);
  t.is(result.total, 1);
  t.true(result.took > 0);
  t.deepEqual(result.query, options);
});

test('should perform intelligent search', async (t) => {
  const mockService = createMockIndexerService();
  const engine = createCrossDomainSearchEngine(mockService);

  const result = await intelligentSearch(engine, 'intelligent test query');

  t.truthy(result);
  t.truthy(result.results);
  t.true(Array.isArray(result.results));
});

test('should perform contextual search', async (t) => {
  const mockService = createMockIndexerService();
  const engine = createCrossDomainSearchEngine(mockService);

  const result = await getContextualSearch(engine, ['context', 'query']);

  t.truthy(result);
  t.truthy(result.searchResults);
  t.true(Array.isArray(result.context));
});

test('should handle search options correctly', async (t) => {
  const mockService = createMockIndexerService();
  const engine = createCrossDomainSearchEngine(mockService);

  const options: CrossDomainSearchOptions = {
    query: 'advanced test',
    limit: 20,
    semantic: true,
    includeContext: true,
    includeAnalytics: true,
    sourceWeights: {
      filesystem: 1.5,
      discord: 1.0,
      opencode: 1.0,
      agent: 1.0,
      user: 1.0,
      system: 1.0,
      external: 1.0,
      kanban: 1.0,
    },
    typeWeights: {
      file: 1.2,
      message: 1.0,
      event: 1.0,
      session: 1.0,
      attachment: 1.0,
      thought: 1.0,
      document: 1.0,
      task: 1.0,
      board: 1.0,
    },
  };

  const result = await search(engine, options);

  t.truthy(result);
  t.is(result.results.length, 1);
  t.true(result.took >= 0);
});
