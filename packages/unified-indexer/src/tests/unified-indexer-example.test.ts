/**
 * Unified Indexer Example Tests
 *
 * Tests for the example code and demonstrations to ensure
 * they work correctly and provide good documentation.
 */

import test from 'ava';
import sinon from 'sinon';
import {
    runUnifiedIndexerExample,
    demonstrateContextStoreIntegration,
    exampleConfig,
} from '../unified-indexer-example.js';
import {
    MockUnifiedIndexingClient,
    MockUnifiedFileIndexer,
    createTestConfig,
} from './test-utils.js';

// Mock all the persistence functions used in examples
const mockCreateUnifiedIndexerService = sinon.stub();
const mockCreateCrossDomainSearchEngine = sinon.stub();
const mockCreateUnifiedIndexingClient = sinon.stub();
const mockCreateUnifiedFileIndexer = sinon.stub();
const mockCreateContextStore = sinon.stub();

test.beforeEach(() => {
    // Reset all stubs
    mockCreateUnifiedIndexerService.reset();
    mockCreateCrossDomainSearchEngine.reset();
    mockCreateUnifiedIndexingClient.reset();
    mockCreateUnifiedFileIndexer.reset();
    mockCreateContextStore.reset();

    // Setup default return values
    mockCreateUnifiedIndexingClient.returns(new MockUnifiedIndexingClient());
    mockCreateUnifiedFileIndexer.returns(new MockUnifiedFileIndexer());
    mockCreateContextStore.resolves({
        collections: new Map(),
    });
});

test.afterEach(() => {
    sinon.restore();
});

test('should have valid example configuration', (t) => {
    t.truthy(exampleConfig);
    t.truthy(exampleConfig.indexing);
    t.truthy(exampleConfig.contextStore);
    t.truthy(exampleConfig.sources);
    t.truthy(exampleConfig.sync);
    
    // Check required configuration fields
    t.truthy(exampleConfig.indexing.vectorStore);
    t.truthy(exampleConfig.indexing.documentStore);
    t.truthy(exampleConfig.contextStore.collections);
    t.truthy(exampleConfig.sync.interval);
    t.truthy(exampleConfig.sync.batchSize);
});

test('should have valid source configurations', (t) => {
    t.truthy(exampleConfig.sources.files);
    t.truthy(exampleConfig.sources.discord);
    t.truthy(exampleConfig.sources.opencode);
    t.truthy(exampleConfig.sources.kanban);
    
    // Check that sources have required fields
    t.is(typeof exampleConfig.sources.files.enabled, 'boolean');
    t.is(typeof exampleConfig.sources.discord.enabled, 'boolean');
    t.is(typeof exampleConfig.sources.opencode.enabled, 'boolean');
    t.is(typeof exampleConfig.sources.kanban.enabled, 'boolean');
});

test('should run example without errors', async (t) => {
    // Mock the service to avoid actual initialization
    const mockService = {
        initialize: sinon.stub().resolves(),
        start: sinon.stub().resolves(),
        performFullSync: sinon.stub().resolves({
            status: 'success',
            files: { totalFiles: 5 },
            discord: { totalMessages: 0 },
            opencode: { totalSessions: 0 },
            kanban: { totalTasks: 0 },
            errors: [],
        }),
        getStats: sinon.stub().resolves({
            status: 'running',
            files: { totalFiles: 5 },
            discord: { totalMessages: 0 },
            opencode: { totalSessions: 0 },
            kanban: { totalTasks: 0 },
            lastSync: new Date(),
        }),
        getContext: sinon.stub().resolves({
            messages: [],
            totalTokens: 0,
        }),
        stop: sinon.stub().resolves(),
    };
    mockCreateUnifiedIndexerService.returns(mockService);

    // Mock search engine
    const mockSearchEngine = {
        search: sinon.stub().resolves({
            query: 'test',
            results: [],
            total: 0,
            took: 10,
            status: 'success',
        }),
    };
    mockCreateCrossDomainSearchEngine.returns(mockSearchEngine);

    // Run the example
    await t.notThrowsAsync(async () => {
        await runUnifiedIndexerExample();
    });

    // Verify service was created and used
    t.true(mockCreateUnifiedIndexerService.calledOnce);
    t.true(mockService.initialize.calledOnce);
    t.true(mockService.start.calledOnce);
    t.true(mockService.performFullSync.calledOnce);
    t.true(mockService.stop.calledOnce);
});

test('should demonstrate context store integration', async (t) => {
    // Mock the service
    const mockService = {
        initialize: sinon.stub().resolves(),
        getContext: sinon.stub().resolves({
            messages: [
                { role: 'user', content: 'Test message 1' },
                { role: 'assistant', content: 'Test response 1' },
                { role: 'user', content: 'Test message 2' },
                { role: 'assistant', content: 'Test response 2' },
            ],
            totalTokens: 100,
        }),
        stop: sinon.stub().resolves(),
    };
    mockCreateUnifiedIndexerService.returns(mockService);

    await t.notThrowsAsync(async () => {
        await demonstrateContextStoreIntegration();
    });

    t.true(mockService.getContext.calledOnce);
    
    // Verify context was requested with correct parameters
    const contextCall = mockService.getContext.getCall(0);
    t.deepEqual(contextCall.args[0], {
        limit: 10,
        includeMetadata: true,
    });
});

test('should handle example errors gracefully', async (t) => {
    // Mock a service that fails during initialization
    const mockService = {
        initialize: sinon.stub().rejects(new Error('Initialization failed')),
        stop: sinon.stub().resolves(),
    };
    mockCreateUnifiedIndexerService.returns(mockService);

    await t.throwsAsync(async () => {
        await runUnifiedIndexerExample();
    }, {
        message: /Initialization failed/,
    });
});

test('should have realistic example data', (t) => {
    // Check that example configuration uses realistic values
    t.true(exampleConfig.sync.interval > 0);
    t.true(exampleConfig.sync.batchSize > 0);
    t.true(exampleConfig.sync.retryAttempts > 0);
    t.true(exampleConfig.sync.retryDelay > 0);

    // Check file source configuration
    if (exampleConfig.sources.files.enabled) {
        t.true(exampleConfig.sources.files.paths.length > 0);
        t.true(exampleConfig.sources.files.exclude.length > 0);
        t.true(exampleConfig.sources.files.include.length > 0);
    }

    // Check indexing configuration
    t.truthy(exampleConfig.indexing.vectorStore.type);
    t.truthy(exampleConfig.indexing.documentStore.type);
});

test('should demonstrate all major features', async (t) => {
    const mockService = {
        initialize: sinon.stub().resolves(),
        start: sinon.stub().resolves(),
        performFullSync: sinon.stub().resolves({
            status: 'success',
            files: { totalFiles: 10 },
            discord: { totalMessages: 5 },
            opencode: { totalSessions: 3 },
            kanban: { totalTasks: 8 },
            errors: [],
        }),
        getStats: sinon.stub().resolves({
            status: 'running',
            files: { totalFiles: 10 },
            discord: { totalMessages: 5 },
            opencode: { totalSessions: 3 },
            kanban: { totalTasks: 8 },
            lastSync: new Date(),
        }),
        getContext: sinon.stub().resolves({
            messages: [
                { role: 'user', content: 'Example message' },
                { role: 'assistant', content: 'Example response' },
            ],
            totalTokens: 50,
        }),
        stop: sinon.stub().resolves(),
    };
    mockCreateUnifiedIndexerService.returns(mockService);

    const mockSearchEngine = {
        search: sinon.stub().resolves({
            query: 'TypeScript contextStore',
            results: [
                {
                    id: 'result-1',
                    content: 'TypeScript contextStore implementation',
                    metadata: {
                        source: 'file',
                        type: 'file',
                        path: '/example/contextStore.ts',
                    },
                    score: 0.9,
                },
            ],
            total: 1,
            took: 25,
            status: 'success',
        }),
    };
    mockCreateCrossDomainSearchEngine.returns(mockSearchEngine);

    await runUnifiedIndexerExample();

    // Verify all major features were demonstrated
    t.true(mockService.initialize.called);
    t.true(mockService.performFullSync.called);
    t.true(mockService.getStats.called);
    t.true(mockService.getContext.called);
    t.true(mockSearchEngine.search.called);
    t.true(mockService.stop.called);
});

test('should provide clear example output', async (t) => {
    // Mock console to capture output
    const originalConsole = global.console;
    const mockConsole = {
        log: sinon.stub(),
        warn: sinon.stub(),
        error: sinon.stub(),
        info: sinon.stub(),
    };
    global.console = mockConsole;

    try {
        const mockService = {
            initialize: sinon.stub().resolves(),
            start: sinon.stub().resolves(),
            performFullSync: sinon.stub().resolves({
                status: 'success',
                files: { totalFiles: 3 },
                discord: { totalMessages: 0 },
                opencode: { totalSessions: 0 },
            }),
            getStats: sinon.stub().resolves({
                status: 'running',
                files: { totalFiles: 3 },
                lastSync: new Date(),
            }),
            getContext: sinon.stub().resolves({
                messages: [],
                totalTokens: 0,
            }),
            stop: sinon.stub().resolves(),
        };
        mockCreateUnifiedIndexerService.returns(mockService);

        const mockSearchEngine = {
            search: sinon.stub().resolves({
                query: 'test',
                results: [],
                total: 0,
                took: 5,
                status: 'success',
            }),
        };
        mockCreateCrossDomainSearchEngine.returns(mockSearchEngine);

        await runUnifiedIndexerExample();

        // Verify that informative output was logged
        const logCalls = mockConsole.log.getCalls();
        t.true(logCalls.length > 0);
        
        // Should log key information
        const logMessages = logCalls.map(call => call.args[0]).join(' ');
        t.true(logMessages.includes('initialized') || logMessages.includes('started') || logMessages.includes('sync'));
        
    } finally {
        global.console = originalConsole;
    }
});