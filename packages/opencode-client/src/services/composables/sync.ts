// SPDX-License-Identifier: GPL-3.0-only
// Sync Composable - Handles full sync and new data indexing

import type { StateManager } from './state.js';
import type { EventLogger } from './logger.js';
import { createIndexingOperations } from '../indexer-operations.js';
import { OpencodeClient } from '@opencode-ai/sdk';

// Simple in-memory rate limiter to avoid external dependency
class RateLimiter {
  private tokens: number = 0;
  private lastReset: number = Date.now();
  private readonly maxTokens: number;
  private readonly windowMs: number;

  constructor(maxTokens: number, windowMs: number = 1000) {
    this.maxTokens = maxTokens;
    this.windowMs = windowMs;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    if (now - this.lastReset > this.windowMs) {
      this.tokens = 0;
      this.lastReset = now;
    }

    while (this.tokens >= this.maxTokens) {
      const waitTime = Math.ceil((this.tokens - this.maxTokens + 1) / 2) * 10;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.tokens = Math.max(0, this.tokens - waitTime / 10);
    }

    this.tokens++;
  }
}

export type SyncConfig = {
  readonly fullSyncIntervalMs: number;
};

export type SyncManager = {
  readonly performFullSync: () => Promise<void>;
  readonly indexNewData: () => Promise<void>;
  readonly scanHistory: () => Promise<void>;
};

export const createSyncManager = (
  client: OpencodeClient,
  _config: SyncConfig,
  stateManager: StateManager,
  logger: EventLogger,
): SyncManager => {
  const indexingOps = createIndexingOperations();

  const performFullSync = async (): Promise<void> => {
    try {
      logger('sync_full', '🔍 Performing full sync to ensure no messages are missed');

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

        // Process messages with controlled concurrency using rate limiter
        const CONCURRENT_LIMIT = 3; // Process up to 3 messages concurrently
        const rateLimiter = new RateLimiter(CONCURRENT_LIMIT, 1000); // 3 tokens per second

        await Promise.all(
          messagesToProcess.map(async (message) => {
            await rateLimiter.acquire();
            return indexingOps.indexMessage(message, session.id);
          }),
        );

        totalMessagesProcessed += messagesToProcess.length;

        // Small delay between batches to prevent connection overload
        if (messagesToProcess.length > CONCURRENT_LIMIT) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      if (totalMessagesProcessed > 0) {
        logger('sync_full_complete', `✅ Full sync processed ${totalMessagesProcessed} messages`);
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
      logger('sync_indexing_check', '📚 Checking for new sessions and messages');

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

        // Process messages in batches to balance performance and connection stability
        const batchSize = 5; // Process up to 5 messages concurrently
        for (let i = 0; i < messages.length; i += batchSize) {
          const batch = messages.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (message: any) => {
              await indexingOps.indexMessage(message, session.id);
            }),
          );
          // Small delay between batches to prevent connection overload
          if (i + batchSize < messages.length) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        // Save state after processing each session
        currentState = await stateManager.loadState();
        await stateManager.saveState(currentState);
      }

      if (newSessions.length > 0) {
        logger('sync_sessions_indexed', `✅ Indexed ${newSessions.length} new sessions`);
      } else {
        logger('sync_no_new_sessions', '✅ No new sessions to index');
      }
    } catch (error) {
      console.error('❌ Error indexing new data:', error);
    }
  };

  const scanHistory = async (): Promise<void> => {
    try {
      logger('sync_history_scan', '🔍 Starting passive history scan for existing sessions');

      const sessionsResult = await client.session.list();
      const sessions = sessionsResult.data ?? [];

      let totalMessagesProcessed = 0;
      let totalSessionsScanned = 0;

      for (const session of sessions) {
        const messagesResult = await client.session.messages({
          path: { id: session.id },
        });
        const messages = messagesResult.data ?? [];

        if (messages.length > 0) {
          // Process all messages from this session to ensure historical data is captured
          for (const message of messages) {
            await indexingOps.indexMessage(message, session.id);
            totalMessagesProcessed++;
            // Small delay between messages to prevent connection overload
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          totalSessionsScanned++;
        }
      }

      logger(
        'sync_history_complete',
        `✅ History scan completed: ${totalSessionsScanned} sessions, ${totalMessagesProcessed} messages processed`,
      );

      // Update state to track when history was last scanned
      const state = await stateManager.loadState();
      await stateManager.saveState({
        ...state,
        lastFullSyncTimestamp: Date.now(),
        consecutiveErrors: 0,
      });
    } catch (error) {
      console.error('❌ Error during history scan:', error);
      const state = await stateManager.loadState();
      await stateManager.saveState({
        ...state,
        consecutiveErrors: (state.consecutiveErrors ?? 0) + 1,
      });
    }
  };

  return {
    performFullSync,
    indexNewData,
    scanHistory,
  };
};
