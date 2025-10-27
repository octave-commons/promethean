/**
 * Basic Tests for Unified Indexer
 *
 * Simple test suite that verifies basic functionality without
 * complex mocking or type assumptions.
 */

import test from 'ava';

// Test that the package exports are available
test('should export all expected functions and classes', async (t) => {
    const pkg = await import('../index.js');
    
    // Check that main exports are available
    t.truthy(pkg.UnifiedIndexerService);
    t.truthy(pkg.createUnifiedIndexerService);
    t.truthy(pkg.CrossDomainSearchEngine);
    t.truthy(pkg.createCrossDomainSearchEngine);
    t.truthy(pkg.runUnifiedIndexerExample);
    t.truthy(pkg.demonstrateContextStoreIntegration);
    t.truthy(pkg.exampleConfig);
    
    // Check that exports are functions/classes
    t.is(typeof pkg.UnifiedIndexerService, 'function');
    t.is(typeof pkg.createUnifiedIndexerService, 'function');
    t.is(typeof pkg.CrossDomainSearchEngine, 'function');
    t.is(typeof pkg.createCrossDomainSearchEngine, 'function');
    t.is(typeof pkg.runUnifiedIndexerExample, 'function');
    t.is(typeof pkg.demonstrateContextStoreIntegration, 'function');
    t.is(typeof pkg.exampleConfig, 'object');
});

test('should have valid example configuration', (t) => {
    const { exampleConfig } = require('../dist/index.js');
    
    t.truthy(exampleConfig);
    t.truthy(exampleConfig.indexing);
    t.truthy(exampleConfig.contextStore);
    t.truthy(exampleConfig.sources);
    t.truthy(exampleConfig.sync);
    
    // Check that configuration has expected structure
    t.truthy(exampleConfig.indexing.vectorStore);
    t.truthy(exampleConfig.contextStore.collections);
    t.true(exampleConfig.sync.interval > 0);
    t.true(exampleConfig.sync.batchSize > 0);
});

test('should create search engine with default options', (t) => {
    const { CrossDomainSearchEngine } = require('../dist/index.js');
    
    // Mock a minimal indexer service
    const mockService = {
        getContext: () => Promise.resolve({ messages: [], totalTokens: 0 }),
        getStats: () => Promise.resolve({ status: 'stopped' }),
        search: () => Promise.resolve({ results: [], total: 0, took: 0 }),
    };
    
    const searchEngine = new CrossDomainSearchEngine(mockService);
    t.truthy(searchEngine);
    t.is(typeof searchEngine.search, 'function');
});

test('should handle basic search structure', async (t) => {
    const { createCrossDomainSearchEngine } = require('../dist/index.js');
    
    // Mock service that returns empty results
    const mockService = {
        getContext: () => Promise.resolve({ messages: [], totalTokens: 0 }),
        getStats: () => Promise.resolve({ status: 'stopped' }),
        search: () => Promise.resolve({ results: [], total: 0, took: 10 }),
    };
    
    const searchEngine = createCrossDomainSearchEngine(mockService);
    const response = await searchEngine.search({
        query: 'test',
        limit: 10,
    });
    
    // Basic response structure should be present
    t.truthy(response);
    t.true(Array.isArray(response.results));
    t.is(typeof response.total, 'number');
    t.is(typeof response.took, 'number');
});

test('should validate package structure', (t) => {
    // Check that the package has the expected structure
    const fs = require('fs');
    const path = require('path');
    
    const packagePath = path.join(__dirname, '../..');
    const srcPath = path.join(packagePath, 'src');
    const distPath = path.join(packagePath, 'dist');
    
    // Check that key files exist
    t.true(fs.existsSync(srcPath));
    t.true(fs.existsSync(path.join(srcPath, 'index.ts')));
    t.true(fs.existsSync(path.join(srcPath, 'unified-indexer-service.ts')));
    t.true(fs.existsSync(path.join(srcPath, 'cross-domain-search.ts')));
    t.true(fs.existsSync(path.join(srcPath, 'unified-indexer-example.ts')));
    
    // Check that built files exist
    t.true(fs.existsSync(distPath));
    t.true(fs.existsSync(path.join(distPath, 'index.js')));
    t.true(fs.existsSync(path.join(distPath, 'index.d.ts')));
});

test('should have working imports', async (t) => {
    // Test that all imports work correctly
    const imports = await Promise.all([
        import('../unified-indexer-service.js'),
        import('../cross-domain-search.js'),
        import('../unified-indexer-example.js'),
    ]);
    
    t.truthy(imports[0]); // service
    t.truthy(imports[1]); // search
    t.truthy(imports[2]); // example
    
    // Check that key exports are available
    t.truthy(imports[0].UnifiedIndexerService);
    t.truthy(imports[1].CrossDomainSearchEngine);
    t.truthy(imports[2].exampleConfig);
});

test('should handle type definitions', (t) => {
    const fs = require('fs');
    const path = require('path');
    
    const typeDefPath = path.join(__dirname, '../..', 'dist', 'index.d.ts');
    t.true(fs.existsSync(typeDefPath));
    
    const typeDefContent = fs.readFileSync(typeDefPath, 'utf8');
    
    // Check that key types are exported
    t.true(typeDefContent.includes('UnifiedIndexerService'));
    t.true(typeDefContent.includes('CrossDomainSearchEngine'));
    t.true(typeDefContent.includes('UnifiedIndexerServiceConfig'));
    t.true(typeDefContent.includes('CrossDomainSearchOptions'));
});