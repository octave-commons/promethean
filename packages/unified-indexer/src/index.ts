// Unified Indexer Service
export {
  UnifiedIndexerService,
  createUnifiedIndexerService,
  DEFAULT_SERVICE_CONFIG,
} from './unified-indexer-service.js';

// Service types
export {
  type UnifiedIndexerServiceConfig,
  type UnifiedIndexerStats,
  type ServiceStatus,
} from './types/service.js';

// Cross-domain search
export {
  CrossDomainSearchEngine,
  createCrossDomainSearchEngine,
  DEFAULT_SEARCH_OPTIONS,
} from './cross-domain-search.js';

// Search types
export {
  type CrossDomainSearchOptions,
  type EnhancedSearchResult,
  type CrossDomainSearchResponse,
} from './types/search.js';

// Examples and demonstrations
export {
  runUnifiedIndexerExample,
  demonstrateContextStoreIntegration,
  exampleConfig,
} from './unified-indexer-example.js';
