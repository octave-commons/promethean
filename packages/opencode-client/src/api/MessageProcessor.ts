import { DualStoreManager } from '@promethean/persistence';
import {
  detectTaskCompletion as detectTaskCompletionAction,
  processMessage as processMessageAction,
  processSessionMessages as processSessionMessagesAction,
  MessageContext,
} from '../actions/messages/index.js';

// Global state for backward compatibility
let sessionStore: DualStoreManager<'text', 'timestamp'>;

export function initializeStore(_sessionStore: DualStoreManager<'text', 'timestamp'>) {
  sessionStore = _sessionStore;
}

export function detectTaskCompletion(messages: any[]): {
  completed: boolean;
  completionMessage?: string;
} {
  return detectTaskCompletionAction(messages);
}

export async function processMessage(_client: any, sessionId: string, message: any) {
  const context: MessageContext = {
    sessionStore,
  };
  return processMessageAction(context, sessionId, message);
}

export async function processSessionMessages(client: any, sessionId: string) {
  const context: MessageContext = {
    sessionStore,
  };
  return processSessionMessagesAction(context, client, sessionId);
}
