// Unified Indexer Service
export {
    UnifiedIndexerService,
    createUnifiedIndexerService,
    DEFAULT_SERVICE_CONFIG,
    type UnifiedIndexerServiceConfig,
    type UnifiedIndexerStats,
    type ServiceStatus,
} from './unified-indexer-service.js';

// Cross-domain search
export {
    CrossDomainSearchEngine,
    createCrossDomainSearchEngine,
    DEFAULT_SEARCH_OPTIONS,
    type CrossDomainSearchOptions,
    type EnhancedSearchResult,
    type CrossDomainSearchResponse,
} from './cross-domain-search.js';

// Examples and demonstrations
export {
    runUnifiedIndexerExample,
    demonstrateContextStoreIntegration,
    exampleConfig,
} from './unified-indexer-example.js';