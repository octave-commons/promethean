import { readFile, writeFile } from 'fs/promises';

import type { Session, Event } from '@opencode-ai/sdk';

export type IndexerState = {
  readonly lastIndexedSessionId?: string;
  readonly lastIndexedMessageId?: string;
};

export interface OpenCodeClient {
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

export interface Message {
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

export interface MessagePart {
  readonly type?: string;
  readonly text?: string;
}

export interface EventSubscription {
  readonly stream: AsyncIterable<Event>;
}

export const createStateManager = (
  stateFile: string,
): {
  readonly loadState: () => Promise<IndexerState>;
  readonly saveState: (state: IndexerState) => Promise<void>;
} => {
  const loadState = async (): Promise<IndexerState> => {
    try {
      const data = await readFile(stateFile, 'utf-8');
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

  const saveState = async (state: IndexerState): Promise<void> => {
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

  return { loadState, saveState };
};

export const extractSessionId = (event: Event): string | undefined => {
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

export const extractMessageId = (event: Event): string | undefined => {
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

export const isMessageEvent = (event: Event): boolean =>
  ['message.updated', 'message.part.updated', 'message.removed'].includes(event.type);
