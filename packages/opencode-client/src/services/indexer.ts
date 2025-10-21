import { join } from 'path';

import { createOpencodeClient } from '@opencode-ai/sdk';
import type { Session, Event } from '@opencode-ai/sdk';

import type { IndexerState, OpenCodeClient, EventSubscription } from './indexer-types.js';
import {
  createStateManager,
  isMessageEvent,
  isSessionEvent,
  extractSessionId,
  extractMessageId,
} from './indexer-types.js';
import { createIndexingOperations } from './indexer-operations.js';

export type IndexerService = {
  readonly start: () => Promise<void>;
  readonly stop: () => Promise<void>;
};

export const createIndexerService = (): IndexerService => {
  const client = createOpencodeClient({
    baseUrl: 'http://localhost:4096',
  }) as OpenCodeClient;

  const stateFile = join(process.cwd(), '.indexer-state.json');
  const { loadState, saveState } = createStateManager(stateFile);
  const { indexSession, indexMessage, indexEvent } = createIndexingOperations();

  let isRunning = false;
  let stateSaveTimer: NodeJS.Timeout | undefined;
  let reconnectTimer: NodeJS.Timeout | undefined;
  let eventSubscription: EventSubscription | undefined;
  const STATE_SAVE_INTERVAL_MS = 30000;
  const RECONNECT_DELAY_MS = 5000;
  const MAX_CONSECUTIVE_ERRORS = 5;
  const FULL_SYNC_INTERVAL_MS = 300000; // 5 minutes
  let state: IndexerState = {};

  // Event deduplication state
  let previousEventType: string | undefined;
  let consecutiveEventCount = 0;
  let pendingEventLog: string | undefined;

  const logEventDeduped = (eventType: string, message: string): void => {
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

  const flushPendingEventLog = (): void => {
    if (previousEventType && pendingEventLog) {
      const count = consecutiveEventCount > 1 ? ` (${consecutiveEventCount}x)` : '';
      console.log(`${pendingEventLog}${count}`);
    }
    previousEventType = undefined;
    consecutiveEventCount = 0;
    pendingEventLog = undefined;
  };

  const startPeriodicStateSave = (): void => {
    stateSaveTimer = setInterval(async () => {
      if (isRunning) {
        await saveState(state);
      }
    }, STATE_SAVE_INTERVAL_MS);
  };

  const startFullSyncTimer = (): void => {
    setInterval(async () => {
      if (isRunning) {
        await performFullSync();
      }
    }, FULL_SYNC_INTERVAL_MS);
  };

  const performFullSync = async (): Promise<void> => {
    try {
      logEventDeduped('full_sync', '🔍 Performing full sync to ensure no messages are missed');

      const sessionsResult = await client.session.list();
      const sessions = sessionsResult.data ?? [];

      let totalMessagesProcessed = 0;

      // Process all sessions to ensure we have complete coverage
      for (const session of sessions) {
        const messagesResult = await client.session.messages({
          path: { id: session.id },
        });
        const messages = messagesResult.data ?? [];

        // Only process messages that are newer than our last full sync
        const messagesToProcess = state.lastFullSyncTimestamp
          ? messages.filter((msg) => (msg.info?.time?.created ?? 0) > state.lastFullSyncTimestamp!)
          : messages;

        await Promise.all(
          messagesToProcess.map(async (message) => {
            await indexMessage(message, session.id);
            totalMessagesProcessed++;
          }),
        );
      }

      if (totalMessagesProcessed > 0) {
        logEventDeduped(
          'full_sync_complete',
          `✅ Full sync processed ${totalMessagesProcessed} messages`,
        );
      }

      // Update the last full sync timestamp
      state = {
        ...state,
        lastFullSyncTimestamp: Date.now(),
        consecutiveErrors: 0, // Reset error count on successful sync
      };
      await saveState(state);
    } catch (error) {
      console.error('❌ Error during full sync:', error);
      const currentErrorCount = state.consecutiveErrors ?? 0;
      state = {
        ...state,
        consecutiveErrors: currentErrorCount + 1,
      };
    }
  };

  const handleEventStreamError = async (error: unknown): Promise<void> => {
    logEventDeduped('stream_error', '❌ Event stream error');
    console.error('Error details:', error);

    const currentErrorCount = state.consecutiveErrors ?? 0;
    const newErrorCount = currentErrorCount + 1;

    state = {
      ...state,
      subscriptionActive: false,
      consecutiveErrors: newErrorCount,
    };
    await saveState(state);

    // If we've had too many consecutive errors, stop trying to reconnect
    if (newErrorCount >= MAX_CONSECUTIVE_ERRORS) {
      flushPendingEventLog();
      console.error(
        `🛑 Stopping event subscription after ${MAX_CONSECUTIVE_ERRORS} consecutive errors`,
      );
      return;
    }

    logEventDeduped(
      'reconnect_attempt',
      `🔄 Attempting to reconnect in ${RECONNECT_DELAY_MS / 1000} seconds`,
    );

    // Schedule reconnection attempt
    reconnectTimer = setTimeout(async () => {
      if (isRunning) {
        await subscribeToEvents();
      }
    }, RECONNECT_DELAY_MS);
  };

  const processSessionMessages = async (session: Session): Promise<void> => {
    const messagesResult = await client.session.messages({
      path: { id: session.id },
    });
    const messages = messagesResult.data ?? [];

    await Promise.all(
      messages.map(async (message, index) => {
        // Log progress every 50 messages
        if ((index + 1) % 50 === 0 || index === messages.length - 1) {
          logEventDeduped(
            'message_processing',
            `📨 Processing message ${index + 1}/${messages.length} in session ${session.id}`,
          );
        }

        await indexMessage(message, session.id);
      }),
    );
  };

  const indexNewData = async (): Promise<void> => {
    try {
      logEventDeduped('indexing_check', '📚 Checking for new sessions and messages');

      const sessionsResult = await client.session.list();
      const sessions = sessionsResult.data ?? [];

      // Find index of last indexed session
      const startIndex = state.lastIndexedSessionId
        ? sessions.findIndex((s: Session) => s.id === state.lastIndexedSessionId) + 1
        : 0;

      const newSessions = sessions.slice(startIndex);

      await Promise.all(
        newSessions.map(async (session) => {
          await indexSession(session);
          state = { ...state, lastIndexedSessionId: session.id };

          await processSessionMessages(session);

          // Save state after processing each session to avoid re-indexing
          await saveState(state);
        }),
      );

      if (newSessions.length > 0) {
        logEventDeduped('sessions_indexed', `✅ Indexed ${newSessions.length} new sessions`);
      } else {
        logEventDeduped('no_new_sessions', '✅ No new sessions to index');
      }

      await saveState(state);
    } catch (error) {
      console.error('❌ Error indexing new data:', error);
    }
  };

  const handleMessageEvent = async (event: Event): Promise<void> => {
    try {
      const sessionId = extractSessionId(event);
      if (!sessionId) {
        console.warn('⚠️ Message event without session ID:', event);
        return;
      }

      // Extract specific message ID from event
      const messageId = extractMessageId(event);
      if (!messageId) {
        console.warn('⚠️ Message event without message ID:', event);
        return;
      }

      // Only fetch and index when message is complete, not for every part update
      if (event.type === 'message.updated' || event.type === 'message.removed') {
        // Use efficient direct message fetch API instead of fetching all messages
        const messageResult = await client.session.message({
          path: { id: sessionId, messageID: messageId },
        });
        const targetMessage = messageResult.data;

        if (targetMessage) {
          await indexMessage(targetMessage, sessionId);
          state = { ...state, lastIndexedMessageId: messageId };

          // Save state after processing message event
          await saveState(state);

          logEventDeduped(
            'message_indexed',
            `📝 Indexed message ${messageId} for session ${sessionId}`,
          );
        } else {
          logEventDeduped(
            'message_not_found',
            `⚠️ Could not find message ${messageId} in session ${sessionId}`,
          );
        }
      } else {
        // For part updates, just log that we're skipping indexing until message is complete
        logEventDeduped(
          'part_update_skipped',
          `🔄 Skipping indexing for part update of message ${messageId} in session ${sessionId}`,
        );
      }
    } catch (error) {
      console.error('❌ Error handling message event:', error);
    }
  };

  const handleSessionEvent = async (event: Event): Promise<void> => {
    try {
      logEventDeduped('session_event', `🎯 Processing session event: ${event.type}`);

      if ('properties' in event && event.properties) {
        const sessionInfo = (event.properties as any).info;
        if (sessionInfo) {
          await indexSession(sessionInfo);
          state = { ...state, lastIndexedSessionId: sessionInfo.id };

          // Save state after processing session event
          await saveState(state);

          logEventDeduped(
            'session_indexed',
            `📝 Indexed session ${sessionInfo.id} with title "${sessionInfo.title}"`,
          );
        } else {
          logEventDeduped(
            'session_info_missing',
            `⚠️ Session event ${event.type} did not contain session info`,
          );
        }
      } else {
        logEventDeduped(
          'session_properties_missing',
          `⚠️ Session event ${event.type} did not contain properties`,
        );
      }
    } catch (error) {
      console.error('❌ Error handling session event:', error);
    }
  };

  const handleEvent = async (event: Event): Promise<void> => {
    try {
      await indexEvent(event);

      if (isMessageEvent(event)) {
        await handleMessageEvent(event);
      } else if (isSessionEvent(event)) {
        await handleSessionEvent(event);
      }
    } catch (error) {
      console.error('❌ Error handling event:', error);
    }
  };

  const subscribeToEvents = async (): Promise<void> => {
    try {
      if (typeof client.event?.subscribe !== 'function') {
        console.error('❌ This SDK/server does not support event.subscribe()');
        return;
      }

      // Clean up existing subscription
      if (eventSubscription) {
        logEventDeduped('subscription_cleanup', '🔄 Cleaning up existing event subscription');
        eventSubscription = undefined;
      }

      const sub = (await client.event.subscribe()) as EventSubscription;
      eventSubscription = sub;
      state = { ...state, subscriptionActive: true, consecutiveErrors: 0 };
      await saveState(state);

      logEventDeduped('subscription_active', '📡 Subscribed to OpenCode events');

      try {
        for await (const event of sub.stream) {
          await handleEvent(event);

          // Reset error count on successful event processing
          if (state.consecutiveErrors && state.consecutiveErrors > 0) {
            state = { ...state, consecutiveErrors: 0 };
            await saveState(state);
          }
        }
      } catch (streamError) {
        await handleEventStreamError(streamError);
      }
    } catch (error) {
      await handleEventStreamError(error);
    }
  };

  const start = async (): Promise<void> => {
    if (isRunning) {
      console.log('Indexer is already running');
      return;
    }

    isRunning = true;
    logEventDeduped('service_start', '🚀 Starting OpenCode indexer service');

    state = await loadState();

    // Check if we need to perform recovery sync
    const wasSubscriptionActive = state.subscriptionActive ?? false;
    const timeSinceLastSync = state.lastFullSyncTimestamp
      ? Date.now() - state.lastFullSyncTimestamp
      : Infinity;

    if (wasSubscriptionActive && timeSinceLastSync > FULL_SYNC_INTERVAL_MS) {
      logEventDeduped('recovery_sync', '🔍 Detected potential downtime, performing recovery sync');
      await performFullSync();
    }

    startPeriodicStateSave();
    startFullSyncTimer();
    await subscribeToEvents();
    void indexNewData();
    flushPendingEventLog(); // Flush initial startup logs
  };

  const stop = async (): Promise<void> => {
    if (!isRunning) {
      return;
    }

    isRunning = false;
    flushPendingEventLog(); // Flush any pending logs before stopping
    logEventDeduped('service_stop', '🛑 Stopping OpenCode indexer service');

    if (stateSaveTimer) {
      clearInterval(stateSaveTimer);
      stateSaveTimer = undefined;
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = undefined;
    }

    eventSubscription = undefined;

    state = { ...state, subscriptionActive: false };
    await saveState(state);
  };

  return {
    start,
    stop,
  };
};
