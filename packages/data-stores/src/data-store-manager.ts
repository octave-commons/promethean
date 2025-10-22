import { ContextStore } from '@promethean/persistence';

import {
  StoreNames,
  type StoreManagerMap,
  type SearchOptions,
  type CrossStoreSearchResult,
  type IDataStoreManager,
} from './types.js';
import { STORE_CONFIGS, ALL_STORES } from './store-configs.js';

/**
 * Internal state for the data store manager
 */
interface DataStoreState {
  readonly contextStore: ContextStore;
  readonly initializedStores: ReadonlySet<StoreNames>;
}

/**
 * Create a new data store manager
 */
export const createDataStoreManager = (
  formatTime?: (epochMs: number) => string,
  assistantName?: string,
): IDataStoreManager => {
  let state: DataStoreState | null = null;

  const ensureInitialized = (): DataStoreState => {
    if (!state) {
      throw new Error('DataStoreManager not initialized. Call initialize() first.');
    }
    return state;
  };

  const initialize = async (): Promise<void> => {
    if (state) {
      return; // Already initialized
    }

    const contextStore = new ContextStore(formatTime, assistantName);
    const initializedStores = new Set<StoreNames>();

    // Initialize all stores
    for (const storeName of ALL_STORES) {
      const config = STORE_CONFIGS[storeName];
      try {
        await contextStore.createCollection(config.name, config.textKey, config.timestampKey);
        initializedStores.add(storeName);
      } catch (error) {
        // Collection might already exist, try to get it
        try {
          contextStore.getCollection(config.name);
          initializedStores.add(storeName);
        } catch (getError) {
          throw new Error(`Failed to initialize store ${storeName}: ${error}`);
        }
      }
    }

    state = {
      contextStore,
      initializedStores,
    };
  };

  const getStore = async <T extends StoreNames>(name: T): Promise<StoreManagerMap[T]> => {
    const currentState = ensureInitialized();

    if (!currentState.initializedStores.has(name)) {
      throw new Error(`Store ${name} is not initialized`);
    }

    const collection = currentState.contextStore.getCollection(name);
    // Cast to the appropriate type based on store configuration
    return collection as StoreManagerMap[T];
  };

  const getStoreNames = (): readonly StoreNames[] => {
    const currentState = ensureInitialized();
    return Array.from(currentState.initializedStores);
  };

  const searchAcrossAllStores = async (
    queries: readonly string[],
    options: SearchOptions = {},
  ): Promise<CrossStoreSearchResult[]> => {
    const currentState = ensureInitialized();
    const { limit = 100, where } = options;

    if (queries.length === 0) {
      return [];
    }

    const results = await currentState.contextStore.getAllRelatedDocuments(queries, limit, where);

    return results.map((entry) => {
      // Determine which store this entry came from based on metadata
      const storeName = determineStoreFromEntry(entry);
      return {
        storeName,
        entry: entry as any, // Type assertion since we can't determine exact type at runtime
      };
    });
  };

  const searchInStores = async <T extends StoreNames>(
    storeNames: readonly T[],
    queries: readonly string[],
    options: SearchOptions = {},
  ): Promise<CrossStoreSearchResult<T>[]> => {
    const { limit = 100, where } = options;

    if (queries.length === 0) {
      return [];
    }

    const results: CrossStoreSearchResult<T>[] = [];

    for (const storeName of storeNames) {
      const store = await getStore(storeName);
      const storeResults = await store.getMostRelevant([...queries], limit, where);

      for (const entry of storeResults) {
        results.push({
          storeName,
          entry: entry as any, // Type assertion for runtime
        });
      }
    }

    return results;
  };

  const getLatestFromAllStores = async (limit: number = 100): Promise<CrossStoreSearchResult[]> => {
    const currentState = ensureInitialized();
    const results = await currentState.contextStore.getLatestDocuments(limit);

    return results.map((entry) => {
      const storeName = determineStoreFromEntry(entry);
      return {
        storeName,
        entry: entry as any,
      };
    });
  };

  const getLatestFromStores = async <T extends StoreNames>(
    storeNames: readonly T[],
    limit: number = 100,
  ): Promise<CrossStoreSearchResult<T>[]> => {
    const results: CrossStoreSearchResult<T>[] = [];

    for (const storeName of storeNames) {
      const store = await getStore(storeName);
      const storeResults = await store.getMostRecent(limit);

      for (const entry of storeResults) {
        results.push({
          storeName,
          entry: entry as any,
        });
      }
    }

    return results;
  };

  const cleanup = async (): Promise<void> => {
    if (state) {
      // ContextStore doesn't have a cleanup method, but individual stores do
      // We would need to iterate through stores and clean them up if needed
      state = null;
    }
  };

  return {
    initialize,
    getStore,
    getStoreNames,
    searchAcrossAllStores,
    searchInStores,
    getLatestFromAllStores,
    getLatestFromStores,
    cleanup,
  };
};

/**
 * Determine which store an entry came from based on its metadata
 */
const determineStoreFromEntry = (entry: any): StoreNames => {
  const metadata = entry.metadata || {};

  if (metadata.type === 'session') return StoreNames.SESSION;
  if (metadata.type === 'event') return StoreNames.EVENT;
  if (metadata.type === 'message') return StoreNames.MESSAGE;
  if (metadata.type === 'file') return StoreNames.FILE_INDEX;

  // Fallback: try to determine by content structure
  if (metadata.filePath && metadata.fileName) return StoreNames.FILE_INDEX;
  if (metadata.sessionId && metadata.role) return StoreNames.MESSAGE;
  if (metadata.eventType) return StoreNames.EVENT;
  if (metadata.sessionId && !metadata.role) return StoreNames.SESSION;

  // Default fallback
  return StoreNames.SESSION;
};

/**
 * Global data store manager instance
 */
let globalDataStoreManager: IDataStoreManager | null = null;

/**
 * Get the global data store manager instance
 */
export const getDataStoreManager = (
  formatTime?: (epochMs: number) => string,
  assistantName?: string,
): IDataStoreManager => {
  if (!globalDataStoreManager) {
    globalDataStoreManager = createDataStoreManager(formatTime, assistantName);
  }
  return globalDataStoreManager;
};

/**
 * Reset the global data store manager (useful for testing)
 */
export const resetGlobalDataStoreManager = (): void => {
  if (globalDataStoreManager) {
    globalDataStoreManager.cleanup();
    globalDataStoreManager = null;
  }
};
