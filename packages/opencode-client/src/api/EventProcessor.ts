import {
  handleSessionIdle as handleSessionIdleAction,
  handleSessionUpdated as handleSessionUpdatedAction,
  handleMessageUpdated as handleMessageUpdatedAction,
  processSessionMessages as processSessionMessagesAction,
  EventContext,
} from '../actions/events/index.js';

// Global state for backward compatibility
let taskContext: any;

export function initializeEventContext(_client: any, _taskContext: any) {
  taskContext = _taskContext;
}

export async function handleSessionIdle(client: any, sessionId: string) {
  const context: EventContext = {
    client,
    taskContext,
  };
  return handleSessionIdleAction(context, sessionId);
}

export async function handleSessionUpdated(client: any, sessionId: string) {
  const context: EventContext = {
    client,
    taskContext,
  };
  return handleSessionUpdatedAction(context, sessionId);
}

export async function handleMessageUpdated(client: any, sessionId: string) {
  const context: EventContext = {
    client,
    taskContext,
  };
  return handleMessageUpdatedAction(context, sessionId);
}

export async function processSessionMessages(client: any, sessionId: string) {
  const context: EventContext = {
    client,
    taskContext,
  };
  return processSessionMessagesAction(context, sessionId);
}
