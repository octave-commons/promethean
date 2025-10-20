import {
  handleSessionIdle as handleSessionIdleAction,
  handleSessionUpdated as handleSessionUpdatedAction,
  handleMessageUpdated as handleMessageUpdatedAction,
  processSessionMessages as processSessionMessagesAction,
  EventContext,
} from '../actions/events/index.js';
import type { TaskContext, EventClient, SessionClient } from '../types/index.js';

// Global state for backward compatibility
let taskContext: TaskContext;

function initializeEventContext(
  _client: SessionClient | EventClient,
  _taskContext: TaskContext,
): void {
  taskContext = _taskContext;
}

async function handleSessionIdle(
  client: SessionClient | EventClient,
  sessionId: string,
): Promise<void> {
  const context: EventContext = {
    client,
    taskContext,
  };
  return handleSessionIdleAction(context, sessionId);
}

async function handleSessionUpdated(
  client: SessionClient | EventClient,
  sessionId: string,
): Promise<void> {
  const context: EventContext = {
    client,
    taskContext,
  };
  return handleSessionUpdatedAction(context, sessionId);
}

async function handleMessageUpdated(
  client: SessionClient | EventClient,
  sessionId: string,
): Promise<void> {
  const context: EventContext = {
    client,
    taskContext,
  };
  return handleMessageUpdatedAction(context, sessionId);
}

async function processSessionMessages(
  client: SessionClient | EventClient,
  sessionId: string,
): Promise<void> {
  const context: EventContext = {
    client,
    taskContext,
  };
  return processSessionMessagesAction(context, sessionId);
}

// Create a class-like export for backward compatibility
export const EventProcessor = {
  initializeEventContext,
  handleSessionIdle,
  handleSessionUpdated,
  handleMessageUpdated,
  processSessionMessages,
};
