/**
 * Cross-Domain Search Engine Tests
 *
 * Comprehensive test suite for CrossDomainSearchEngine class,
 * covering search functionality, result processing, scoring,
 * and advanced search options.
 */

import test from 'ava';
import sinon from 'sinon';
import { CrossDomainSearchEngine } from '../cross-domain-search.js';
import type { CrossDomainSearchOptions, EnhancedSearchResult, CrossDomainSearchResponse } from '../cross-domain-search.js';
import { UnifiedIndexerService } from '../unified-indexer-service.js';
import {
    MockUnifiedIndexingClient,
    createTestConfig,
    createTestSearchResults,
    delay,
    TestDataFactory,
} from './test-utils.js';

// Mock the UnifiedIndexerService
const mockUnifiedIndexerService = {
    getContext: sinon.stub(),
    getStats: sinon.stub(),
    search: sinon.stub(),
} as any;

test.beforeEach(() => {
    // Reset all stubs
    mockUnifiedIndexerService.getContext.reset();
    mockUnifiedIndexerService.getStats.reset();
    mockUnifiedIndexerService.search.reset();

    // Setup default return values
    mockUnifiedIndexerService.getContext.resolves({
        messages: [],
        totalTokens: 0,
    });
    mockUnifiedIndexerService.getStats.resolves({
        status: 'running',
        files: { totalFiles: 10 },
        discord: { totalMessages: 5 },
        opencode: { totalSessions: 3 },
        kanban: { totalTasks: 8 },
        lastSync: new Date(),
    });
    mockUnifiedIndexerService.search.resolves(createTestSearchResults());
});

test('should create search engine with default options', (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);

    t.truthy(searchEngine);
    t.is(typeof searchEngine.search, 'function');
});

test('should create search engine with custom options', (t) => {
    const customOptions = {
        maxResults: 50,
        minScore: 0.5,
        timeBoost: true,
        semantic: true,
    };
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService, customOptions);

    t.truthy(searchEngine);
});

test('should perform basic search', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    const query = {
        query: 'TypeScript',
        limit: 10,
    };

    const response = await searchEngine.search(query);

    t.truthy(response);
    t.is(response.query, query.query);
    t.true(response.results.length > 0);
    t.is(response.total, response.results.length);
    t.truthy(response.took);
    t.is(response.status, 'success');
});

test('should perform semantic search', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    const query = {
        query: 'context management',
        semantic: true,
        limit: 10,
    };

    const response = await searchEngine.search(query);

    t.is(response.query, query.query);
    t.true(response.results.length > 0);
    t.true(response.results.every(result => result.score >= 0));
});

test('should perform hybrid search', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    const query = {
        query: 'unified indexing',
        semantic: true,
        keyword: true,
        limit: 10,
    };

    const response = await searchEngine.search(query);

    t.is(response.query, query.query);
    t.true(response.results.length > 0);
});

test('should filter by source', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    const query = {
        query: 'test',
        source: ['file'],
        limit: 10,
    };

    const response = await searchEngine.search(query);

    t.true(response.results.every(result => 
        result.metadata.source === 'file'
    ));
});

test('should filter by content type', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    const query = {
        query: 'test',
        type: ['file'],
        limit: 10,
    };

    const response = await searchEngine.search(query);

    t.true(response.results.every(result => 
        result.metadata.type === 'file'
    ));
});

test('should apply time boosting', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService, {
        timeBoost: true,
        timeDecay: 0.1,
    });

    // Create test results with different timestamps
    const oldResult = TestDataFactory.createFileContent('/old/file.ts', 'old content');
    oldResult.metadata.timestamp = new Date('2020-01-01');
    oldResult.score = 0.8;

    const newResult = TestDataFactory.createFileContent('/new/file.ts', 'new content');
    newResult.metadata.timestamp = new Date();
    newResult.score = 0.7;

    mockUnifiedIndexerService.search.resolves([oldResult, newResult]);

    const query = {
        query: 'test',
        timeBoost: true,
        limit: 10,
    };

    const response = await searchEngine.search(query);

    // Newer content should be boosted
    const newResultIndex = response.results.findIndex(r => r.metadata.path === '/new/file.ts');
    const oldResultIndex = response.results.findIndex(r => r.metadata.path === '/old/file.ts');
    
    t.true(newResultIndex < oldResultIndex);
});

test('should apply source weighting', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService, {
        sourceWeights: {
            file: 1.5,
            discord: 1.0,
            kanban: 1.2,
        },
    });

    const query = {
        query: 'test',
        limit: 10,
    };

    const response = await searchEngine.search(query);

    // Results should have source-weighted scores
    response.results.forEach(result => {
        const source = result.metadata.source;
        if (source === 'file') {
            t.true(result.enhancedScore > result.score);
        }
    });
});

test('should include context in results', async (t) => {
    const mockContext = {
        messages: [
            { role: 'user', content: 'Previous context message' },
            { role: 'assistant', content: 'Previous assistant response' },
        ],
        totalTokens: 50,
    };
    mockUnifiedIndexerService.getContext.resolves(mockContext);

    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    const query = {
        query: 'test',
        includeContext: true,
        limit: 10,
    };

    const response = await searchEngine.search(query);

    t.truthy(response.context);
    t.is(response.context.messages.length, 2);
    t.is(response.context.totalTokens, 50);
});

test('should provide score explanations', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    const query = {
        query: 'test',
        explainScores: true,
        limit: 10,
    };

    const response = await searchEngine.search(query);

    response.results.forEach(result => {
        t.truthy(result.scoreBreakdown);
        t.truthy(result.scoreBreakdown.baseScore);
        t.truthy(result.scoreBreakdown.finalScore);
    });
});

test('should provide search analytics', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    const query = {
        query: 'test',
        includeAnalytics: true,
        limit: 10,
    };

    const response = await searchEngine.search(query);

    t.truthy(response.analytics);
    t.truthy(response.analytics.sources);
    t.truthy(response.analytics.types);
    t.truthy(response.analytics.scoreDistribution);
    t.truthy(response.analytics.timeDistribution);
});

test('should handle empty results', async (t) => {
    mockUnifiedIndexerService.search.resolves([]);

    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    const query = {
        query: 'nonexistent',
        limit: 10,
    };

    const response = await searchEngine.search(query);

    t.is(response.results.length, 0);
    t.is(response.total, 0);
    t.is(response.status, 'success');
});

test('should handle search errors', async (t) => {
    mockUnifiedIndexerService.search.rejects(new Error('Search service unavailable'));

    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    const query = {
        query: 'test',
        limit: 10,
    };

    const response = await searchEngine.search(query);

    t.is(response.status, 'error');
    t.truthy(response.error);
    t.is(response.results.length, 0);
});

test('should limit results correctly', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    const query = {
        query: 'test',
        limit: 2,
    };

    const response = await searchEngine.search(query);

    t.true(response.results.length <= 2);
});

test('should apply minimum score filter', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService, {
        minScore: 0.8,
    });

    const query = {
        query: 'test',
        limit: 10,
    };

    const response = await searchEngine.search(query);

    response.results.forEach(result => {
        t.true(result.score >= 0.8);
    });
});

test('should deduplicate results', async (t) => {
    // Create duplicate results
    const duplicateResults = [
        createTestSearchResults()[0],
        createTestSearchResults()[0], // Same ID
        createTestSearchResults()[1],
    ];
    mockUnifiedIndexerService.search.resolves(duplicateResults);

    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    const query = {
        query: 'test',
        limit: 10,
    };

    const response = await searchEngine.search(query);

    // Should have removed duplicates
    const uniqueIds = new Set(response.results.map(r => r.id));
    t.is(uniqueIds.size, response.results.length);
    t.true(response.results.length < duplicateResults.length);
});

test('should group related results', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService, {
        groupResults: true,
    });

    const query = {
        query: 'test',
        limit: 10,
    };

    const response = await searchEngine.search(query);

    // Results should be grouped by source or type
    if (response.results.length > 1) {
        const firstSource = response.results[0].metadata.source;
        const groupedResults = response.results.filter(r => 
            r.metadata.source === firstSource
        );
        t.true(groupedResults.length > 0);
    }
});

test('should handle complex queries', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    const complexQuery = {
        query: 'TypeScript contextStore implementation',
        semantic: true,
        keyword: true,
        source: ['file', 'discord'],
        type: ['file', 'message'],
        timeBoost: true,
        includeContext: true,
        explainScores: true,
        includeAnalytics: true,
        limit: 20,
    };

    const response = await searchEngine.search(complexQuery);

    t.is(response.query, complexQuery.query);
    t.true(response.results.length >= 0);
    t.truthy(response.took);
    t.is(response.status, 'success');
});

test('should handle concurrent searches', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    
    const queries = [
        { query: 'TypeScript', limit: 10 },
        { query: 'contextStore', limit: 10 },
        { query: 'unified indexing', limit: 10 },
    ];

    const responses = await Promise.all(
        queries.map(query => searchEngine.search(query))
    );

    responses.forEach(response => {
        t.is(response.status, 'success');
        t.truthy(response.results);
        t.truthy(response.took);
    });
});

test('should validate search options', async (t) => {
    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    
    const invalidQuery = {
        query: '', // Empty query
        limit: -1, // Invalid limit
    };

    const response = await searchEngine.search(invalidQuery);

    t.is(response.status, 'error');
    t.truthy(response.error);
});

test('should handle timeout', async (t) => {
    // Mock a slow search
    mockUnifiedIndexerService.search.callsFake(() => 
        new Promise(resolve => setTimeout(() => resolve(createTestSearchResults()), 2000))
    );

    const searchEngine = new CrossDomainSearchEngine(mockUnifiedIndexerService);
    const query = {
        query: 'test',
        limit: 10,
        timeout: 1000, // 1 second timeout
    };

    const startTime = Date.now();
    const response = await searchEngine.search(query);
    const endTime = Date.now();

    t.is(response.status, 'timeout');
    t.true(endTime - startTime < 1500); // Should timeout before 2 seconds
});