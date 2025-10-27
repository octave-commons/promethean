/**
 * Simple Tests for Unified Indexer
 *
 * Minimal test suite that verifies basic package functionality
 * without complex dependencies or mocking.
 */

import test from 'ava';

test('should export expected functions', async (t) => {
    const pkg = await import('../index.js');
    
    // Check main exports exist
    t.truthy(pkg.createUnifiedIndexerService);
    t.truthy(pkg.createCrossDomainSearchEngine);
    t.truthy(pkg.UnifiedIndexerService);
    t.truthy(pkg.CrossDomainSearchEngine);
    t.truthy(pkg.runUnifiedIndexerExample);
    t.truthy(pkg.exampleConfig);
    
    // Check types
    t.is(typeof pkg.createUnifiedIndexerService, 'function');
    t.is(typeof pkg.createCrossDomainSearchEngine, 'function');
    t.is(typeof pkg.UnifiedIndexerService, 'function');
    t.is(typeof pkg.CrossDomainSearchEngine, 'function');
    t.is(typeof pkg.runUnifiedIndexerExample, 'function');
    t.is(typeof pkg.exampleConfig, 'object');
});

test('should have valid configuration structure', async (t) => {
    const { exampleConfig } = await import('../unified-indexer-example.js');
    
    t.truthy(exampleConfig);
    t.truthy(exampleConfig.indexing);
    t.truthy(exampleConfig.contextStore);
    t.truthy(exampleConfig.sources);
    t.truthy(exampleConfig.sync);
    
    // Check required fields
    t.truthy(exampleConfig.indexing.vectorStore);
    t.truthy(exampleConfig.contextStore.collections);
    t.true(exampleConfig.sync.interval > 0);
    t.true(exampleConfig.sync.batchSize > 0);
});

test('should import all modules successfully', async (t) => {
    // Test that all main modules can be imported
    const imports = await Promise.all([
        import('../unified-indexer-service.js'),
        import('../cross-domain-search.js'),
        import('../unified-indexer-example.js'),
    ]);
    
    t.truthy(imports[0]); // service
    t.truthy(imports[1]); // search
    t.truthy(imports[2]); // example
    
    // Check key exports
    t.truthy(imports[0].UnifiedIndexerService);
    t.truthy(imports[1].CrossDomainSearchEngine);
    t.truthy(imports[2].exampleConfig);
});

test('should have working type definitions', (t) => {
    const { createRequire } = require('node:module');
    const require = createRequire(import.meta.url);
    const fs = require('fs');
    const path = require('path');
    
    const typeDefPath = path.join(__dirname, '../..', 'dist', 'index.d.ts');
    t.true(fs.existsSync(typeDefPath));
    
    const typeDefContent = fs.readFileSync(typeDefPath, 'utf8');
    
    // Check that key types are exported
    t.true(typeDefContent.includes('export declare class UnifiedIndexerService'));
    t.true(typeDefContent.includes('export declare class CrossDomainSearchEngine'));
    t.true(typeDefContent.includes('export interface UnifiedIndexerServiceConfig'));
    t.true(typeDefContent.includes('export interface CrossDomainSearchOptions'));
    t.true(typeDefContent.includes('export declare function createUnifiedIndexerService'));
    t.true(typeDefContent.includes('export declare function createCrossDomainSearchEngine'));
});

test('should have proper package structure', (t) => {
    const { createRequire } = require('node:module');
    const require = createRequire(import.meta.url);
    const fs = require('fs');
    const path = require('path');
    
    const packagePath = path.join(__dirname, '../..');
    const packageJsonPath = path.join(packagePath, 'package.json');
    
    t.true(fs.existsSync(packageJsonPath));
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check package.json structure
    t.is(packageJson.name, '@promethean-os/unified-indexer');
    t.is(packageJson.type, 'module');
    t.truthy(packageJson.exports);
    t.truthy(packageJson.scripts);
    t.truthy(packageJson.dependencies);
    t.true(packageJson.dependencies['@promethean-os/persistence']);
});

test('should handle basic instantiation', async (t) => {
    const { UnifiedIndexerService, CrossDomainSearchEngine } = await import('../index.js');
    
    // Create a minimal config for testing
    const minimalConfig = {
        indexing: {
            vectorStore: { type: 'chromadb', connectionString: 'test://localhost' },
            documentStore: { type: 'mongodb', connectionString: 'test://localhost' },
        },
        contextStore: {
            collections: {
                files: 'test-files',
                discord: 'test-discord',
                opencode: 'test-opencode',
                kanban: 'test-kanban',
                unified: 'test-unified',
            },
        },
        sources: {
            files: { enabled: false, paths: [] },
            discord: { enabled: false },
            opencode: { enabled: false },
            kanban: { enabled: false },
        },
        sync: {
            interval: 1000,
            batchSize: 10,
            retryAttempts: 1,
            retryDelay: 100,
        },
    };
    
    // Test that classes can be instantiated (may fail due to missing dependencies, but should not throw syntax errors)
    t.notThrows(() => {
        new UnifiedIndexerService(minimalConfig);
    });
    
    t.notThrows(() => {
        const mockService = {
            getContext: () => Promise.resolve({ messages: [], totalTokens: 0 }),
            getStats: () => Promise.resolve({ status: 'stopped' }),
            search: () => Promise.resolve({ results: [], total: 0, took: 0 }),
        };
        new CrossDomainSearchEngine(mockService);
    });
});