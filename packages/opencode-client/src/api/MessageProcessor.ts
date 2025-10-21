import { DualStoreManager } from '@promethean/persistence';
import {
  detectTaskCompletion as detectTaskCompletionAction,
  processMessage as processMessageAction,
  processSessionMessages as processSessionMessagesAction,
  MessageContext,
} from '../actions/messages/index.js';

// Global state for backward compatibility
let sessionStore: DualStoreManager<'text', 'timestamp'>;

function initializeStore(_sessionStore: DualStoreManager<'text', 'timestamp'>) {
  sessionStore = _sessionStore;
}

function detectTaskCompletion(messages: any[]): { completed: boolean; completionMessage?: string } {
  return detectTaskCompletionAction(messages);
}

async function processMessage(_client: any, sessionId: string, message: any) {
  const context: MessageContext = {
    sessionStore,
  };
  return processMessageAction(context, sessionId, message);
}

async function processSessionMessages(client: any, sessionId: string) {
  const context: MessageContext = {
    sessionStore,
  };
  return processSessionMessagesAction(context, client, sessionId);
}

// Create a class-like export for backward compatibility
export const MessageProcessor = {
  initializeStore,
  detectTaskCompletion,
  processMessage,
  processSessionMessages,
};
