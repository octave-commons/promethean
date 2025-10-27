/**
 * Simple Search Types Validation Tests
 *
 * Basic tests to validate that our mock objects properly implement
 * the unified indexing search types.
 */

import test from 'ava';

import type { SearchQuery, SearchResult, SearchResponse } from '../../unified-indexing-api.js';

import {
    createMockSearchQuery,
    createMockSearchResult,
    createMockSearchResponse,
    isValidSearchQuery,
    isValidSearchResult,
    isValidSearchResponse,
} from '../utils/simple-mocks.js';

test('createMockSearchQuery creates valid SearchQuery', (t) => {
    const query = createMockSearchQuery();

    t.true(typeof query.query === 'string');
    t.true(typeof query.limit === 'number');
    t.true(typeof query.offset === 'number');
    t.true(typeof query.fuzzy === 'boolean');
    t.true(typeof query.semantic === 'boolean');
    t.true(typeof query.includeContent === 'boolean');

    t.true(isValidSearchQuery(query));
});

test('createMockSearchQuery with overrides', (t) => {
    const overrides = {
        query: 'custom search query',
        limit: 50,
        semantic: false,
        fuzzy: true,
    };

    const query = createMockSearchQuery(overrides);

    t.is(query.query, 'custom search query');
    t.is(query.limit, 50);
    t.is(query.semantic, false);
    t.is(query.fuzzy, true);

    t.true(isValidSearchQuery(query));
});

test('createMockSearchResult creates valid SearchResult', (t) => {
    const result = createMockSearchResult();

    t.true(typeof result.content === 'object');
    t.true(typeof result.score === 'number');
    t.true(Array.isArray(result.highlights));

    t.true(isValidSearchResult(result));
});

test('createMockSearchResult with overrides', (t) => {
    const overrides = {
        score: 0.75,
        highlights: ['highlight 1', 'highlight 2'],
    };

    const result = createMockSearchResult(overrides);

    t.is(result.score, 0.75);
    t.deepEqual(result.highlights, ['highlight 1', 'highlight 2']);

    t.true(isValidSearchResult(result));
});

test('createMockSearchResponse creates valid SearchResponse', (t) => {
    const response = createMockSearchResponse();

    t.true(Array.isArray(response.results));
    t.true(typeof response.total === 'number');
    t.true(typeof response.took === 'number');
    t.true(typeof response.query === 'object');

    t.true(isValidSearchResponse(response));
});

test('createMockSearchResponse with overrides', (t) => {
    const overrides = {
        total: 25,
        took: 300,
    };

    const response = createMockSearchResponse(overrides);

    t.is(response.total, 25);
    t.is(response.took, 300);
    t.is(response.results.length, 3); // Default mock creates 3 results

    t.true(isValidSearchResponse(response));
});

test('SearchQuery type structure validation', (t) => {
    const query = createMockSearchQuery({
        query: 'test query',
        limit: 20,
        offset: 10,
        fuzzy: true,
        semantic: false,
        includeContent: true,
    });

    t.is(query.query, 'test query');
    t.is(query.limit, 20);
    t.is(query.offset, 10);
    t.true(query.fuzzy);
    t.false(query.semantic);
    t.true(query.includeContent);
});

test('SearchResult type structure validation', (t) => {
    const mockContent = {
        id: 'test-content-id',
        content: 'Test content',
        type: 'file' as const,
        source: 'filesystem' as const,
        timestamp: Date.now(),
        metadata: {
            fileName: 'test.txt',
            filePath: '/test/test.txt',
        },
    };

    const result = createMockSearchResult({
        content: mockContent,
        score: 0.85,
        highlights: ['test highlight'],
    });

    t.is(result.content.id, 'test-content-id');
    t.is(result.content.content, 'Test content');
    t.is(result.content.type, 'file');
    t.is(result.content.source, 'filesystem');
    t.is(result.score, 0.85);
    t.deepEqual(result.highlights, ['test highlight']);
});

test('SearchResponse type structure validation', (t) => {
    const mockQuery = createMockSearchQuery({
        query: 'validation test',
        limit: 5,
    });

    const response = createMockSearchResponse({
        query: mockQuery,
        total: 10,
        took: 125,
    });

    t.is(response.query.query, 'validation test');
    t.is(response.query.limit, 5);
    t.is(response.total, 10);
    t.is(response.took, 125);
    t.true(response.results.length > 0);

    // Validate each result in the response
    for (const result of response.results) {
        t.true(isValidSearchResult(result));
    }
});

test('Invalid SearchQuery detection', (t) => {
    const invalidQueries = [
        null,
        undefined,
        {},
        { query: 123 }, // query should be string
        { limit: 'not-a-number' }, // limit should be number
        { fuzzy: 'not-a-boolean' }, // fuzzy should be boolean
        { semantic: 1 }, // semantic should be boolean
        { includeContent: 'yes' }, // includeContent should be boolean
    ];

    for (const invalid of invalidQueries) {
        t.false(isValidSearchQuery(invalid), `Should detect invalid query: ${JSON.stringify(invalid)}`);
    }
});

test('Invalid SearchResult detection', (t) => {
    const invalidResults = [
        null,
        undefined,
        {},
        { content: 'not-an-object' }, // content should be object
        { score: 'not-a-number' }, // score should be number
        { highlights: 'not-an-array' }, // highlights should be array
        { content: {}, score: 0.5, highlights: [1, 2, 3] }, // highlights should contain strings
    ];

    for (const invalid of invalidResults) {
        t.false(isValidSearchResult(invalid), `Should detect invalid result: ${JSON.stringify(invalid)}`);
    }
});

test('Invalid SearchResponse detection', (t) => {
    const invalidResponses = [
        null,
        undefined,
        {},
        { results: 'not-an-array' }, // results should be array
        { total: 'not-a-number' }, // total should be number
        { took: 'not-a-number' }, // took should be number
        { query: 'not-an-object' }, // query should be object
        {
            results: [],
            total: 0,
            took: 100,
            query: {},
        },
        {
            results: [{ content: {}, score: 0.5, highlights: [] }],
            total: 1,
            took: 100,
            query: { query: 'test' },
        },
    ];

    for (const invalid of invalidResponses) {
        t.false(isValidSearchResponse(invalid), `Should detect invalid response: ${JSON.stringify(invalid)}`);
    }
});

test('Edge cases for SearchQuery', (t) => {
    // Empty query should be valid
    const emptyQuery = createMockSearchQuery({ query: '' });
    t.true(isValidSearchQuery(emptyQuery));

    // Zero limits should be valid
    const zeroLimitQuery = createMockSearchQuery({ limit: 0 });
    t.true(isValidSearchQuery(zeroLimitQuery));

    // Large limits should be valid
    const largeLimitQuery = createMockSearchQuery({ limit: 10000 });
    t.true(isValidSearchQuery(largeLimitQuery));

    // Negative offset should be valid (though unusual)
    const negativeOffsetQuery = createMockSearchQuery({ offset: -1 });
    t.true(isValidSearchQuery(negativeOffsetQuery));
});

test('Edge cases for SearchResult', (t) => {
    // Zero score should be valid
    const zeroScoreResult = createMockSearchResult({ score: 0 });
    t.true(isValidSearchResult(zeroScoreResult));

    // Score of 1 should be valid
    const maxScoreResult = createMockSearchResult({ score: 1 });
    t.true(isValidSearchResult(maxScoreResult));

    // Empty highlights array should be valid
    const emptyHighlightsResult = createMockSearchResult({ highlights: [] });
    t.true(isValidSearchResult(emptyHighlightsResult));

    // Null highlights should be valid
    const nullHighlightsResult = createMockSearchResult({ highlights: undefined });
    t.true(isValidSearchResult(nullHighlightsResult));
});

test('Edge cases for SearchResponse', (t) => {
    // Empty results should be valid
    const emptyResponse = createMockSearchResponse({
        results: [],
        total: 0,
    });
    t.true(isValidSearchResponse(emptyResponse));

    // Zero execution time should be valid
    const zeroTimeResponse = createMockSearchResponse({ took: 0 });
    t.true(isValidSearchResponse(zeroTimeResponse));

    // Large execution time should be valid
    const largeTimeResponse = createMockSearchResponse({ took: 60000 });
    t.true(isValidSearchResponse(largeTimeResponse));
});
