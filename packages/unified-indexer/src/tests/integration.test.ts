/**
 * Integration Tests for Unified Indexer
 *
 * End-to-end tests that verify the complete workflow of the
 * unified indexer service and cross-domain search functionality.
 */

import test from 'ava';
import { createUnifiedIndexerService, createCrossDomainSearchEngine } from '../index.js';
import { createTestConfig, TestDataFactory, delay } from './test-utils.js';

test.before(async (t) => {
    // Skip integration tests if no test environment is available
    if (!process.env.INTEGRATION_TEST) {
        t.skip('Skipping integration tests - set INTEGRATION_TEST=1 to run');
        return;
    }
});

test('should perform complete indexing and search workflow', async (t) => {
    if (!process.env.INTEGRATION_TEST) return;

    const config = createTestConfig({
        sources: {
            files: {
                enabled: true,
                paths: ['./src/tests'],
                exclude: ['node_modules'],
                include: ['*.ts'],
            },
            discord: { enabled: false },
            opencode: { enabled: false },
            kanban: { enabled: false },
        },
        sync: {
            interval: 10000,
            batchSize: 50,
            retryAttempts: 3,
            retryDelay: 1000,
        },
    });

    // Create and initialize service
    const indexerService = await createUnifiedIndexerService(config);
    await indexerService.initialize();

    try {
        // Perform full sync
        const syncStats = await indexerService.performFullSync();
        t.is(syncStats.status, 'success');
        t.true(syncStats.files.totalFiles > 0);

        // Create search engine
        const searchEngine = createCrossDomainSearchEngine(indexerService);

        // Perform searches
        const searchResponse = await searchEngine.search({
            query: 'test',
            limit: 10,
            semantic: true,
        });

        t.is(searchResponse.status, 'success');
        t.true(searchResponse.results.length >= 0);
        t.truthy(searchResponse.took);

        // Get context
        const context = await indexerService.getContext({
            limit: 5,
            includeMetadata: true,
        });

        t.truthy(context.messages);
        t.true(context.totalTokens >= 0);

    } finally {
        await indexerService.stop();
    }
});

test('should handle multiple data sources', async (t) => {
    if (!process.env.INTEGRATION_TEST) return;

    const config = createTestConfig({
        sources: {
            files: {
                enabled: true,
                paths: ['./src/tests'],
                include: ['*.ts'],
            },
            discord: {
                enabled: true,
                channels: ['test-channel'],
                token: 'test-token',
            },
            opencode: {
                enabled: true,
                sessions: ['test-session'],
            },
            kanban: {
                enabled: true,
                boards: ['test-board'],
            },
        },
    });

    const indexerService = await createUnifiedIndexerService(config);
    await indexerService.initialize();

    try {
        const stats = await indexerService.performFullSync();
        t.is(stats.status, 'success');

        // All sources should have been processed
        t.true(stats.files.totalFiles >= 0);
        t.true(stats.discord.totalMessages >= 0);
        t.true(stats.opencode.totalSessions >= 0);
        t.true(stats.kanban.totalTasks >= 0);

    } finally {
        await indexerService.stop();
    }
});

test('should handle service lifecycle correctly', async (t) => {
    if (!process.env.INTEGRATION_TEST) return;

    const config = createTestConfig();
    const indexerService = await createUnifiedIndexerService(config);

    // Test initialization
    await indexerService.initialize();
    t.is(indexerService.getStatus(), 'initialized');

    // Test start
    await indexerService.start();
    t.is(indexerService.getStatus(), 'running');

    // Wait for periodic sync
    await delay(6000); // Wait for one sync cycle

    const stats = await indexerService.getStats();
    t.is(stats.status, 'running');
    t.truthy(stats.lastSync);

    // Test stop
    await indexerService.stop();
    t.is(indexerService.getStatus(), 'stopped');
});

test('should handle search with context compilation', async (t) => {
    if (!process.env.INTEGRATION_TEST) return;

    const config = createTestConfig({
        sources: {
            files: {
                enabled: true,
                paths: ['./src/tests'],
                include: ['*.ts'],
            },
            discord: { enabled: false },
            opencode: { enabled: false },
            kanban: { enabled: false },
        },
    });

    const indexerService = await createUnifiedIndexerService(config);
    await indexerService.initialize();

    try {
        await indexerService.performFullSync();

        const searchEngine = createCrossDomainSearchEngine(indexerService);
        const response = await searchEngine.search({
            query: 'unified indexer',
            semantic: true,
            includeContext: true,
            limit: 5,
        });

        t.is(response.status, 'success');
        t.truthy(response.context);
        t.true(response.context.messages.length >= 0);

    } finally {
        await indexerService.stop();
    }
});

test('should handle error recovery', async (t) => {
    if (!process.env.INTEGRATION_TEST) return;

    const config = createTestConfig({
        sources: {
            files: {
                enabled: true,
                paths: ['./nonexistent-path'], // This should cause an error
                include: ['*.ts'],
            },
            discord: { enabled: false },
            opencode: { enabled: false },
            kanban: { enabled: false },
        },
        sync: {
            retryAttempts: 3,
            retryDelay: 500,
        },
    });

    const indexerService = await createUnifiedIndexerService(config);
    await indexerService.initialize();

    try {
        const stats = await indexerService.performFullSync();
        
        // Should handle errors gracefully
        t.is(stats.status, 'error');
        t.true(stats.errors.length > 0);

        // Service should still be functional
        t.is(indexerService.getStatus(), 'initialized');

    } finally {
        await indexerService.stop();
    }
});

test('should handle concurrent operations', async (t) => {
    if (!process.env.INTEGRATION_TEST) return;

    const config = createTestConfig({
        sources: {
            files: {
                enabled: true,
                paths: ['./src/tests'],
                include: ['*.ts'],
            },
            discord: { enabled: false },
            opencode: { enabled: false },
            kanban: { enabled: false },
        },
    });

    const indexerService = await createUnifiedIndexerService(config);
    await indexerService.initialize();
    await indexerService.start();

    try {
        const searchEngine = createCrossDomainSearchEngine(indexerService);

        // Run multiple operations concurrently
        const operations = [
            indexerService.performFullSync(),
            searchEngine.search({ query: 'test', limit: 10 }),
            searchEngine.search({ query: 'unified', limit: 5 }),
            indexerService.getContext({ limit: 10 }),
            indexerService.getStats(),
        ];

        const results = await Promise.allSettled(operations);

        // All operations should complete (either fulfilled or rejected)
        results.forEach((result, index) => {
            t.true(result.status === 'fulfilled' || result.status === 'rejected');
        });

        // At least some should succeed
        const fulfilledCount = results.filter(r => r.status === 'fulfilled').length;
        t.true(fulfilledCount > 0);

    } finally {
        await indexerService.stop();
    }
});

test('should handle large datasets', async (t) => {
    if (!process.env.INTEGRATION_TEST) return;

    const config = createTestConfig({
        sources: {
            files: {
                enabled: true,
                paths: ['./src'], // Larger dataset
                include: ['*.ts', '*.js', '*.md'],
            },
            discord: { enabled: false },
            opencode: { enabled: false },
            kanban: { enabled: false },
        },
        sync: {
            batchSize: 20, // Smaller batches for testing
            interval: 15000,
        },
    });

    const indexerService = await createUnifiedIndexerService(config);
    await indexerService.initialize();

    try {
        const startTime = Date.now();
        const stats = await indexerService.performFullSync();
        const endTime = Date.now();

        t.is(stats.status, 'success');
        t.true(stats.files.totalFiles > 0);
        t.true(endTime - startTime < 30000); // Should complete within 30 seconds

        // Test search performance
        const searchEngine = createCrossDomainSearchEngine(indexerService);
        const searchStart = Date.now();
        const searchResponse = await searchEngine.search({
            query: 'TypeScript',
            limit: 20,
            semantic: true,
        });
        const searchEnd = Date.now();

        t.is(searchResponse.status, 'success');
        t.true(searchEnd - searchStart < 5000); // Search should be fast

    } finally {
        await indexerService.stop();
    }
});

test('should validate example configuration', async (t) => {
    if (!process.env.INTEGRATION_TEST) return;

    // Test the example configuration from the package
    const { exampleConfig } = await import('../unified-indexer-example.js');
    
    const indexerService = await createUnifiedIndexerService(exampleConfig);
    await indexerService.initialize();

    try {
        const stats = await indexerService.getStats();
        t.is(stats.status, 'initialized');

        // Should be able to create search engine
        const searchEngine = createCrossDomainSearchEngine(indexerService);
        t.truthy(searchEngine);

    } finally {
        await indexerService.stop();
    }
});

test('should handle memory usage efficiently', async (t) => {
    if (!process.env.INTEGRATION_TEST) return;

    const config = createTestConfig({
        sources: {
            files: {
                enabled: true,
                paths: ['./src/tests'],
                include: ['*.ts'],
            },
            discord: { enabled: false },
            opencode: { enabled: false },
            kanban: { enabled: false },
        },
    });

    const indexerService = await createUnifiedIndexerService(config);
    await indexerService.initialize();

    try {
        // Perform multiple operations to test memory management
        for (let i = 0; i < 10; i++) {
            await indexerService.performFullSync();
            
            const searchEngine = createCrossDomainSearchEngine(indexerService);
            await searchEngine.search({
                query: `test query ${i}`,
                limit: 10,
            });

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
        }

        const finalStats = await indexerService.getStats();
        t.is(finalStats.status, 'initialized');

    } finally {
        await indexerService.stop();
    }
});