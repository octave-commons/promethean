/**
 * Indexer Service - Main indexing service using composables
 *
 * This service provides the main indexing functionality for OpenCode data,
 * built using composable functions for better maintainability and testability.
 */

import type { IndexerState, OpenCodeClient } from './indexer-types.js';

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

export type ProcessingTimer = {
  readonly name: string;
  readonly interval: number;
};

/**
 * Create a configured indexer service
 */
export function createIndexerService(options: IndexerOptions = {}) {
  // Create core components
  const client = createClient({ 
    baseUrl: options.baseUrl || 'http://localhost:3000' 
  });
  
  const stateManager = createStateManagerComposable({
    stateFile: options.stateFile || './indexer-state.json'
  });
  
  const logger = createLoggerComposable();
  const timerManager = createTimerManager();
  const eventManager = createEventManager(client, stateManager, logger);
  const syncManager = createSyncManager(client, stateManager, logger);

  // Indexer state
  let isRunning = false;

  /**
   * Get current indexer state
   */
  const getState = (): IndexerState & { readonly isRunning: boolean } => ({
    ...stateManager.getState(),
    isRunning
  });

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

      // Start processing timer
      timerManager.setIntervalTimer(
        'processing',
        async () => {
          try {
            await eventManager.processNewEvents();
          } catch (error) {
            console.error('[Indexer] Error in processing timer:', error);
          }
        },
        options.processingInterval || 60000 // 1 minute default
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
      // Stop processing timer
      timerManager.clearTimer('processing');

      // Save current state
      await stateManager.saveState();

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
   * Process new events (manual trigger)
   */
  const processNewEvents = async (): Promise<void> => {
    console.log('[Indexer] Processing new events');
    await eventManager.processNewEvents();
    console.log('[Indexer] Event processing completed');
  };

  /**
   * Get processing statistics
   */
  const getStats = (): EventProcessingStats => {
    return logger.getStats();
  };

  /**
   * Reset statistics
   */
  const resetStats = (): void => {
    logger.resetStats();
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
    processNewEvents,
    cleanup,
    
    // State and stats
    getState,
    getStats,
    resetStats,
    
    // Direct access to components (for advanced usage)
    client,
    stateManager,
    logger,
    timerManager,
    eventManager,
    syncManager
  };
}

    console.log('[Indexer] Starting indexer service');
    isRunning = true;
    stateManager.updateState({ isRunning: true });

    try {
      // Load previous state if available
      await stateManager.loadState();

      // Start processing timer
      processingTimer = timerManager.startProcessingTimer(
        options.processingInterval || 60000, // 1 minute default
        async () => {
          try {
            await eventProcessor.processNewEvents();
          } catch (error) {
            console.error('[Indexer] Error in processing timer:', error);
          }
        },
      );

      console.log('[Indexer] Indexer service started successfully');
    } catch (error) {
      console.error('[Indexer] Failed to start indexer:', error);
      isRunning = false;
      stateManager.updateState({ isRunning: false });
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
    stateManager.updateState({ isRunning: false });

    try {
      // Stop processing timer
      if (processingTimer) {
        timerManager.stopProcessingTimer(processingTimer);
        processingTimer = null;
      }

      // Save current state
      await stateManager.saveState();

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
   * Process new events (manual trigger)
   */
  const processNewEvents = async (): Promise<void> => {
    console.log('[Indexer] Processing new events');
    await eventProcessor.processNewEvents();
    console.log('[Indexer] Event processing completed');
  };

  /**
   * Get processing statistics
   */
  const getStats = (): EventProcessingStats => {
    return logger.getStats();
  };

  /**
   * Reset statistics
   */
  const resetStats = (): void => {
    logger.resetStats();
  };

  /**
   * Cleanup resources
   */
  const cleanup = async (): Promise<void> => {
    await stop();
    // Additional cleanup if needed
  };

  return {
    // Core methods
    start,
    stop,
    fullSync,
    processNewEvents,
    cleanup,

    // State and stats
    getState,
    getStats,
    resetStats,

    // Direct access to components (for advanced usage)
    client,
    stateManager,
    logger,
    timerManager,
    eventProcessor,
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
export * from './composables';
