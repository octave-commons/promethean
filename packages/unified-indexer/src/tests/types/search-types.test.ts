/**
 * Search Types Tests
 *
 * Tests for CrossDomainSearchOptions, EnhancedSearchResult, and CrossDomainSearchResponse
 */

import test from 'ava';

import {
  validateCrossDomainSearchOptions,
  validateEnhancedSearchResult,
  validateCrossDomainSearchResponse,
  isCrossDomainSearchOptions,
  isEnhancedSearchResult,
  isCrossDomainSearchResponse,
} from '../utils/type-validators.js';
import { createMockCrossDomainSearchOptions, createMockContent } from '../utils/mock-factories.js';
import type {
  CrossDomainSearchOptions,
  EnhancedSearchResult,
  CrossDomainSearchResponse,
} from '../../types/search.js';
import type { SearchResult, ContentSource, ContentType } from '@promethean-os/persistence';

test('should validate minimal cross-domain search options', (t) => {
  const options = createMockCrossDomainSearchOptions();
  const result = validateCrossDomainSearchOptions(options);

  t.true(result.valid);
  t.deepEqual(result.errors, []);
  t.true(Array.isArray(result.warnings));
});

test('should reject invalid cross-domain search options', (t) => {
  const invalidOptions = {
    query: '', // Empty query
    limit: -1, // Invalid limit
    contextLimit: 0, // Invalid context limit
    recencyDecay: -1, // Invalid recency decay
    semanticThreshold: 2, // Invalid threshold (> 1)
    keywordWeight: 2, // Invalid weight (> 1)
    maxResultsPerSource: 0, // Invalid max results
  };

  const result = validateCrossDomainSearchOptions(invalidOptions);

  t.false(result.valid);
  t.true(result.errors.length > 0);
  t.true(result.errors.some((error) => error.includes('query must be a non-empty string')));
  t.true(result.errors.some((error) => error.includes('limit must be a positive number')));
});

test('should validate cross-domain search options with weights', (t) => {
  const options: CrossDomainSearchOptions = {
    query: 'test query',
    limit: 10,
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
    semanticThreshold: 0.5,
    keywordWeight: 0.3,
    recencyDecay: 24,
    timeBoost: true,
    hybridSearch: true,
    includeContext: true,
    contextLimit: 10,
    formatForLLM: true,
    deduplicate: true,
    groupBySource: true,
    maxResultsPerSource: 5,
    includeAnalytics: true,
    explainScores: true,
  };

  const result = validateCrossDomainSearchOptions(options);

  t.true(result.valid);
  t.deepEqual(result.errors, []);
  t.true(Array.isArray(result.warnings));
});

test('should validate cross-domain search options with invalid weights', (t) => {
  const options = createMockCrossDomainSearchOptions();
  options.sourceWeights = {
    filesystem: -1, // Invalid negative weight
    invalidSource: 1.0, // Unknown source
  } as any;
  options.typeWeights = {
    file: -1, // Invalid negative weight
    invalidType: 1.0, // Unknown type
  } as any;

  const result = validateCrossDomainSearchOptions(options);

  t.false(result.valid);
  t.true(result.errors.some((error) => error.includes('must be a non-negative number')));
  t.true(result.warnings.some((warning) => warning.includes('Unknown source')));
  t.true(result.warnings.some((warning) => warning.includes('Unknown type')));
});

test('should validate enhanced search result', (t) => {
  const baseResult: SearchResult = {
    content: createMockContent(),
    score: 0.85,
    highlights: ['test'],
  };

  const enhancedResult: EnhancedSearchResult = {
    ...baseResult,
    sourceType: 'filesystem' as ContentSource,
    contentType: 'file' as ContentType,
    age: 3600000, // 1 hour in ms
    recencyScore: 0.5,
    context: [],
    contextRelevance: 0.7,
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
  };

  const result = validateEnhancedSearchResult(enhancedResult);

  t.true(result.valid);
  t.deepEqual(result.errors, []);
  t.true(Array.isArray(result.warnings));
});

test('should reject invalid enhanced search result', (t) => {
  const invalidResult = {
    content: 'not-an-object', // Should be IndexableContent
    score: 'not-a-number',
    sourceType: 'invalid-source',
    contentType: 'invalid-type',
    age: -1, // Invalid negative age
    recencyScore: 2, // Invalid > 1
    context: 'not-an-array',
    contextRelevance: -1, // Invalid < 0
    scoreBreakdown: 'not-an-object',
  };

  const result = validateEnhancedSearchResult(invalidResult);

  t.false(result.valid);
  t.true(result.errors.length > 0);
  t.true(result.errors.some((error) => error.includes('score must be a number')));
  t.true(result.errors.some((error) => error.includes('age must be a non-negative number')));
  t.true(result.errors.some((error) => error.includes('recencyScore must be between 0 and 1')));
});

test('should validate cross-domain search response', (t) => {
  const response: CrossDomainSearchResponse = {
    results: [],
    total: 0,
    took: 25,
    query: createMockCrossDomainSearchOptions(),
    analytics: {
      sourcesSearched: ['filesystem', 'discord'] as ContentSource[],
      typesFound: ['file', 'message'] as ContentType[],
      averageScore: 0.75,
      scoreDistribution: {
        min: 0.1,
        max: 0.95,
        median: 0.8,
        mean: 0.75,
        p95: 0.9,
      },
      temporalRange: {
        oldest: Date.now() - 86400000, // 1 day ago
        newest: Date.now() - 3600000, // 1 hour ago
        span: 82800000, // ~23 hours
      },
    },
    context: [],
  };

  const result = validateCrossDomainSearchResponse(response);

  t.true(result.valid);
  t.deepEqual(result.errors, []);
  t.true(Array.isArray(result.warnings));
});

test('should reject invalid cross-domain search response', (t) => {
  const invalidResponse = {
    results: 'not-an-array',
    total: -1, // Invalid negative total
    took: -1, // Invalid negative took
    query: 'not-an-object', // Should be CrossDomainSearchOptions
    analytics: {
      sourcesSearched: 'not-an-array',
      typesFound: 'not-an-array',
      averageScore: 'not-a-number',
      scoreDistribution: 'not-an-object',
      temporalRange: {
        oldest: 'not-a-number',
        newest: 'not-a-number',
        span: 'not-a-number',
      },
    },
    context: 'not-an-array',
  };

  const result = validateCrossDomainSearchResponse(invalidResponse);

  t.false(result.valid);
  t.true(result.errors.length > 0);
  t.true(result.errors.some((error) => error.includes('results must be an array')));
  t.true(result.errors.some((error) => error.includes('total must be a non-negative number')));
  t.true(result.errors.some((error) => error.includes('took must be a non-negative number')));
});

test('should type guard functions work correctly', (t) => {
  const validOptions = createMockCrossDomainSearchOptions();
  const invalidOptions = { invalid: 'options' };

  t.true(isCrossDomainSearchOptions(validOptions));
  t.false(isCrossDomainSearchOptions(invalidOptions));

  const baseResult: SearchResult = {
    content: createMockContent(),
    score: 0.85,
    highlights: ['test'],
  };

  const validEnhancedResult: EnhancedSearchResult = {
    ...baseResult,
    sourceType: 'filesystem' as ContentSource,
    contentType: 'file' as ContentType,
    age: 3600000,
    recencyScore: 0.5,
  };

  const invalidEnhancedResult = { invalid: 'result' };

  t.true(isEnhancedSearchResult(validEnhancedResult));
  t.false(isEnhancedSearchResult(invalidEnhancedResult));

  const validResponse: CrossDomainSearchResponse = {
    results: [],
    total: 0,
    took: 25,
    query: validOptions,
  };

  const invalidResponse = { invalid: 'response' };

  t.true(isCrossDomainSearchResponse(validResponse));
  t.false(isCrossDomainSearchResponse(invalidResponse));
});

test('should handle edge cases in search options validation', (t) => {
  // Test with null/undefined values
  const nullOptions = null;
  const undefinedOptions = undefined;
  const emptyOptions = {};

  const nullResult = validateCrossDomainSearchOptions(nullOptions);
  const undefinedResult = validateCrossDomainSearchOptions(undefinedOptions);
  const emptyResult = validateCrossDomainSearchOptions(emptyOptions);

  t.false(nullResult.valid);
  t.false(undefinedResult.valid);
  t.false(emptyResult.valid);

  t.true(nullResult.errors.length > 0);
  t.true(undefinedResult.errors.length > 0);
  t.true(emptyResult.errors.length > 0);
});

test('should validate search options with boundary values', (t) => {
  const boundaryOptions: CrossDomainSearchOptions = {
    query: 'test',
    limit: 1, // Minimum valid
    semanticThreshold: 0, // Minimum valid
    keywordWeight: 0, // Minimum valid
    recencyDecay: 0.1, // Minimum valid positive
    maxResultsPerSource: 1, // Minimum valid
  };

  const result = validateCrossDomainSearchOptions(boundaryOptions);

  t.true(result.valid);
  t.deepEqual(result.errors, []);
});

test('should validate search options with maximum boundary values', (t) => {
  const maxBoundaryOptions: CrossDomainSearchOptions = {
    query: 'test',
    semanticThreshold: 1, // Maximum valid
    keywordWeight: 1, // Maximum valid
    recencyDecay: 8760, // 1 year in hours
  };

  const result = validateCrossDomainSearchOptions(maxBoundaryOptions);

  t.true(result.valid);
  t.deepEqual(result.errors, []);
});

test('should reject search options with out-of-bounds values', (t) => {
  const outOfBoundsOptions = {
    query: 'test',
    semanticThreshold: -0.1, // Below minimum
    keywordWeight: 1.1, // Above maximum
    recencyDecay: 0, // Zero not allowed
  };

  const result = validateCrossDomainSearchOptions(outOfBoundsOptions);

  t.false(result.valid);
  t.true(
    result.errors.some((error) => error.includes('semanticThreshold must be between 0 and 1')),
  );
  t.true(result.errors.some((error) => error.includes('keywordWeight must be between 0 and 1')));
  t.true(result.errors.some((error) => error.includes('recencyDecay must be a positive number')));
});

test('should validate enhanced result with optional properties', (t) => {
  const minimalEnhancedResult: EnhancedSearchResult = {
    content: createMockContent(),
    score: 0.85,
    sourceType: 'filesystem' as ContentSource,
    contentType: 'file' as ContentType,
    age: 3600000,
    recencyScore: 0.5,
    // Optional properties omitted
  };

  const result = validateEnhancedSearchResult(minimalEnhancedResult);

  t.true(result.valid);
  t.deepEqual(result.errors, []);
});

test('should validate response without optional analytics', (t) => {
  const minimalResponse: CrossDomainSearchResponse = {
    results: [],
    total: 0,
    took: 25,
    query: createMockCrossDomainSearchOptions(),
    // Optional analytics and context omitted
  };

  const result = validateCrossDomainSearchResponse(minimalResponse);

  t.true(result.valid);
  t.deepEqual(result.errors, []);
});
