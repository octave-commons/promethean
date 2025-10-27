/**
 * Simple Service Types Validation Tests
 *
 * Basic tests to validate that our mock objects properly implement
 * the unified indexing service types.
 */

import test from 'ava';

import {
    createMockIndexingStats,
    createMockIndexingOptions,
    createMockUnifiedIndexingConfig,
    isValidIndexingStats,
} from '../utils/simple-mocks.js';

test('createMockIndexingStats creates valid IndexingStats', (t) => {
    const stats = createMockIndexingStats();

    t.true(typeof stats.totalContent === 'number');
    t.true(typeof stats.contentByType === 'object');
    t.true(typeof stats.contentBySource === 'object');
    t.true(typeof stats.lastIndexed === 'number');
    t.true(typeof stats.storageStats === 'object');

    t.true(isValidIndexingStats(stats));
});

test('createMockIndexingStats with overrides', (t) => {
    const overrides = {
        totalContent: 500,
        lastIndexed: 1234567890,
    };

    const stats = createMockIndexingStats(overrides);

    t.is(stats.totalContent, 500);
    t.is(stats.lastIndexed, 1234567890);
    t.true(isValidIndexingStats(stats));
});

test('createMockIndexingOptions creates valid IndexingOptions', (t) => {
    const options = createMockIndexingOptions();

    t.true(typeof options.skipVectors === 'boolean');
    t.true(typeof options.skipMetadata === 'boolean');
    t.true(typeof options.overwrite === 'boolean');
    t.true(typeof options.batchSize === 'number');
    t.true(typeof options.concurrency === 'number');
    t.true(typeof options.validate === 'boolean');
    t.true(typeof options.strict === 'boolean');
});

test('createMockIndexingOptions with overrides', (t) => {
    const overrides = {
        batchSize: 200,
        concurrency: 4,
        validate: false,
    };

    const options = createMockIndexingOptions(overrides);

    t.is(options.batchSize, 200);
    t.is(options.concurrency, 4);
    t.is(options.validate, false);
});

test('createMockUnifiedIndexingConfig creates valid UnifiedIndexingConfig', (t) => {
    const config = createMockUnifiedIndexingConfig();

    t.true(typeof config.vectorStore === 'object');
    t.true(typeof config.metadataStore === 'object');
    t.true(typeof config.embedding === 'object');
    t.true(typeof config.cache === 'object');
    t.true(typeof config.validation === 'object');

    t.is(config.vectorStore.type, 'chromadb');
    t.is(config.metadataStore.type, 'mongodb');
    t.is(config.embedding.model, 'text-embedding-ada-002');
    t.true(config.cache.enabled);
    t.true(config.validation.strict);
});

test('createMockUnifiedIndexingConfig with overrides', (t) => {
    const overrides = {
        vectorStore: {
            type: 'pinecone' as const,
            connectionString: 'https://api.pinecone.io',
            indexName: 'test-pinecone-index',
            dimensions: 768,
        },
        cache: {
            enabled: false,
            ttl: 600000,
            maxSize: 2000,
        },
    };

    const config = createMockUnifiedIndexingConfig(overrides);

    t.is(config.vectorStore.type, 'pinecone');
    t.is(config.cache.enabled, false);
    t.is(config.cache.ttl, 600000);
    t.is(config.cache.maxSize, 2000);
});

test('IndexingStats type structure validation', (t) => {
    const stats = createMockIndexingStats();

    // Check contentByType has all required content types
    const requiredTypes: Array<keyof typeof stats.contentByType> = [
        'file',
        'message',
        'task',
        'event',
        'session',
        'attachment',
        'thought',
        'document',
        'board',
    ];

    for (const type of requiredTypes) {
        t.true(typeof stats.contentByType[type] === 'number', `Missing or invalid contentByType.${type}`);
    }

    // Check contentBySource has all required sources
    const requiredSources: Array<keyof typeof stats.contentBySource> = [
        'filesystem',
        'discord',
        'opencode',
        'kanban',
        'agent',
        'user',
        'system',
        'external',
    ];

    for (const source of requiredSources) {
        t.true(typeof stats.contentBySource[source] === 'number', `Missing or invalid contentBySource.${source}`);
    }

    // Check storageStats structure
    t.true(typeof stats.storageStats.vectorSize === 'number');
    t.true(typeof stats.storageStats.metadataSize === 'number');
    t.true(typeof stats.storageStats.totalSize === 'number');
});

test('UnifiedIndexingConfig type structure validation', (t) => {
    const config = createMockUnifiedIndexingConfig();

    // Check vectorStore structure
    t.true(typeof config.vectorStore.type === 'string');
    t.true(typeof config.vectorStore.connectionString === 'string');
    t.true(typeof config.vectorStore.indexName === 'string');
    t.true(typeof config.vectorStore.dimensions === 'number');

    // Check metadataStore structure
    t.true(typeof config.metadataStore.type === 'string');
    t.true(typeof config.metadataStore.connectionString === 'string');
    t.true(typeof config.metadataStore.tableName === 'string');

    // Check embedding structure
    t.true(typeof config.embedding.model === 'string');
    t.true(typeof config.embedding.dimensions === 'number');
    t.true(typeof config.embedding.batchSize === 'number');

    // Check cache structure
    t.true(typeof config.cache.enabled === 'boolean');
    t.true(typeof config.cache.ttl === 'number');
    t.true(typeof config.cache.maxSize === 'number');

    // Check validation structure
    t.true(typeof config.validation.strict === 'boolean');
    t.true(typeof config.validation.skipVectorValidation === 'boolean');
    t.true(typeof config.validation.maxContentLength === 'number');
});

test('Invalid IndexingStats detection', (t) => {
    const invalidStats = [
        null,
        undefined,
        {},
        { totalContent: 'not-a-number' },
        { totalContent: 100, contentByType: 'not-an-object' },
        { totalContent: 100, contentByType: {}, contentBySource: 'not-an-object' },
        {
            totalContent: 100,
            contentByType: {},
            contentBySource: {},
            lastIndexed: 'not-a-number',
        },
        {
            totalContent: 100,
            contentByType: {},
            contentBySource: {},
            lastIndexed: Date.now(),
            storageStats: 'not-an-object',
        },
    ];

    for (const invalid of invalidStats) {
        t.false(isValidIndexingStats(invalid), `Should detect invalid stats: ${JSON.stringify(invalid)}`);
    }
});
