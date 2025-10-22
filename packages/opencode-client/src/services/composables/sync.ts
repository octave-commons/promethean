// SPDX-License-Identifier: GPL-3.0-only
// Sync Composable - Handles full sync and new data indexing

import type { OpenCodeClient } from '../indexer-types.js';
import type { StateManager } from './state.js';
import type { EventLogger } from './logger.js';
import { createIndexingOperations } from '../indexer-operations.js';

export type SyncConfig = {
  readonly fullSyncIntervalMs: number;
};

export type SyncManager = {
  readonly performFullSync: () => Promise<void>;
  readonly indexNewData: () => Promise<void>;
};

export const createSyncManager = (
  client: OpenCodeClient,
  _config: SyncConfig,
  stateManager: StateManager,
  logger: EventLogger,
): SyncManager => {
  const indexingOps = createIndexingOperations(logger);

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

        // Process messages in batches to balance performance and connection stability
        const batchSize = 5; // Process up to 5 messages concurrently
        for (let i = 0; i < messagesToProcess.length; i += batchSize) {
          const batch = messagesToProcess.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (message: any) => {
              await indexingOps.indexMessage(message, session.id);
              totalMessagesProcessed++;
            }),
          );
          // Small delay between batches to prevent connection overload
          if (i + batchSize < messagesToProcess.length) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
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

  return {
    performFullSync,
    indexNewData,
  };
};
