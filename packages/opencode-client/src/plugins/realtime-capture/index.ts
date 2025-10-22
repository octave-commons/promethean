// SPDX-License-Identifier: GPL-3.0-only
// Real-time Indexing Plugin
// Provides real-time message, session, and event indexing capabilities

import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin/tool';

import {
  createClient,
  createStateManagerComposable,
  createLoggerComposable,
  createTimerManager,
  createEventManager,
  createSyncManager,
} from '../../services/composables/index.js';

// Additional types
type IndexingState = {
  readonly isIndexing: boolean;
  readonly startTime: Date | null;
  readonly eventsCount: number;
  readonly errorsCount: number;
};

/**
 * Create indexing state management
 */
const createIndexingState = () => {
  const stateRef = {
    isIndexing: false,
    startTime: null as Date | null,
    eventsCount: 0,
    errorsCount: 0,
  };

  const getState = (): IndexingState => ({ ...stateRef });

  const setIndexing = (isIndexing: boolean): void => {
    stateRef.isIndexing = isIndexing;
  };

  const setStartTime = (startTime: Date | null): void => {
    stateRef.startTime = startTime;
  };

  const incrementEvents = (): void => {
    stateRef.eventsCount += 1;
  };

  const incrementErrors = (): void => {
    stateRef.errorsCount += 1;
  };

  const resetStats = (): void => {
    stateRef.eventsCount = 0;
    stateRef.errorsCount = 0;
  };

  return {
    getState,
    setIndexing,
    setStartTime,
    incrementEvents,
    incrementErrors,
    resetStats,
  };
};

/**
 * Create indexer components for plugin
 */
const createPluginComponents = () => {
  const client = createClient({
    baseUrl: 'http://localhost:4096',
  });

  const stateManager = createStateManagerComposable({
    stateFile: './realtime-indexer-state.json',
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
      fullSyncIntervalMs: 300000, // 5 minutes
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
 * Start indexing service
 */
const startIndexingService = async (
  components: ReturnType<typeof createPluginComponents>,
  state: ReturnType<typeof createIndexingState>,
): Promise<void> => {
  if (state.getState().isIndexing) {
    throw new Error('Real-time indexing is already active');
  }

  console.log('🚀 Starting real-time indexing service');
  state.setIndexing(true);
  state.setStartTime(new Date());
  state.resetStats();

  try {
    // Load previous state
    await components.stateManager.loadState();

    // Start event subscription
    await components.eventManager.startSubscription();

    // Start periodic full sync
    components.timerManager.setIntervalTimer(
      'realtimeFullSync',
      async () => {
        try {
          console.log('🔄 Running periodic full sync from realtime plugin');
          await components.syncManager.performFullSync();
        } catch (error) {
          console.error('❌ Error in realtime full sync:', error);
          state.incrementErrors();
        }
      },
      300000, // Every 5 minutes
    );

    console.log('✅ Real-time indexing service started successfully');
  } catch (error) {
    state.setIndexing(false);
    console.error('❌ Failed to start real-time indexing:', error);
    throw error;
  }
};

/**
 * Stop indexing service
 */
const stopIndexingService = async (
  components: ReturnType<typeof createPluginComponents>,
  state: ReturnType<typeof createIndexingState>,
): Promise<void> => {
  if (!state.getState().isIndexing) {
    throw new Error('No active real-time indexing to stop');
  }

  console.log('🛑 Stopping real-time indexing service');
  state.setIndexing(false);

  try {
    // Stop event subscription
    await components.eventManager.stopSubscription();

    // Stop timers
    components.timerManager.clearTimer('realtimeFullSync');

    // Flush logs
    components.loggerManager.flush();

    // Save state
    const currentState = await components.stateManager.loadState();
    await components.stateManager.saveState(currentState);

    const currentStateInfo = state.getState();
    const duration = currentStateInfo.startTime
      ? Math.round((Date.now() - currentStateInfo.startTime.getTime()) / 1000)
      : 0;

    console.log(
      `✅ Real-time indexing stopped. Indexed ${currentStateInfo.eventsCount} events with ${currentStateInfo.errorsCount} errors in ${duration}s`,
    );
  } catch (error) {
    console.error('❌ Error stopping real-time indexing:', error);
    throw error;
  }
};

/**
 * Get indexed data
 */
const getIndexedData = async (
  client: any,
  dataType: 'sessions' | 'messages' | 'events',
  limit: number = 50,
) => {
  try {
    switch (dataType) {
      case 'sessions':
        const sessionsResult = await client.session.list();
        return {
          success: true,
          data: sessionsResult.data.slice(0, limit),
          total: sessionsResult.data.length,
        };

      case 'messages':
        const sessionsList = await client.session.list();
        const allMessages: any[] = [];

        for (const session of sessionsList.data.slice(0, 10)) {
          try {
            const messagesResult = await client.session.messages({
              path: { id: session.id || '' },
            });
            allMessages.push(...messagesResult.data);
          } catch (error) {
            console.warn(`Could not fetch messages for session ${session.id}:`, error);
          }
        }

        return {
          success: true,
          data: allMessages.slice(0, limit),
          total: allMessages.length,
        };

      case 'events':
        const state = await client.stateManager.loadState();
        return {
          success: true,
          data: {
            lastIndexedSessionId: state.lastIndexedSessionId,
            lastIndexedMessageId: state.lastIndexedMessageId,
            lastEventTimestamp: state.lastEventTimestamp,
            lastFullSyncTimestamp: state.lastFullSyncTimestamp,
            subscriptionActive: state.subscriptionActive,
          },
          total: 1,
        };

      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Create tool handlers
 */
const createToolHandlers = (
  components: ReturnType<typeof createPluginComponents>,
  state: ReturnType<typeof createIndexingState>,
) => ({
  'start-realtime-indexing': tool({
    description: 'Start real-time indexing of OpenCode events, messages, and sessions',
    args: {},
    async execute() {
      try {
        await startIndexingService(components, state);
        return JSON.stringify(
          {
            success: true,
            message: '✅ Real-time indexing started successfully',
            startTime: state.getState().startTime?.toISOString(),
          },
          null,
          2,
        );
      } catch (error) {
        return JSON.stringify(
          {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          },
          null,
          2,
        );
      }
    },
  }),

  'stop-realtime-indexing': tool({
    description: 'Stop real-time indexing and get summary',
    args: {},
    async execute() {
      try {
        await stopIndexingService(components, state);

        const currentStateInfo = state.getState();
        const duration = currentStateInfo.startTime
          ? Math.round((Date.now() - currentStateInfo.startTime.getTime()) / 1000)
          : 0;

        const summary = {
          success: true,
          message: '🛑 Real-time indexing stopped',
          eventsIndexed: currentStateInfo.eventsCount,
          errors: currentStateInfo.errorsCount,
          duration,
          startTime: currentStateInfo.startTime?.toISOString(),
          endTime: new Date().toISOString(),
        };

        return JSON.stringify(summary, null, 2);
      } catch (error) {
        return JSON.stringify(
          {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          },
          null,
          2,
        );
      }
    },
  }),

  'get-indexing-status': tool({
    description: 'Get current status of real-time indexing',
    args: {},
    async execute() {
      try {
        const indexerState = await components.stateManager.loadState();
        const currentStateInfo = state.getState();
        const duration = currentStateInfo.startTime
          ? Math.round((Date.now() - currentStateInfo.startTime.getTime()) / 1000)
          : 0;

        return JSON.stringify(
          {
            isIndexing: currentStateInfo.isIndexing,
            startTime: currentStateInfo.startTime?.toISOString(),
            duration,
            eventsIndexed: currentStateInfo.eventsCount,
            errors: currentStateInfo.errorsCount,
            subscriptionActive: components.eventManager.isActive(),
            lastIndexedSessionId: indexerState.lastIndexedSessionId,
            lastIndexedMessageId: indexerState.lastIndexedMessageId,
            lastEventTimestamp: indexerState.lastEventTimestamp,
            lastFullSyncTimestamp: indexerState.lastFullSyncTimestamp,
          },
          null,
          2,
        );
      } catch (error) {
        return JSON.stringify(
          {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          },
          null,
          2,
        );
      }
    },
  }),

  'get-indexed-data': tool({
    description: 'Get indexed data (sessions, messages, or events info)',
    args: {
      type: tool.schema
        .enum(['sessions', 'messages', 'events'])
        .describe('Type of data to retrieve'),
      limit: tool.schema.number().default(50).describe('Number of items to return'),
    },
    async execute(args) {
      try {
        const result = await getIndexedData(components.client, args.type, args.limit);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify(
          {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          },
          null,
          2,
        );
      }
    },
  }),

  'trigger-full-sync': tool({
    description: 'Trigger a full sync to index any missed data',
    args: {},
    async execute() {
      try {
        console.log('🔄 Triggering manual full sync from realtime plugin');
        await components.syncManager.performFullSync();

        return JSON.stringify(
          {
            success: true,
            message: '✅ Full sync completed successfully',
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        );
      } catch (error) {
        return JSON.stringify(
          {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          },
          null,
          2,
        );
      }
    },
  }),

  'get-indexing-stats': tool({
    description: 'Get detailed indexing statistics',
    args: {},
    async execute() {
      try {
        const indexerState = await components.stateManager.loadState();
        const currentStateInfo = state.getState();

        return JSON.stringify(
          {
            success: true,
            stats: {
              isIndexing: currentStateInfo.isIndexing,
              uptime: currentStateInfo.startTime
                ? Math.round((Date.now() - currentStateInfo.startTime.getTime()) / 1000)
                : 0,
              eventsProcessed: currentStateInfo.eventsCount,
              errors: currentStateInfo.errorsCount,
              subscriptionActive: components.eventManager.isActive(),
              lastIndexedSessionId: indexerState.lastIndexedSessionId,
              lastIndexedMessageId: indexerState.lastIndexedMessageId,
              lastEventTimestamp: indexerState.lastEventTimestamp,
              lastFullSyncTimestamp: indexerState.lastFullSyncTimestamp,
              consecutiveErrors: indexerState.consecutiveErrors || 0,
            },
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        );
      } catch (error) {
        return JSON.stringify(
          {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          },
          null,
          2,
        );
      }
    },
  }),
});

/**
 * Real-time Indexing Plugin
 */
export const RealtimeCapturePlugin: Plugin = async (_pluginContext) => {
  const components = createPluginComponents();
  const state = createIndexingState();
  const toolHandlers = createToolHandlers(components, state);

  return {
    tool: toolHandlers,

    async event() {
      if (state.getState().isIndexing) {
        state.incrementEvents();
      }
    },

    async unload() {
      if (state.getState().isIndexing) {
        await stopIndexingService(components, state);
      }
      components.timerManager.clearAllTimers();
    },
  };
};

export default RealtimeCapturePlugin;
