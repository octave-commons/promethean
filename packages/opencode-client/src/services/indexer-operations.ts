import type { Session, Event } from '@opencode-ai/sdk';

import { sessionStore, eventStore, messageStore } from '../index.js';

import type { Message } from './indexer-types.js';
import { eventToMarkdown, sessionToMarkdown, messageToMarkdown } from './indexer-formatters.js';

export const createIndexingOperations = () => ({
  indexSession: async (session: Session): Promise<void> => {
    try {
      const markdown = sessionToMarkdown(session);

      await sessionStore.insert({
        id: `session_${session.id}`,
        text: markdown,
        timestamp: session.time?.created ?? Date.now(),
        metadata: {
          type: 'session',
          sessionId: session.id,
          title: session.title,
        },
      });
    } catch (error) {
      console.error('❌ Error indexing session:', error);
    }
  },

  indexMessage: async (message: Message, sessionId: string): Promise<void> => {
    try {
      const markdown = messageToMarkdown(message);

      await messageStore.insert({
        id: `message_${message.info?.id}`,
        text: markdown,
        timestamp: message.info?.time?.created ?? Date.now(),
        metadata: {
          type: 'message',
          messageId: message.info?.id,
          sessionId,
          role: message.info?.role,
        },
      });
    } catch (error) {
      console.error('❌ Error indexing message:', error);
    }
  },

  indexEvent: async (event: Event): Promise<void> => {
    try {
      const markdown = eventToMarkdown(event);
      const timestamp = Date.now();

      await eventStore.insert({
        id: `event_${event.type}_${timestamp}`,
        text: markdown,
        timestamp,
        metadata: {
          type: 'event',
          eventType: event.type,
          sessionId:
            (event as any).properties?.info?.id ??
            (event as any).properties?.info?.sessionID ??
            (event as any).properties?.sessionID ??
            (event as any).properties?.part?.sessionID,
        },
      });

      console.log(`📡 Indexed event: ${event.type}`);
    } catch (error) {
      console.error('❌ Error indexing event:', error);
    }
  },
});
