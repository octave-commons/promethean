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

/**
 * Real-time Indexing Plugin - Provides real-time indexing of OpenCode events
 * This plugin actually indexes data like the main indexer, not just captures it
 */
export const RealtimeCapturePlugin: Plugin = async (_pluginContext) => {
  // Create indexer components for real-time indexing
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

  // Real-time indexing state
  let isIndexing = false;
  let indexingStartTime: Date | null = null;
  let indexedEventsCount = 0;
  let indexingErrors = 0;

  const startIndexing = async (): Promise<void> => {
    if (isIndexing) {
      throw new Error('Real-time indexing is already active');
    }

    try {
      console.log('🚀 Starting real-time indexing service');
      isIndexing = true;
      indexingStartTime = new Date();
      indexedEventsCount = 0;
      indexingErrors = 0;

      // Load previous state
      await stateManager.loadState();

      // Start event subscription for real-time indexing
      await eventManager.startSubscription();

      // Start periodic full sync to catch any missed events
      timerManager.setIntervalTimer(
        'realtimeFullSync',
        async () => {
          try {
            console.log('🔄 Running periodic full sync from realtime plugin');
            await syncManager.performFullSync();
          } catch (error) {
            console.error('❌ Error in realtime full sync:', error);
            indexingErrors++;
          }
        },
        300000, // Every 5 minutes
      );

      console.log('✅ Real-time indexing service started successfully');
    } catch (error) {
      isIndexing = false;
      console.error('❌ Failed to start real-time indexing:', error);
      throw error;
    }
  };

  const stopIndexing = async (): Promise<void> => {
    if (!isIndexing) {
      throw new Error('No active real-time indexing to stop');
    }

    console.log('🛑 Stopping real-time indexing service');
    isIndexing = false;

    try {
      // Stop event subscription
      await eventManager.stopSubscription();

      // Stop timers
      timerManager.clearTimer('realtimeFullSync');

      // Flush any pending logs
      loggerManager.flush();

      // Save current state
      const currentState = await stateManager.loadState();
      await stateManager.saveState(currentState);

      const duration = indexingStartTime
        ? Math.round((Date.now() - indexingStartTime.getTime()) / 1000)
        : 0;

      console.log(
        `✅ Real-time indexing stopped. Indexed ${indexedEventsCount} events with ${indexingErrors} errors in ${duration}s`,
      );
    } catch (error) {
      console.error('❌ Error stopping real-time indexing:', error);
      throw error;
    }
  };

  const getIndexedData = async (
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
          // Get recent sessions and their messages
          const sessionsList = await client.session.list();
          const allMessages: any[] = [];

          for (const session of sessionsList.data.slice(0, 10)) {
            // Limit to 10 most recent sessions
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
          // Events are not directly listable, so we return state info
          const state = await stateManager.loadState();
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

  return {
    tool: {
      'start-realtime-indexing': tool({
        description: 'Start real-time indexing of OpenCode events, messages, and sessions',
        args: {},
        async execute() {
          try {
            await startIndexing();
            return JSON.stringify(
              {
                success: true,
                message: '✅ Real-time indexing started successfully',
                startTime: indexingStartTime?.toISOString(),
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
            await stopIndexing();

            const duration = indexingStartTime
              ? Math.round((Date.now() - indexingStartTime.getTime()) / 1000)
              : 0;

            const summary = {
              success: true,
              message: '🛑 Real-time indexing stopped',
              eventsIndexed: indexedEventsCount,
              errors: indexingErrors,
              duration,
              startTime: indexingStartTime?.toISOString(),
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
            const state = await stateManager.loadState();
            const duration = indexingStartTime
              ? Math.round((Date.now() - indexingStartTime.getTime()) / 1000)
              : 0;

            return JSON.stringify(
              {
                isIndexing,
                startTime: indexingStartTime?.toISOString(),
                duration,
                eventsIndexed: indexedEventsCount,
                errors: indexingErrors,
                subscriptionActive: eventManager.isActive(),
                lastIndexedSessionId: state.lastIndexedSessionId,
                lastIndexedMessageId: state.lastIndexedMessageId,
                lastEventTimestamp: state.lastEventTimestamp,
                lastFullSyncTimestamp: state.lastFullSyncTimestamp,
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
            const result = await getIndexedData(args.type, args.limit);
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
            await syncManager.performFullSync();

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
            const state = await stateManager.loadState();

            return JSON.stringify(
              {
                success: true,
                stats: {
                  isIndexing,
                  uptime: indexingStartTime
                    ? Math.round((Date.now() - indexingStartTime.getTime()) / 1000)
                    : 0,
                  eventsProcessed: indexedEventsCount,
                  errors: indexingErrors,
                  subscriptionActive: eventManager.isActive(),
                  lastIndexedSessionId: state.lastIndexedSessionId,
                  lastIndexedMessageId: state.lastIndexedMessageId,
                  lastEventTimestamp: state.lastEventTimestamp,
                  lastFullSyncTimestamp: state.lastFullSyncTimestamp,
                  consecutiveErrors: state.consecutiveErrors || 0,
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
    },

    // Plugin lifecycle hooks
    async event() {
      // Track plugin-level events for indexing stats
      if (isIndexing) {
        indexedEventsCount++;
      }
    },

    // Cleanup on plugin unload
    async unload() {
      if (isIndexing) {
        await stopIndexing();
      }
      timerManager.clearAllTimers();
    },
  };
};

export default RealtimeCapturePlugin;
