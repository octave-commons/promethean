// SPDX-License-Identifier: GPL-3.0-only
// Higher-order functions for composing indexer functionality

import { join } from 'path';
import type { Event } from '@opencode-ai/sdk';

import type { IndexerState, OpenCodeClient, EventSubscription } from './indexer-types.js';
import { createStateManager } from './indexer-types.js';
import { createIndexingOperations } from './indexer-operations.js';

// Configuration types
export type IndexerConfig = {
  readonly baseUrl: string;
  readonly stateFile?: string;
  readonly stateSaveIntervalMs?: number;
  readonly reconnectDelayMs?: number;
  readonly maxConsecutiveErrors?: number;
  readonly fullSyncIntervalMs?: number;
  readonly maxCapturedEvents?: number;
};

export type IndexerContext = {
  readonly client: OpenCodeClient;
  readonly config: Required<IndexerConfig>;
  readonly stateManager: {
    readonly loadState: () => Promise<Readonly<IndexerState>>;
    readonly saveState: (state: Readonly<IndexerState>) => Promise<void>;
  };
  readonly indexingOps: ReturnType<typeof createIndexingOperations>;
};

export type EventLogger = (eventType: string, message: string) => void;

// 1. Client Factory
export const createClient = (baseUrl: string): OpenCodeClient => {
  const { createOpencodeClient } = require('@opencode-ai/sdk');
  return createOpencodeClient({ baseUrl }) as OpenCodeClient;
};

// 2. State Manager Factory
export const createStateManagerFactory = (stateFile: string) => {
  const { loadState, saveState } = createStateManager(stateFile);
  return { loadState, saveState };
};

// 3. Event Logger Factory
export const createEventLogger = (): {
  logger: EventLogger;
  flush: () => void;
} => {
  let previousEventType: string | undefined;
  let consecutiveEventCount = 0;
  let pendingEventLog: string | undefined;

  const logger = (eventType: string, message: string): void => {
    // If this is the same event type as before, just increment counter
    if (previousEventType === eventType) {
      consecutiveEventCount++;
      return;
    }

    // If we have a pending event from a different type, log it with count
    if (previousEventType && pendingEventLog) {
      const count = consecutiveEventCount > 1 ? ` (${consecutiveEventCount}x)` : '';
      console.log(`${pendingEventLog}${count}`);
    }

    // Set up new event as pending
    previousEventType = eventType;
    consecutiveEventCount = 1;
    pendingEventLog = message;
  };

  const flush = (): void => {
    if (previousEventType && pendingEventLog) {
      const count = consecutiveEventCount > 1 ? ` (${consecutiveEventCount}x)` : '';
      console.log(`${pendingEventLog}${count}`);
    }
    previousEventType = undefined;
    consecutiveEventCount = 0;
    pendingEventLog = undefined;
  };

  return { logger, flush };
};

// 4. Timer Management Factory
export const createTimerManager = () => {
  const timers: Map<string, NodeJS.Timeout> = new Map();

  const setTimer = (name: string, callback: () => void, delayMs: number): void => {
    clearTimer(name);
    const timer = setTimeout(callback, delayMs);
    timers.set(name, timer);
  };

  const setIntervalTimer = (name: string, callback: () => void, intervalMs: number): void => {
    clearTimer(name);
    const timer = setInterval(callback, intervalMs);
    timers.set(name, timer);
  };

  const clearTimer = (name: string): void => {
    const timer = timers.get(name);
    if (timer) {
      clearTimeout(timer);
      clearInterval(timer);
      timers.delete(name);
    }
  };

  const clearAllTimers = (): void => {
    timers.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    timers.clear();
  };

  return { setTimer, setIntervalTimer, clearTimer, clearAllTimers };
};

// 5. Event Stream Handler Factory
export const createEventStreamHandler = (context: IndexerContext) => {
  const { client, config, stateManager, indexingOps } = context;
  const {
    isMessageEvent,
    isSessionEvent,
    extractSessionId,
    extractMessageId,
  } = require('./indexer-types.js');

  let subscription: EventSubscription | undefined;
  let consecutiveErrors = 0;

  const handleEvent = async (event: Event): Promise<void> => {
    try {
      if (isMessageEvent(event)) {
        await handleMessageEvent(event);
      } else if (isSessionEvent(event)) {
        await handleSessionEvent(event);
      }

      // Index the event after handling
      await indexingOps.indexEvent(event);

      // Reset error count on successful processing
      if (consecutiveErrors > 0) {
        consecutiveErrors = 0;
        const state = await stateManager.loadState();
        await stateManager.saveState({ ...state, consecutiveErrors: 0 });
      }
    } catch (error) {
      console.error('❌ Error handling event:', error);
      await handleStreamError(error);
    }
  };

  const handleMessageEvent = async (event: Event): Promise<void> => {
    const sessionId = extractSessionId(event);
    if (!sessionId) {
      console.warn('⚠️ Message event without session ID:', event);
      return;
    }

    const messageId = extractMessageId(event);
    if (!messageId) {
      console.warn('⚠️ Message event without message ID:', event);
      return;
    }

    // Only fetch and index when message is complete, not for every part update
    if (event.type === 'message.updated' || event.type === 'message.removed') {
      const messageResult = await client.session.message({
        path: { id: sessionId, messageID: messageId },
      });
      const targetMessage = messageResult.data;

      if (targetMessage) {
        await indexingOps.indexMessage(targetMessage, sessionId);

        const state = await stateManager.loadState();
        await stateManager.saveState({ ...state, lastIndexedMessageId: messageId });

        indexingOps.logEventDeduped(
          `event_indexed_${event.type}`,
          `📝 Indexed message ${messageId} for session ${sessionId}`,
        );
      }
    } else {
      indexingOps.logEventDeduped(
        `event_indexed_${event.type}`,
        `🔄 Skipping indexing for part update of message ${messageId} in session ${sessionId}`,
      );
    }
  };

  const handleSessionEvent = async (event: Event): Promise<void> => {
    indexingOps.logEventDeduped(
      `event_indexed_${event.type}`,
      `🎯 Processing session event: ${event.type}`,
    );

    if ('properties' in event && event.properties) {
      const sessionInfo = (event.properties as any).info;
      if (sessionInfo) {
        await indexingOps.indexSession(sessionInfo);

        const state = await stateManager.loadState();
        await stateManager.saveState({ ...state, lastIndexedSessionId: sessionInfo.id });

        indexingOps.logEventDeduped(
          `event_indexed_${event.type}`,
          `📝 Indexed session ${sessionInfo.id} with title "${sessionInfo.title}"`,
        );
      }
    }
  };

  const handleStreamError = async (error: unknown): Promise<void> => {
    consecutiveErrors++;

    const state = await stateManager.loadState();
    const newState = {
      ...state,
      subscriptionActive: false,
      consecutiveErrors,
    };
    await stateManager.saveState(newState);

    if (consecutiveErrors >= config.maxConsecutiveErrors) {
      console.error(
        `🛑 Stopping event subscription after ${config.maxConsecutiveErrors} consecutive errors`,
      );
      return;
    }

    console.log(`🔄 Attempting to reconnect in ${config.reconnectDelayMs / 1000} seconds`);

    // Schedule reconnection
    setTimeout(async () => {
      try {
        await startSubscription();
      } catch (reconnectError) {
        console.error('❌ Failed to reconnect:', reconnectError);
      }
    }, config.reconnectDelayMs);
  };

  const startSubscription = async (): Promise<void> => {
    if (typeof client.event?.subscribe !== 'function') {
      throw new Error('This SDK/server does not support event.subscribe()');
    }

    const sub = await client.event.subscribe();
    subscription = sub;

    const state = await stateManager.loadState();
    await stateManager.saveState({
      ...state,
      subscriptionActive: true,
      consecutiveErrors: 0,
    });

    console.log('📡 Subscribed to OpenCode events');

    // Start processing events
    (async () => {
      try {
        for await (const event of sub.stream) {
          await handleEvent(event);
        }
      } catch (streamError) {
        await handleStreamError(streamError);
      }
    })();
  };

  const stopSubscription = async (): Promise<void> => {
    if (subscription) {
      try {
        if (typeof subscription.close === 'function') {
          await subscription.close();
        }
      } catch (error) {
        console.warn('Warning: Could not cleanly close event subscription:', error);
      }
      subscription = undefined;
    }

    const state = await stateManager.loadState();
    await stateManager.saveState({ ...state, subscriptionActive: false });
  };

  return {
    startSubscription,
    stopSubscription,
    isActive: () => !!subscription,
  };
};

// 6. Sync Operations Factory
export const createSyncOperations = (context: IndexerContext) => {
  const { client, config, stateManager, indexingOps } = context;

  const performFullSync = async (): Promise<void> => {
    try {
      indexingOps.logEventDeduped(
        'sync_full',
        '🔍 Performing full sync to ensure no messages are missed',
      );

      const sessionsResult = await client.session.list();
      const sessions = sessionsResult.data ?? [];

      let totalMessagesProcessed = 0;

      for (const session of sessions) {
        const messagesResult = await client.session.messages({
          path: { id: session.id },
        });
        const messages = messagesResult.data ?? [];

        const state = await stateManager.loadState();
        const messagesToProcess = state.lastFullSyncTimestamp
          ? messages.filter(
              (msg: any) => (msg.info?.time?.created ?? 0) > state.lastFullSyncTimestamp!,
            )
          : messages;

        await Promise.all(
          messagesToProcess.map(async (message: any) => {
            await indexingOps.indexMessage(message, session.id);
            totalMessagesProcessed++;
          }),
        );
      }

      if (totalMessagesProcessed > 0) {
        indexingOps.logEventDeduped(
          'sync_full_complete',
          `✅ Full sync processed ${totalMessagesProcessed} messages`,
        );
      }

      const state = await stateManager.loadState();
      await stateManager.saveState({
        ...state,
        lastFullSyncTimestamp: Date.now(),
        consecutiveErrors: 0,
      });
    } catch (error) {
      console.error('❌ Error during full sync:', error);
      const state = await stateManager.loadState();
      await stateManager.saveState({
        ...state,
        consecutiveErrors: (state.consecutiveErrors ?? 0) + 1,
      });
    }
  };

  const indexNewData = async (): Promise<void> => {
    try {
      indexingOps.logEventDeduped(
        'sync_indexing_check',
        '📚 Checking for new sessions and messages',
      );

      const sessionsResult = await client.session.list();
      const sessions = sessionsResult.data ?? [];

      const state = await stateManager.loadState();
      const startIndex = state.lastIndexedSessionId
        ? sessions.findIndex((s: any) => s.id === state.lastIndexedSessionId) + 1
        : 0;

      const newSessions = sessions.slice(startIndex);

      for (const session of newSessions) {
        await indexingOps.indexSession(session);

        let currentState = await stateManager.loadState();
        await stateManager.saveState({ ...currentState, lastIndexedSessionId: session.id });

        // Process messages for this session
        const messagesResult = await client.session.messages({
          path: { id: session.id },
        });
        const messages = messagesResult.data ?? [];

        await Promise.all(
          messages.map(async (message: any) => {
            await indexingOps.indexMessage(message, session.id);
          }),
        );

        // Save state after processing each session
        currentState = await stateManager.loadState();
        await stateManager.saveState(currentState);
      }

      if (newSessions.length > 0) {
        indexingOps.logEventDeduped(
          'sync_sessions_indexed',
          `✅ Indexed ${newSessions.length} new sessions`,
        );
      } else {
        indexingOps.logEventDeduped('sync_no_new_sessions', '✅ No new sessions to index');
      }
    } catch (error) {
      console.error('❌ Error indexing new data:', error);
    }
  };

  return {
    performFullSync,
    indexNewData,
  };
};

// 7. Context Factory
export const createIndexerContext = (config: IndexerConfig): IndexerContext => {
  const client = createClient(config.baseUrl);
  const stateFile = config.stateFile || join(process.cwd(), '.indexer-state.json');
  const stateManager = createStateManagerFactory(stateFile);
  const { logger } = createEventLogger();
  const indexingOps = createIndexingOperations(logger);

  const fullConfig: Required<IndexerConfig> = {
    baseUrl: config.baseUrl,
    stateFile,
    stateSaveIntervalMs: config.stateSaveIntervalMs || 30000,
    reconnectDelayMs: config.reconnectDelayMs || 5000,
    maxConsecutiveErrors: config.maxConsecutiveErrors || 5,
    fullSyncIntervalMs: config.fullSyncIntervalMs || 300000,
    maxCapturedEvents: config.maxCapturedEvents || 1000,
  };

  return {
    client,
    config: fullConfig,
    stateManager,
    indexingOps,
  };
};
