import { readFile, writeFile } from 'fs/promises';

import type { Event, OpencodeClient } from '@opencode-ai/sdk';

export type IndexerState = {
  readonly lastIndexedSessionId?: string;
  readonly lastIndexedMessageId?: string;
  readonly lastEventTimestamp?: number;
  readonly lastFullSyncTimestamp?: number;
  readonly subscriptionActive?: boolean;
  readonly consecutiveErrors?: number;
};

// Re-export OpencodeClient from SDK
export type { OpencodeClient };

export type Message = {
  readonly info?: {
    readonly id?: string;
    readonly role?: string;
    readonly sessionID?: string;
    readonly time?: {
      readonly created?: number;
    };
  };
  readonly parts?: readonly MessagePart[];
};

export type MessagePart = {
  readonly type?: string;
  readonly text?: string;
};

export type EventSubscription = {
  readonly stream: AsyncIterable<Event>;
};

export type EventProperties = {
  readonly info?: {
    readonly id?: string;
    readonly sessionID?: string;
  };
  readonly part?: {
    readonly sessionID?: string;
    readonly messageID?: string;
  };
};

export type EnhancedEvent = Event & {
  readonly properties?: EventProperties;
};

export const createStateManager = (
  stateFile: string,
): {
  readonly loadState: () => Promise<Readonly<IndexerState>>;
  readonly saveState: (state: Readonly<IndexerState>) => Promise<void>;
} => {
  const loadState = async (): Promise<Readonly<IndexerState>> => {
    const data = await readFile(stateFile, 'utf-8').catch(() => {
      console.log('📂 No previous indexer state found, starting fresh');
      return null;
    });

    if (!data) {
      return {};
    }

    try {
      const savedState: IndexerState = JSON.parse(data);
      console.log(
        `📂 Loaded indexer state: lastSession=${savedState.lastIndexedSessionId}, lastMessage=${savedState.lastIndexedMessageId}`,
      );
      return savedState;
    } catch {
      console.log('📂 No previous indexer state found, starting fresh');
      return {};
    }
  };

  const saveState = async (state: Readonly<IndexerState>): Promise<void> => {
    const stateToSave = {
      lastIndexedSessionId: state.lastIndexedSessionId,
      lastIndexedMessageId: state.lastIndexedMessageId,
      savedAt: Date.now(),
    } as const;

    try {
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

  return { loadState, saveState };
};

export const extractSessionId = (event: EnhancedEvent): string | undefined => {
  const properties = event.properties;
  if (!properties) {
    return undefined;
  }

  switch (event.type) {
    case 'session.updated':
    case 'session.deleted':
      return properties.info?.id;
    case 'message.updated':
    case 'message.removed':
      return properties.info?.sessionID;
    case 'message.part.updated':
    case 'message.part.removed':
      return properties.part?.sessionID;
    case 'installation.updated':
    case 'lsp.client.diagnostics':
    case 'session.compacted':
    case 'permission.updated':
    case 'permission.replied':
    case 'file.edited':
    case 'file.watcher.updated':
    case 'todo.updated':
    case 'session.idle':
    case 'session.error':
    case 'server.connected':
    case 'ide.installed':
      return undefined;
    default:
      return undefined;
  }
};

export const extractMessageId = (event: EnhancedEvent): string | undefined => {
  const properties = event.properties;
  if (!properties) {
    return undefined;
  }

  switch (event.type) {
    case 'message.updated':
    case 'message.removed':
      return properties.info?.id;
    case 'message.part.updated':
    case 'message.part.removed':
      return properties.part?.messageID;
    case 'installation.updated':
    case 'lsp.client.diagnostics':
    case 'session.compacted':
    case 'permission.updated':
    case 'permission.replied':
    case 'file.edited':
    case 'file.watcher.updated':
    case 'todo.updated':
    case 'session.idle':
    case 'session.updated':
    case 'session.deleted':
    case 'session.error':
    case 'server.connected':
    case 'ide.installed':
      return undefined;
    default:
      return undefined;
  }
};

export const isMessageEvent = (event: Event): boolean =>
  ['message.updated', 'message.part.updated', 'message.removed'].includes(event.type);

export const isSessionEvent = (event: Event): boolean =>
  ['session.updated', 'session.deleted'].includes(event.type);

export const getEventTimestamp = (event: Event): number => {
  // Extract timestamp from event properties if available
  if ('properties' in event && event.properties) {
    const props = event.properties as any;
    // Check for time in permission.updated events
    if (props.time?.created) {
      return props.time.created;
    }
    // Check for time in message info
    if (props.info?.time?.created) {
      return props.info.time.created;
    }
  }

  return Date.now();
};
