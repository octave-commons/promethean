import { join } from 'path';

import { createOpencodeClient } from '@opencode-ai/sdk';
import type { Session, Event } from '@opencode-ai/sdk';

import type { IndexerState, OpenCodeClient, EventSubscription } from './indexer-types.js';
import {
  createStateManager,
  isMessageEvent,
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
  const STATE_SAVE_INTERVAL_MS = 30000;
  let state: IndexerState = {};

  const startPeriodicStateSave = (): void => {
    stateSaveTimer = setInterval(async () => {
      if (isRunning) {
        await saveState(state);
      }
    }, STATE_SAVE_INTERVAL_MS);
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
          console.log(
            `📨 Processing message ${index + 1}/${messages.length} in session ${session.id}`,
          );
        }

        await indexMessage(message, session.id);
      }),
    );
  };

  const indexNewData = async (): Promise<void> => {
    try {
      console.log('📚 Checking for new sessions and messages...');

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
        console.log(`✅ Indexed ${newSessions.length} new sessions`);
      } else {
        console.log('✅ No new sessions to index');
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

          console.log(`📝 Indexed message ${messageId} for session ${sessionId}`);
        } else {
          console.warn(`⚠️ Could not find message ${messageId} in session ${sessionId}`);
        }
      } else {
        // For part updates, just log that we're skipping indexing until message is complete
        console.log(
          `🔄 Skipping indexing for part update of message ${messageId} in session ${sessionId}`,
        );
      }
    } catch (error) {
      console.error('❌ Error handling message event:', error);
    }
  };

  const handleEvent = async (event: Event): Promise<void> => {
    try {
      await indexEvent(event);

      if (isMessageEvent(event)) {
        await handleMessageEvent(event);
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

      const sub = (await client.event.subscribe()) as EventSubscription;
      console.log('📡 Subscribed to OpenCode events');

      for await (const event of sub.stream) {
        await handleEvent(event);
      }
    } catch (error) {
      console.error('❌ Error subscribing to events:', error);
    }
  };

  const start = async (): Promise<void> => {
    if (isRunning) {
      console.log('Indexer is already running');
      return;
    }

    isRunning = true;
    console.log('🚀 Starting OpenCode indexer service...');

    state = await loadState();
    startPeriodicStateSave();
    await subscribeToEvents();
    void indexNewData();
  };

  const stop = async (): Promise<void> => {
    if (!isRunning) {
      return;
    }

    isRunning = false;
    console.log('🛑 Stopping OpenCode indexer service...');

    if (stateSaveTimer) {
      clearInterval(stateSaveTimer);
      stateSaveTimer = undefined;
    }

    await saveState(state);
  };

  return {
    start,
    stop,
  };
};
