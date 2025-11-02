// SPDX-License-Identifier: GPL-3.0-only
// Real-time Indexing Plugin
// Provides real-time message, session, and event indexing capabilities

import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin/tool';

import { createOpencodeClient } from '@opencode-ai/sdk';
import {
  createStateManagerComposable,
  createLoggerComposable,
  createTimerManager,
  createEventManager,
  createSyncManager,
} from '../../services/composables/index.js';

/**
 * Create indexing state
 */
const createIndexingState = () => {
  const stateRef = {
    isIndexing: false,
    startTime: null as Date | null,
    eventsCount: 0,
    errorsCount: 0,
  };

  const getState = () => ({ ...stateRef });
  const setIndexing = (isIndexing: boolean) => {
    stateRef.isIndexing = isIndexing;
  };
  const setStartTime = (startTime: Date | null) => {
    stateRef.startTime = startTime;
  };
  const incrementEvents = () => {
    stateRef.eventsCount += 1;
  };
  const incrementErrors = () => {
    stateRef.errorsCount += 1;
  };
  const resetStats = () => {
    stateRef.eventsCount = 0;
    stateRef.errorsCount = 0;
  };

  return { getState, setIndexing, setStartTime, incrementEvents, incrementErrors, resetStats };
};

/**
 * Create plugin components
 */
const createPluginComponents = () => {
  const client = createOpencodeClient({ baseUrl: 'http://localhost:4096' });
  const stateManager = createStateManagerComposable({ stateFile: './realtime-indexer-state.json' });
  const loggerManager = createLoggerComposable();
  const timerManager = createTimerManager();

  const eventManager = createEventManager(
    client,
    { reconnectDelayMs: 5000, maxConsecutiveErrors: 5 },
    stateManager,
    loggerManager.logger,
    timerManager,
  );

  const syncManager = createSyncManager(
    client,
    { fullSyncIntervalMs: 300000 },
    stateManager,
    loggerManager.logger,
  );

  return { client, stateManager, loggerManager, timerManager, eventManager, syncManager };
};

/**
 * Stop indexing service
 */
const stopIndexingService = async (components: any, state: any): Promise<void> => {
  if (!state.getState().isIndexing) {
    throw new Error('No active real-time indexing to stop');
  }

  console.log('🛑 Stopping real-time indexing service');
  state.setIndexing(false);

  try {
    await components.eventManager.stopSubscription();
    components.timerManager.clearTimer('realtimeFullSync');
    components.loggerManager.flush();

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
 * Real-time Indexing Plugin
 */
export const RealtimeCapturePlugin: Plugin = async (_pluginContext) => {
  const components = createPluginComponents();
  const state = createIndexingState();

  return {
    tool: {
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
    },

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

export { RealtimeCapturePlugin as default };
