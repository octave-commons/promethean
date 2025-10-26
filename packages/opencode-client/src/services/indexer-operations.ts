import type { Session, Event } from '@opencode-ai/sdk';

import { sessionStoreAccess, eventStoreAccess, messageStoreAccess } from './unified-store.js';
import type { Message } from './indexer-types.js';
import { eventToMarkdown, sessionToMarkdown } from './indexer-formatters.js';

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

// Enhanced error type for better debugging
export class IndexingError extends Error {
  constructor(
    message: string,
    public readonly context: {
      messageId?: string;
      sessionId?: string;
      originalError?: unknown;
    },
  ) {
    super(message);
  }
}

const indexMessage = async (message: Message, sessionId: string): Promise<void> => {
  // Validate input
  if (!message) {
    throw new IndexingError('Message is required', { sessionId });
  }

  if (!message.info?.id) {
    throw new IndexingError('Message ID is required', { sessionId });
  }

  // Store the complete message as JSON (new format)
  const messageText = JSON.stringify({
    info: message.info,
    parts: message.parts,
  });

  try {
    await messageStoreAccess.insert({
      id: message.info?.id,
      text: messageText,
      timestamp: message.info?.time?.created ?? Date.now(),
      metadata: {
        type: 'message',
        messageId: message.info?.id,
        sessionId,
        role: message.info?.role,
      },
    });
  } catch (error: unknown) {
    const errorContext = {
      messageId: message.info?.id,
      sessionId,
      originalError: error,
    };

    console.error('❌ Error indexing message:', {
      message: error instanceof Error ? error.message : String(error),
      context: errorContext,
    });

    // Re-throw with context for better debugging
    throw new IndexingError(`Failed to index message ${message.info?.id}`, errorContext);
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

// Export error class for consumers
export { IndexingError, createIndexingOperations };
