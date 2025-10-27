/**
 * Unified Indexer Service Tests
 *
 * Comprehensive test suite for the UnifiedIndexerService class,
 * covering initialization, lifecycle management, sync operations,
 * and error handling.
 */

import test from 'ava';
import sinon from 'sinon';
import { UnifiedIndexerService } from '../unified-indexer-service.js';
import type { UnifiedIndexerServiceConfig, UnifiedIndexerStats } from '../unified-indexer-service.js';
import {
    MockUnifiedIndexingClient,
    MockUnifiedFileIndexer,
    MockUnifiedDiscordIndexer,
    MockUnifiedOpenCodeIndexer,
    MockUnifiedKanbanIndexer,
    createTestConfig,
    delay,
    createMockConsole,
} from './test-utils.js';

// Mock the persistence module functions
const mockCreateUnifiedIndexingClient = sinon.stub();
const mockCreateUnifiedFileIndexer = sinon.stub();
const mockCreateUnifiedDiscordIndexer = sinon.stub();
const mockCreateUnifiedOpenCodeIndexer = sinon.stub();
const mockCreateUnifiedKanbanIndexer = sinon.stub();

// Mock the contextStore functions
const mockCreateContextStore = sinon.stub();
const mockCompileContext = sinon.stub();
const mockGetOrCreateCollection = sinon.stub();

test.beforeEach(() => {
    // Reset all stubs
    mockCreateUnifiedIndexingClient.reset();
    mockCreateUnifiedFileIndexer.reset();
    mockCreateUnifiedDiscordIndexer.reset();
    mockCreateUnifiedOpenCodeIndexer.reset();
    mockCreateUnifiedKanbanIndexer.reset();
    mockCreateContextStore.reset();
    mockCompileContext.reset();
    mockGetOrCreateCollection.reset();

    // Setup default return values
    mockCreateUnifiedIndexingClient.returns(new MockUnifiedIndexingClient());
    mockCreateUnifiedFileIndexer.returns(new MockUnifiedFileIndexer());
    mockCreateUnifiedDiscordIndexer.returns(new MockUnifiedDiscordIndexer());
    mockCreateUnifiedOpenCodeIndexer.returns(new MockUnifiedOpenCodeIndexer());
    mockCreateUnifiedKanbanIndexer.returns(new MockUnifiedKanbanIndexer());
    
    mockCreateContextStore.resolves({
        collections: new Map(),
    });
    mockCompileContext.resolves({
        messages: [],
        totalTokens: 0,
    });
    mockGetOrCreateCollection.resolves({
        add: sinon.stub(),
        find: sinon.stub(),
    });
});

test.afterEach(() => {
    // Clean up any running services
    sinon.restore();
});

test('should create service with default configuration', async (t) => {
    const config = createTestConfig();
    const service = new UnifiedIndexerService(config);

    t.is(service.getStatus(), 'stopped');
    t.truthy(service.getConfig());
});

test('should initialize service successfully', async (t) => {
    const config = createTestConfig();
    const service = new UnifiedIndexerService(config);

    await service.initialize();

    t.is(service.getStatus(), 'initialized');
    t.true(mockCreateUnifiedIndexingClient.calledOnce);
    t.true(mockCreateContextStore.calledOnce);
});

test('should start service successfully', async (t) => {
    const config = createTestConfig();
    const service = new UnifiedIndexerService(config);

    await service.initialize();
    await service.start();

    t.is(service.getStatus(), 'running');
});

test('should stop service successfully', async (t) => {
    const config = createTestConfig();
    const service = new UnifiedIndexerService(config);

    await service.initialize();
    await service.start();
    await service.stop();

    t.is(service.getStatus(), 'stopped');
});

test('should handle start when already running', async (t) => {
    const config = createTestConfig();
    const service = new UnifiedIndexerService(config);
    const mockConsole = createMockConsole();

    await service.initialize();
    await service.start();
    
    // Try to start again
    await service.start();

    t.is(service.getStatus(), 'running');
    const warnings = mockConsole.getLogsByLevel('warn');
    t.true(warnings.some(log => log.message.includes('already running')));
});

test('should handle stop when not running', async (t) => {
    const config = createTestConfig();
    const service = new UnifiedIndexerService(config);
    const mockConsole = createMockConsole();

    await service.initialize();
    
    // Try to stop without starting
    await service.stop();

    t.is(service.getStatus(), 'stopped');
    const warnings = mockConsole.getLogsByLevel('warn');
    t.true(warnings.some(log => log.message.includes('not running')));
});

test('should perform full sync successfully', async (t) => {
    const config = createTestConfig({
        sources: {
            files: { enabled: true, paths: ['./test'] },
            discord: { enabled: false },
            opencode: { enabled: false },
            kanban: { enabled: false },
        },
    });
    const service = new UnifiedIndexerService(config);

    await service.initialize();
    const stats = await service.performFullSync();

    t.is(stats.status, 'success');
    t.is(stats.files.totalFiles, 1); // Mock file indexer should have indexed test directory
    t.true(mockCreateUnifiedFileIndexer.calledOnce);
});

test('should handle sync errors gracefully', async (t) => {
    const config = createTestConfig();
    const service = new UnifiedIndexerService(config);
    
    // Mock an error during indexing
    const mockFileIndexer = new MockUnifiedFileIndexer();
    sinon.stub(mockFileIndexer, 'indexDirectory').rejects(new Error('Test error'));
    mockCreateUnifiedFileIndexer.returns(mockFileIndexer);

    await service.initialize();
    const stats = await service.performFullSync();

    t.is(stats.status, 'error');
    t.true(stats.errors.length > 0);
    t.true(stats.errors.some(error => error.message.includes('Test error')));
});

test('should get service statistics', async (t) => {
    const config = createTestConfig();
    const service = new UnifiedIndexerService(config);

    await service.initialize();
    const stats = await service.getStats();

    t.is(stats.status, 'initialized');
    t.is(stats.files.totalFiles, 0);
    t.is(stats.discord.totalMessages, 0);
    t.is(stats.opencode.totalSessions, 0);
    t.is(stats.kanban.totalTasks, 0);
    t.truthy(stats.lastSync);
});

test('should handle periodic sync', async (t) => {
    const config = createTestConfig({
        sync: {
            interval: 100, // Very short interval for testing
            batchSize: 10,
            retryAttempts: 2,
            retryDelay: 50,
        },
    });
    const service = new UnifiedIndexerService(config);

    await service.initialize();
    await service.start();

    // Wait for at least one periodic sync
    await delay(150);

    const stats = await service.getStats();
    t.truthy(stats.lastSync);

    await service.stop();
});

test('should handle configuration validation', async (t) => {
    const invalidConfig = {
        // Missing required fields
        indexing: {},
        contextStore: {},
        sources: {},
        sync: {},
    } as UnifiedIndexerServiceConfig;

    const service = new UnifiedIndexerService(invalidConfig);
    
    // Should handle invalid config gracefully
    await t.throwsAsync(async () => {
        await service.initialize();
    }, {
        message: /Configuration validation failed/,
    });
});

test('should handle disabled sources', async (t) => {
    const config = createTestConfig({
        sources: {
            files: { enabled: false },
            discord: { enabled: false },
            opencode: { enabled: false },
            kanban: { enabled: false },
        },
    });
    const service = new UnifiedIndexerService(config);

    await service.initialize();
    const stats = await service.performFullSync();

    t.is(stats.status, 'success');
    t.is(stats.files.totalFiles, 0);
    t.is(stats.discord.totalMessages, 0);
    t.is(stats.opencode.totalSessions, 0);
    t.is(stats.kanban.totalTasks, 0);
});

test('should handle context compilation', async (t) => {
    const config = createTestConfig();
    const service = new UnifiedIndexerService(config);

    await service.initialize();
    
    const context = await service.getContext({
        limit: 10,
        includeMetadata: true,
    });

    t.true(mockCompileContext.calledOnce);
    t.truthy(context.messages);
    t.is(context.totalTokens, 0); // Mock returns 0
});

test('should handle service restart', async (t) => {
    const config = createTestConfig();
    const service = new UnifiedIndexerService(config);

    await service.initialize();
    await service.start();
    await service.stop();
    await service.start();

    t.is(service.getStatus(), 'running');
});

test('should handle concurrent operations', async (t) => {
    const config = createTestConfig();
    const service = new UnifiedIndexerService(config);

    await service.initialize();
    await service.start();

    // Run multiple operations concurrently
    const operations = [
        service.performFullSync(),
        service.getStats(),
        service.getContext({ limit: 5 }),
        service.performFullSync(),
    ];

    const results = await Promise.all(operations);

    t.is(results[0].status, 'success'); // First sync
    t.is(results[1].status, 'running'); // Stats
    t.truthy(results[2].messages); // Context
    t.is(results[3].status, 'success'); // Second sync

    await service.stop();
});

test('should handle cleanup on stop', async (t) => {
    const config = createTestConfig();
    const service = new UnifiedIndexerService(config);

    await service.initialize();
    await service.start();
    
    // Verify sync interval is set
    const initialStats = await service.getStats();
    t.truthy(initialStats.lastSync);

    await service.stop();

    // Verify cleanup
    const finalStats = await service.getStats();
    t.is(finalStats.status, 'stopped');
});

test('should handle batch processing', async (t) => {
    const config = createTestConfig({
        sync: {
            interval: 5000,
            batchSize: 5, // Small batch size for testing
            retryAttempts: 2,
            retryDelay: 100,
        },
    });
    const service = new UnifiedIndexerService(config);

    await service.initialize();
    const stats = await service.performFullSync();

    t.is(stats.status, 'success');
    // Verify batch processing was respected
    t.true(mockCreateUnifiedFileIndexer.calledOnce);
});

test('should handle retry logic', async (t) => {
    const config = createTestConfig({
        sync: {
            interval: 5000,
            batchSize: 10,
            retryAttempts: 3,
            retryDelay: 50,
        },
    });
    const service = new UnifiedIndexerService(config);
    
    // Mock a failing operation that succeeds on retry
    let attemptCount = 0;
    const mockFileIndexer = new MockUnifiedFileIndexer();
    const originalIndexDirectory = mockFileIndexer.indexDirectory.bind(mockFileIndexer);
    mockFileIndexer.indexDirectory = async (path: string) => {
        attemptCount++;
        if (attemptCount < 3) {
            throw new Error(`Attempt ${attemptCount} failed`);
        }
        return originalIndexDirectory(path);
    };
    mockCreateUnifiedFileIndexer.returns(mockFileIndexer);

    await service.initialize();
    const stats = await service.performFullSync();

    t.is(stats.status, 'success');
    t.is(attemptCount, 3); // Should have retried 2 times and succeeded on 3rd
});