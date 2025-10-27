/**
 * Simple Search Types Tests
 *
 * Basic tests for search types that match actual type definitions
 */

import test from 'ava';

import type {
  CrossDomainSearchOptions,
  EnhancedSearchResult,
  CrossDomainSearchResponse,
} from '../../types/search.js';

import {
  createMockCrossDomainSearchOptions,
  createMockEnhancedSearchResult,
  createMockCrossDomainSearchResponse,
} from '../utils/simple-mocks.js';

test('should create mock cross-domain search options', (t) => {
  const options = createMockCrossDomainSearchOptions();

  t.is(typeof options.query, 'string');
  t.true(Array.isArray(options.sources));
  t.true(Array.isArray(options.types));
  t.is(typeof options.limit, 'number');
  t.is(typeof options.offset, 'number');
  t.is(typeof options.filters, 'object');
  t.is(typeof options.includeContext, 'boolean');
  t.is(typeof options.includeAnalytics, 'boolean');
});

test('should create mock enhanced search result', (t) => {
  const result = createMockEnhancedSearchResult();

  t.is(typeof result.id, 'string');
  t.is(typeof result.content, 'string');
  t.is(typeof result.metadata, 'object');
  t.is(typeof result.score, 'number');
  t.is(typeof result.source, 'string');
  t.is(typeof result.type, 'string');
  t.is(typeof result.timestamp, 'number');
});

test('should create mock cross-domain search response', (t) => {
  const response = createMockCrossDomainSearchResponse();

  t.true(Array.isArray(response.results));
  t.is(typeof response.total, 'number');
  t.is(typeof response.query, 'string');
  t.true(Array.isArray(response.sources));
  t.true(Array.isArray(response.types));
  t.is(typeof response.limit, 'number');
  t.is(typeof response.offset, 'number');
  t.is(typeof response.hasMore, 'boolean');
  t.is(typeof response.executionTime, 'number');
});

test('should allow search options overrides', (t) => {
  const customOptions = createMockCrossDomainSearchOptions({
    query: 'custom query',
    limit: 20,
    includeContext: true,
  });

  t.is(customOptions.query, 'custom query');
  t.is(customOptions.limit, 20);
  t.true(customOptions.includeContext);
});

test('should allow enhanced search result overrides', (t) => {
  const customResult = createMockEnhancedSearchResult({
    id: 'custom-id',
    score: 0.95,
    source: 'discord',
  });

  t.is(customResult.id, 'custom-id');
  t.is(customResult.score, 0.95);
  t.is(customResult.source, 'discord');
});

test('should allow cross-domain search response overrides', (t) => {
  const customResponse = createMockCrossDomainSearchResponse({
    total: 5,
    hasMore: true,
    executionTime: 200,
  });

  t.is(customResponse.total, 5);
  t.true(customResponse.hasMore);
  t.is(customResponse.executionTime, 200);
});
