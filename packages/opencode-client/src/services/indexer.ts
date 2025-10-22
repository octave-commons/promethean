/**
 * Indexer Service - Main indexing service using composables
 *
 * This service provides the main indexing functionality for OpenCode data,
 * built using composable functions for better maintainability and testability.
 */

import type { IndexerState } from './indexer-types.js';

import {
  createClient,
  createStateManagerComposable,
  createLoggerComposable,
  createTimerManager,
  createEventManager,
  createSyncManager,
} from './composables/index.js';

// Additional types needed for the indexer service
export type IndexerOptions = {
  readonly baseUrl?: string;
  readonly processingInterval?: number;
  readonly stateFile?: string;
};

export type EventProcessingStats = {
  readonly totalEvents: number;
  readonly dedupedEvents: number;
  readonly processedEvents: number;
  readonly errors: number;
  readonly lastEventTime?: number;
};

/**
 * Create a configured indexer service
 */
export function createIndexerService(options: IndexerOptions = {}) {
  // Create core components
  const client = createClient({
    baseUrl: options.baseUrl || 'http://localhost:3000',
  });

  const stateManager = createStateManagerComposable({
    stateFile: options.stateFile || './indexer-state.json',
  });

  const loggerManager = createLoggerComposable();
  const timerManager = createTimerManager();

  const eventManager = createEventManager(
    client,
    {
      reconnectDelayMs: 5000,
      maxConsecutiveErrors: 5,
    },
    stateManager,
    loggerManager.logger,
    timerManager,
  );

  const syncManager = createSyncManager(
    client,
    {
      fullSyncIntervalMs: (options.processingInterval || 60000) * 60, // Every hour by default
    },
    stateManager,
    loggerManager.logger,
  );

  // Indexer state
  let isRunning = false;

  /**
   * Get current indexer state
   */
  const getState = async (): Promise<IndexerState & { readonly isRunning: boolean }> => {
    const state = await stateManager.loadState();
    return {
      ...state,
      isRunning,
    };
  };

  /**
   * Start the indexer service
   */
  const start = async (): Promise<void> => {
    if (isRunning) {
      console.warn('[Indexer] Already running');
      return;
    }

    console.log('[Indexer] Starting indexer service');
    isRunning = true;

    try {
      // Load previous state if available
      await stateManager.loadState();

      // Start event subscription for real-time processing
      await eventManager.startSubscription();

      // Start periodic full sync timer
      timerManager.setIntervalTimer(
        'fullSync',
        async () => {
          try {
            await syncManager.performFullSync();
          } catch (error) {
            console.error('[Indexer] Error in full sync timer:', error);
          }
        },
        (options.processingInterval || 60000) * 60, // Every hour by default
      );

      console.log('[Indexer] Indexer service started successfully');
    } catch (error) {
      console.error('[Indexer] Failed to start indexer:', error);
      isRunning = false;
      throw error;
    }
  };

  /**
   * Stop the indexer service
   */
  const stop = async (): Promise<void> => {
    if (!isRunning) {
      console.warn('[Indexer] Not running');
      return;
    }

    console.log('[Indexer] Stopping indexer service');
    isRunning = false;

    try {
      // Stop event subscription
      await eventManager.stopSubscription();

      // Stop timers
      timerManager.clearTimer('fullSync');

      // Flush any pending logs
      loggerManager.flush();

      // Save current state
      await stateManager.saveState(await stateManager.loadState());

      console.log('[Indexer] Indexer service stopped successfully');
    } catch (error) {
      console.error('[Indexer] Error stopping indexer:', error);
      throw error;
    }
  };

  /**
   * Perform a full sync of all data
   */
  const fullSync = async (): Promise<void> => {
    console.log('[Indexer] Starting full sync');
    await syncManager.performFullSync();
    console.log('[Indexer] Full sync completed');
  };

  /**
   * Get processing statistics (simplified version)
   */
  const getStats = (): EventProcessingStats => {
    // This is a simplified version - in a real implementation,
    // you'd track these metrics in the logger composable
    return {
      totalEvents: 0,
      dedupedEvents: 0,
      processedEvents: 0,
      errors: 0,
    };
  };

  /**
   * Reset statistics
   */
  const resetStats = (): void => {
    // This would reset the stats in the logger composable
    console.log('[Indexer] Statistics reset');
  };

  /**
   * Cleanup resources
   */
  const cleanup = async (): Promise<void> => {
    await stop();
    timerManager.clearAllTimers();
  };

  return {
    // Core methods
    start,
    stop,
    fullSync,
    cleanup,

    // State and stats
    getState,
    getStats,
    resetStats,

    // Direct access to components (for advanced usage)
    client,
    stateManager,
    loggerManager,
    timerManager,
    eventManager,
    syncManager,
  };
}

/**
 * Create and start an indexer service with default options
 */
export async function startIndexer(options: IndexerOptions = {}) {
  const indexer = createIndexerService(options);
  await indexer.start();
  return indexer;
}

/**
 * Default indexer instance for simple usage
 */
let defaultIndexer: ReturnType<typeof createIndexerService> | null = null;

/**
 * Get or create the default indexer instance
 */
export function getDefaultIndexer(options?: IndexerOptions) {
  if (!defaultIndexer) {
    defaultIndexer = createIndexerService(options);
  }
  return defaultIndexer;
}

/**
 * Start the default indexer instance
 */
export async function startDefaultIndexer(options?: IndexerOptions) {
  const indexer = getDefaultIndexer(options);
  await indexer.start();
  return indexer;
}

/**
 * Stop the default indexer instance
 */
export async function stopDefaultIndexer() {
  if (defaultIndexer) {
    await defaultIndexer.stop();
  }
}

// Re-export composables for direct usage
export * from './composables/index.js';
