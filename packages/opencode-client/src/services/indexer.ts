import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import { createOpencodeClient } from '@opencode-ai/sdk';
import type { Session, Event } from '@opencode-ai/sdk';

import { sessionStore, eventStore, messageStore } from '../index.js';

type IndexerState = {
  readonly lastIndexedSessionId?: string;
  readonly lastIndexedMessageId?: string;
};

interface OpenCodeClient {
  readonly session: {
    readonly list: () => Promise<{ readonly data: readonly Session[] }>;
    readonly messages: (params: { readonly path: { readonly id: string } }) => Promise<{
      readonly data: readonly Message[];
    }>;
    readonly message: (params: {
      readonly path: { readonly id: string; readonly messageID: string };
    }) => Promise<{ readonly data: Message }>;
  };
  readonly event?: {
    readonly subscribe: () => Promise<{ readonly stream: AsyncIterable<Event> }>;
  };
}

interface Message {
  readonly info?: {
    readonly id?: string;
    readonly role?: string;
    readonly sessionID?: string;
    readonly time?: {
      readonly created?: number;
    };
  };
  readonly parts?: readonly MessagePart[];
}

interface MessagePart {
  readonly type?: string;
  readonly text?: string;
}

interface EventSubscription {
  readonly stream: AsyncIterable<Event>;
}

export interface IndexerService {
  readonly start: () => Promise<void>;
  readonly stop: () => Promise<void>;
}

export const createIndexerService = (): IndexerService => {
  const client = createOpencodeClient({
    baseUrl: 'http://localhost:4096',
  }) as OpenCodeClient;

  let isRunning = false;
  let stateSaveTimer: NodeJS.Timeout | undefined;
  const STATE_SAVE_INTERVAL_MS = 30000;
  const stateFile = join(process.cwd(), '.indexer-state.json');
  let state: IndexerState = {};

  const loadState = async (): Promise<void> => {
    try {
      const data = await readFile(stateFile, 'utf-8');
      const savedState: IndexerState = JSON.parse(data);
      state = savedState;
      console.log(
        `📂 Loaded indexer state: lastSession=${state.lastIndexedSessionId}, lastMessage=${state.lastIndexedMessageId}`,
      );
    } catch {
      console.log('📂 No previous indexer state found, starting fresh');
    }
  };

  const saveState = async (): Promise<void> => {
    try {
      const stateToSave = {
        lastIndexedSessionId: state.lastIndexedSessionId,
        lastIndexedMessageId: state.lastIndexedMessageId,
        savedAt: Date.now(),
      };

      await writeFile(stateFile, JSON.stringify(stateToSave, null, 2));

      if (process.argv.includes('--verbose')) {
        console.log(
          `💾 Saved indexer state: lastSession=${state.lastIndexedSessionId}, lastMessage=${state.lastIndexedMessageId}`,
        );
      }
    } catch (error) {
      console.warn('⚠️  Could not save indexer state:', error);
    }
  };

  const startPeriodicStateSave = (): void => {
    stateSaveTimer = setInterval(async () => {
      if (isRunning) {
        await saveState();
      }
    }, STATE_SAVE_INTERVAL_MS);
  };

  const indexSession = async (session: Session): Promise<void> => {
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
  };

  const indexMessage = async (message: Message, sessionId: string): Promise<void> => {
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
  };

  const indexEvent = async (event: Event): Promise<void> => {
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
          sessionId: extractSessionId(event),
        },
      });

      console.log(`📡 Indexed event: ${event.type}`);
    } catch (error) {
      console.error('❌ Error indexing event:', error);
    }
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
          await saveState();
        }),
      );

      if (newSessions.length > 0) {
        console.log(`✅ Indexed ${newSessions.length} new sessions`);
      } else {
        console.log('✅ No new sessions to index');
      }

      await saveState();
    } catch (error) {
      console.error('❌ Error indexing new data:', error);
    }
  };

  const isMessageEvent = (event: Event): boolean =>
    ['message.updated', 'message.part.updated', 'message.removed'].includes(event.type);

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
          await saveState();

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

    await loadState();
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

    await saveState();
  };

  const eventToMarkdown = (event: Event): string => {
    const sessionId = extractSessionId(event);
    const timestamp = new Date().toISOString();

    return `# Event: ${event.type}

**Timestamp:** ${timestamp}
**Session ID:** ${sessionId ?? 'N/A'}

## Properties

\`\`\`json
${JSON.stringify(event.properties ?? {}, null, 2)}
\`\`\`

---
`;
  };

  const sessionToMarkdown = (session: Session): string => `# Session: ${session.title}

**ID:** ${session.id}
**Created:** ${new Date(session.time.created).toLocaleString()}
**Project ID:** ${session.projectID}

## Description

${session.title ?? 'Untitled Session'}

---
`;

  const messageToMarkdown = (message: Message): string => {
    const textParts = message.parts?.filter((part: MessagePart) => part.type === 'text') ?? [];
    const content =
      textParts.map((part: MessagePart) => part.text).join('\n\n') ?? '[No text content]';

    return `# Message: ${message.info?.id}

**Role:** ${message.info?.role ?? 'unknown'}
**Timestamp:** ${message.info?.time?.created ? new Date(message.info.time.created).toLocaleString() : 'Unknown'}
**Message ID:** ${message.info?.id ?? 'unknown'}

## Content

${content}

---
`;
  };

  const extractSessionId = (event: Event): string | undefined => {
    switch (event.type) {
      case 'session.updated':
      case 'session.deleted':
        return (event as any).properties?.info?.id;
      case 'message.updated':
      case 'message.removed':
        return (event as any).properties?.info?.sessionID ?? (event as any).properties?.sessionID;
      case 'message.part.updated':
      case 'message.part.removed':
        return (event as any).properties?.part?.sessionID ?? (event as any).properties?.sessionID;
      default:
        return undefined;
    }
  };

  const extractMessageId = (event: Event): string | undefined => {
    switch (event.type) {
      case 'message.updated':
      case 'message.removed':
        return (event as any).properties?.info?.id;
      case 'message.part.updated':
      case 'message.part.removed':
        return (event as any).properties?.part?.messageID ?? (event as any).properties?.messageID;
      default:
        return undefined;
    }
  };

  return {
    start,
    stop,
  };
};
