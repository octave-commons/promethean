/**
 * Indexer Service - Main indexing service using composables
 *
 * This service provides the main indexing functionality for OpenCode data,
 * built using composable functions for better maintainability and testability.
 */

import type { IndexerState, OpencodeClient } from './indexer-types.js';
import type {
  StateManager,
  LoggerManager,
  TimerManager,
  EventStreamManager,
  SyncManager,
} from './composables/index.js';

import {
  createStateManagerComposable,
  createLoggerComposable,
  createTimerManager,
  createEventManager,
  createSyncManager,
} from './composables/index.js';
import { createOpencodeClient } from '@opencode-ai/sdk';

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

export type IndexerService = {
  readonly start: () => Promise<void>;
  readonly stop: () => Promise<void>;
  readonly fullSync: () => Promise<void>;
  readonly cleanup: () => Promise<void>;
  readonly getState: () => Promise<IndexerState & { readonly isRunning: boolean }>;
  readonly getStats: () => EventProcessingStats;
  readonly resetStats: () => void;
  readonly client: OpencodeClient;
  readonly stateManager: StateManager;
  readonly loggerManager: LoggerManager;
  readonly timerManager: TimerManager;
  readonly eventManager: EventStreamManager;
  readonly syncManager: SyncManager;
};

/**
 * Create indexer components
 */
const createIndexerComponents = (options: IndexerOptions = {}) => {
  const client = createOpencodeClient({
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

  return {
    client,
    stateManager,
    loggerManager,
    timerManager,
    eventManager,
    syncManager,
  };
};

/**
 * Create indexer state management
 */
const createIndexerState = () => {
  const isRunningRef = { value: false };

  const getState = async (
    stateManager: StateManager,
  ): Promise<IndexerState & { readonly isRunning: boolean }> => {
    const state = await stateManager.loadState();
    return {
      ...state,
      isRunning: isRunningRef.value,
    };
  };

  const setRunning = (running: boolean): void => {
    isRunningRef.value = running;
  };

  const getIsRunning = (): boolean => isRunningRef.value;

  return { getState, setRunning, getIsRunning };
};

/**
 * Start indexer service
 */
const startIndexerService = async (
  components: ReturnType<typeof createIndexerComponents>,
  state: ReturnType<typeof createIndexerState>,
  options: IndexerOptions = {},
): Promise<void> => {
  if (state.getIsRunning()) {
    console.warn('[Indexer] Already running');
    return;
  }

  console.log('[Indexer] Starting indexer service');
  state.setRunning(true);

  try {
    // Load previous state if available
    await components.stateManager.loadState();

    // Start event subscription for real-time processing
    await components.eventManager.startSubscription();

    // Start periodic full sync timer
    components.timerManager.setIntervalTimer(
      'fullSync',
      async () => {
        try {
          await components.syncManager.performFullSync();
        } catch (error) {
          console.error('[Indexer] Error in full sync timer:', error);
        }
      },
      (options.processingInterval || 60000) * 60, // Every hour by default
    );

    console.log('[Indexer] Indexer service started successfully');
  } catch (error) {
    console.error('[Indexer] Failed to start indexer:', error);
    state.setRunning(false);
    throw error;
  }
};

/**
 * Stop indexer service
 */
const stopIndexer = async (
  components: ReturnType<typeof createIndexerComponents>,
  state: ReturnType<typeof createIndexerState>,
): Promise<void> => {
  if (!state.getIsRunning()) {
    console.warn('[Indexer] Not running');
    return;
  }

  console.log('[Indexer] Stopping indexer service');
  state.setRunning(false);

  try {
    // Stop event subscription
    await components.eventManager.stopSubscription();

    // Stop timers
    components.timerManager.clearTimer('fullSync');

    // Flush any pending logs
    components.loggerManager.flush();

    // Save current state
    const currentState = await components.stateManager.loadState();
    await components.stateManager.saveState(currentState);

    console.log('[Indexer] Indexer service stopped successfully');
  } catch (error) {
    console.error('[Indexer] Error stopping indexer:', error);
    throw error;
  }
};

/**
 * Get processing statistics (simplified version)
 */
const getIndexerStats = (): EventProcessingStats => ({
  totalEvents: 0,
  dedupedEvents: 0,
  processedEvents: 0,
  errors: 0,
});

/**
 * Create a configured indexer service
 */
export const createIndexerService = (options: IndexerOptions = {}): IndexerService => {
  const components = createIndexerComponents(options);
  const state = createIndexerState();

  return {
    start: () => startIndexerService(components, state, options),
    stop: () => stopIndexer(components, state),
    fullSync: async (): Promise<void> => {
      console.log('[Indexer] Starting full sync');
      await components.syncManager.performFullSync();
      console.log('[Indexer] Full sync completed');
    },
    cleanup: async (): Promise<void> => {
      await stopIndexer(components, state);
      components.timerManager.clearAllTimers();
    },
    getState: async () => state.getState(components.stateManager),
    getStats: getIndexerStats,
    resetStats: (): void => {
      console.log('[Indexer] Statistics reset');
    },
    ...components,
  };
};

/**
 * Create and start an indexer service with default options
 */
export const createAndStartIndexer = async (
  options: IndexerOptions = {},
): Promise<IndexerService> => {
  const indexer = createIndexerService(options);
  await indexer.start();
  return indexer;
};

/**
 * Default indexer instance for simple usage
 */
const defaultIndexerRef = { value: null as IndexerService | null };

/**
 * Get or create the default indexer instance
 */
export const getDefaultIndexer = (options?: IndexerOptions): IndexerService => {
  if (!defaultIndexerRef.value) {
    defaultIndexerRef.value = createIndexerService(options);
  }
  return defaultIndexerRef.value;
};

/**
 * Start the default indexer instance
 */
export const startDefaultIndexer = async (options?: IndexerOptions): Promise<IndexerService> => {
  const indexer = getDefaultIndexer(options);
  await indexer.start();
  return indexer;
};

/**
 * Stop the default indexer instance
 */
export const stopDefaultIndexer = async (): Promise<void> => {
  if (defaultIndexerRef.value) {
    await defaultIndexerRef.value.stop();
  }
};

// Re-export composables for direct usage
export * from './composables/index.js';
