// Unified Indexer Service
export {
  createUnifiedIndexerService,
  startUnifiedIndexerService,
  stopUnifiedIndexerService,
  getServiceStatus,
  type UnifiedIndexerServiceState,
} from './unified-indexer-service.js';

// Service types
export {
  type UnifiedIndexerServiceConfig,
  type UnifiedIndexerStats,
  type ServiceStatus,
} from './types/service.js';

// Cross-domain search
export {
  createCrossDomainSearchEngine,
  search,
  intelligentSearch,
  getContextualSearch,
  type CrossDomainSearchEngineState,
} from './cross-domain-search-functional.js';

export { DEFAULT_SEARCH_OPTIONS } from './cross-domain-scoring.js';

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
