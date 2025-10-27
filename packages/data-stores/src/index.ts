// Export all types and enums
export {
  StoreNames,
  type StoreConfig,
  type SessionEntry,
  type EventEntry,
  type MessageEntry,
  type FileIndexEntry,
  type StoreEntryMap,
  type StoreManagerMap,
  type AnyStoreManager,
  type SearchOptions,
  type CrossStoreSearchResult,
  type IDataStoreManager,
} from './types.js';

// Export store configurations
export { STORE_CONFIGS, OPENCODE_STORES, FILE_SYSTEM_STORES, ALL_STORES } from './store-configs.js';

// Export data store manager functions
export {
  createDataStoreManager,
  getDataStoreManager,
  resetGlobalDataStoreManager,
} from './data-store-manager.js';

// Re-export ContextStore for advanced usage
export { ContextStore } from '@promethean-os/persistence';
