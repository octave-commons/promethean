import type { Session, Event } from '@opencode-ai/sdk';

import { sessionStore, eventStore, messageStore } from '../index.js';
import { insert } from '@promethean/persistence/dualStore.js';

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
    await insert(sessionStore, {
      id: `session_${session.id}`,
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
  } catch (error: unknown) {
    console.error('❌ Error indexing message:', error);
  }
};

const indexEvent = async (
  event: EnhancedEvent,
  logEventDeduped?: (eventType: string, message: string) => void,
): Promise<void> => {
  const markdown = eventToMarkdown(event);
  const timestamp = Date.now();

  try {
    await eventStore.insert({
      id: `event_${event.type}_${timestamp}`,
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

  if (logEventDeduped) {
    logEventDeduped(`event_indexed_${event.type}`, `📡 Indexed event: ${event.type}`);
  } else {
    console.log(`📡 Indexed event: ${event.type}`);
  }
};

export const createIndexingOperations = (
  logEventDeduped?: (eventType: string, message: string) => void,
): {
  readonly indexSession: (session: Session) => Promise<void>;
  readonly indexMessage: (message: Message, sessionId: string) => Promise<void>;
  readonly indexEvent: (event: EnhancedEvent) => Promise<void>;
} => ({
  indexSession,
  indexMessage: (message: Message, sessionId: string) => indexMessage(message, sessionId),
  indexEvent: (event: EnhancedEvent) => indexEvent(event, logEventDeduped),
});
