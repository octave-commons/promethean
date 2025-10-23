// SPDX-License-Identifier: GPL-3.0-only
// Events Composable - Handles OpenCode event streaming and processing

import type { Event, OpencodeClient } from '@opencode-ai/sdk';
import type { EventSubscription } from '../indexer-types.js';
import type { StateManager } from './state.js';
import type { EventLogger } from './logger.js';
import type { TimerManager } from './timers.js';
import { createIndexingOperations } from '../indexer-operations.js';
import {
  isMessageEvent,
  isSessionEvent,
  extractSessionId,
  extractMessageId,
} from '../indexer-types.js';

export type EventConfig = {
  readonly reconnectDelayMs: number;
  readonly maxConsecutiveErrors: number;
};

export type EventStreamManager = {
  readonly startSubscription: () => Promise<void>;
  readonly stopSubscription: () => Promise<void>;
  readonly isActive: () => boolean;
};

export const createEventManager = (
  client: OpencodeClient,
  config: EventConfig,
  stateManager: StateManager,
  logger: EventLogger,
  timerManager: TimerManager,
): EventStreamManager => {
  let subscription: EventSubscription | undefined;
  let consecutiveErrors = 0;

  const indexingOps = createIndexingOperations(logger);

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
      await handleStreamError();
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

        logger(`message_indexed`, `📝 Indexed message ${messageId} for session ${sessionId}`);
      }
    } else {
      logger(`message_part_update`, `🔄 Skipping indexing for part update of message ${messageId}`);
    }
  };

  const handleSessionEvent = async (event: Event): Promise<void> => {
    logger(`session_event`, `🎯 Processing session event: ${event.type}`);

    if ('properties' in event && event.properties) {
      const sessionInfo = (event.properties as any).info;
      if (sessionInfo) {
        await indexingOps.indexSession(sessionInfo);

        const state = await stateManager.loadState();
        await stateManager.saveState({ ...state, lastIndexedSessionId: sessionInfo.id });

        logger(
          `session_indexed`,
          `📝 Indexed session ${sessionInfo.id} with title "${sessionInfo.title}"`,
        );
      }
    }
  };

  const handleStreamError = async (): Promise<void> => {
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
    timerManager.setTimer(
      'reconnect',
      async () => {
        try {
          await startSubscription();
        } catch (reconnectError) {
          console.error('❌ Failed to reconnect:', reconnectError);
        }
      },
      config.reconnectDelayMs,
    );
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
        await handleStreamError();
      }
    })();
  };

  const stopSubscription = async (): Promise<void> => {
    if (subscription) {
      try {
        // Note: EventSubscription doesn't have a close method based on the type definition
        // Just clear the reference
        subscription = undefined;
      } catch (error) {
        console.warn('Warning: Could not cleanly close event subscription:', error);
      }
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
