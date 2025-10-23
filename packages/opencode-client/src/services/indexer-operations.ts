import type { Session, Event } from '@opencode-ai/sdk';

import { sessionStoreAccess, eventStoreAccess, messageStoreAccess } from './unified-store.js';
import type { Message } from './indexer-types.js';
import { eventToMarkdown, sessionToMarkdown, messageToMarkdown } from './indexer-formatters.js';

type EnhancedEvent = Event & {
  readonly properties?: {
    readonly info?: {
      readonly id?: string;
      readonly sessionID?: string;
    };
    readonly part?: {
      readonly sessionID?: string;
      readonly messageID?: string;
    };
  };
};

const indexSession = async (session: Session): Promise<void> => {
  const markdown = sessionToMarkdown(session);

  try {
    await sessionStoreAccess.insert({
      text: markdown,
      timestamp: session.time?.created ?? Date.now(),
      metadata: {
        type: 'session',
        sessionId: session.id,
        title: session.title,
      },
    });
  } catch (error: unknown) {
    console.error('❌ Error indexing session:', error);
  }
};

const indexMessage = async (message: Message, sessionId: string): Promise<void> => {
  const markdown = messageToMarkdown(message);

  try {
    await messageStoreAccess.insert({
      text: markdown,
      timestamp: message.info?.time?.created ?? Date.now(),
      metadata: {
        type: 'message',
        messageId: message.info?.id,
        sessionId,
        role: message.info?.role,
      },
    });
  } catch (error: unknown) {
    console.error('❌ Error indexing message:', error);
  }
};

const indexEvent = async (event: EnhancedEvent): Promise<void> => {
  const markdown = eventToMarkdown(event);
  const timestamp = Date.now();

  try {
    await eventStoreAccess.insert({
      text: markdown,
      timestamp,
      metadata: {
        type: 'event',
        eventType: event.type,
        sessionId:
          event.properties?.info?.id ??
          event.properties?.info?.sessionID ??
          event.properties?.part?.sessionID,
      },
    });
  } catch (error: unknown) {
    console.error('❌ Error indexing event:', error);
  }

  // Event logging is handled by specific handlers in events.ts
  // to avoid redundant logging and provide better context
};

export const createIndexingOperations = (): {
  readonly indexSession: (session: Session) => Promise<void>;
  readonly indexMessage: (message: Message, sessionId: string) => Promise<void>;
  readonly indexEvent: (event: EnhancedEvent) => Promise<void>;
} => ({
  indexSession,
  indexMessage,
  indexEvent: (event: EnhancedEvent) => indexEvent(event),
});
