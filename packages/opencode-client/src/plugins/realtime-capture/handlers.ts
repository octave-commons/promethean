// SPDX-License-Identifier: GPL-3.0-only
// Real-time Indexing Plugin - Tool Handlers

import { tool } from '@opencode-ai/plugin/tool';
import type {
  StateManager,
  LoggerManager,
  TimerManager,
  EventStreamManager,
  SyncManager,
} from '../../services/composables/index.js';

import type { OpenCodeClient } from '../../services/indexer-types.js';

type PluginComponents = {
  readonly client: OpenCodeClient;
  readonly stateManager: StateManager;
  readonly loggerManager: LoggerManager;
  readonly timerManager: TimerManager;
  readonly eventManager: EventStreamManager;
  readonly syncManager: SyncManager;
};

type IndexingState = {
  readonly isIndexing: boolean;
  readonly startTime: Date | null;
  readonly eventsCount: number;
  readonly errorsCount: number;
};

type StateManager = {
  readonly getState: () => IndexingState;
  readonly setIndexing: (isIndexing: boolean) => void;
  readonly setStartTime: (startTime: Date | null) => void;
  readonly incrementEvents: () => void;
  readonly incrementErrors: () => void;
  readonly resetStats: () => void;
};

/**
 * Get indexed data helper
 */
const getIndexedData = async (
  client: OpenCodeClient,
  stateManager: StateManager,
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

/**
 * Create start indexing handler
 */
const createStartHandler = (
  components: PluginComponents,
  state: StateManager,
  startIndexingService: (components: PluginComponents, state: StateManager) => Promise<void>,
) =>
  tool({
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
  });

/**
 * Create stop indexing handler
 */
const createStopHandler = (
  components: PluginComponents,
  state: StateManager,
  stopIndexingService: (components: PluginComponents, state: StateManager) => Promise<void>,
) =>
  tool({
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
  });

/**
 * Create status handler
 */
const createStatusHandler = (components: PluginComponents, state: StateManager) =>
  tool({
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
  });

/**
 * Create get data handler
 */
const createGetDataHandler = (components: PluginComponents) =>
  tool({
    description: 'Get indexed data (sessions, messages, or events info)',
    args: {
      type: tool.schema
        .enum(['sessions', 'messages', 'events'])
        .describe('Type of data to retrieve'),
      limit: tool.schema.number().default(50).describe('Number of items to return'),
    },
    async execute(args) {
      try {
        const result = await getIndexedData(
          components.client,
          components.stateManager,
          args.type,
          args.limit,
        );
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
  });

/**
 * Create full sync handler
 */
const createFullSyncHandler = (components: PluginComponents) =>
  tool({
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
  });

/**
 * Create stats handler
 */
const createStatsHandler = (components: PluginComponents, state: StateManager) =>
  tool({
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
  });

/**
 * Create all tool handlers
 */
export const createToolHandlers = (
  components: PluginComponents,
  state: StateManager,
  startIndexingService: (components: PluginComponents, state: StateManager) => Promise<void>,
  stopIndexingService: (components: PluginComponents, state: StateManager) => Promise<void>,
) => ({
  'start-realtime-indexing': createStartHandler(components, state, startIndexingService),
  'stop-realtime-indexing': createStopHandler(components, state, stopIndexingService),
  'get-indexing-status': createStatusHandler(components, state),
  'get-indexed-data': createGetDataHandler(components),
  'trigger-full-sync': createFullSyncHandler(components),
  'get-indexing-stats': createStatsHandler(components, state),
});
