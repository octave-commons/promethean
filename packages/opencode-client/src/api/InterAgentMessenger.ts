import { DualStoreManager } from '@promethean/persistence';
import { AgentTask } from '../AgentTask.js';
import {
  sendMessage as sendMessageAction,
  verifyAgentExists as verifyAgentExistsAction,
  getSenderSessionId as getSenderSessionIdAction,
  formatMessage as formatMessageAction,
  logCommunication as logCommunicationAction,
  MessagingContext,
} from '../actions/messaging/index.js';

// Global state for backward compatibility
let _sessionStore: DualStoreManager<'text', 'timestamp'>;
let _agentTaskStore: DualStoreManager<'text', 'timestamp'>;
let _agentTasks: Map<string, AgentTask>;

function initializeStore(sessionStore: DualStoreManager<'text', 'timestamp'>) {
  _sessionStore = sessionStore;
}

function setAgentTaskStore(agentTaskStore: DualStoreManager<'text', 'timestamp'>) {
  _agentTaskStore = agentTaskStore;
}

function setAgentTasks(agentTasks: Map<string, AgentTask>) {
  _agentTasks = agentTasks;
}

async function sendMessage(
  client: any,
  sessionId: string,
  message: string,
  priority: string,
  messageType: string,
): Promise<string> {
  const context: MessagingContext = {
    sessionStore: _sessionStore,
    agentTaskStore: _agentTaskStore,
    agentTasks: _agentTasks,
  };
  return sendMessageAction(context, client, sessionId, message, priority, messageType);
}

async function verifyAgentExists(sessionId: string): Promise<boolean> {
  const context: MessagingContext = {
    sessionStore: _sessionStore,
    agentTaskStore: _agentTaskStore,
    agentTasks: _agentTasks,
  };
  return verifyAgentExistsAction(context, sessionId);
}

async function getSenderSessionId(client: any): Promise<string> {
  return getSenderSessionIdAction(client);
}

function formatMessage(
  senderId: string,
  recipientId: string,
  message: string,
  priority: string,
  messageType: string,
): string {
  return formatMessageAction(senderId, recipientId, message, priority, messageType);
}

async function logCommunication(
  senderId: string,
  recipientId: string,
  message: string,
  priority: string,
  messageType: string,
): Promise<void> {
  const context: MessagingContext = {
    sessionStore: _sessionStore,
    agentTaskStore: _agentTaskStore,
    agentTasks: _agentTasks,
  };
  return logCommunicationAction(context, senderId, recipientId, message, priority, messageType);
}

// Create a class-like export for backward compatibility
export const InterAgentMessenger = {
  initializeStore,
  setAgentTaskStore,
  setAgentTasks,
  sendMessage,
  verifyAgentExists,
  getSenderSessionId,
  formatMessage,
  logCommunication,
};
