import {
  handleSessionIdle as handleSessionIdleAction,
  handleSessionUpdated as handleSessionUpdatedAction,
  handleMessageUpdated as handleMessageUpdatedAction,
  processSessionMessages as processSessionMessagesAction,
  EventContext,
} from '../actions/events/index.js';

// Global state for backward compatibility
let taskContext: any;

function initializeEventContext(_client: any, _taskContext: any) {
  taskContext = _taskContext;
}

async function handleSessionIdle(client: any, sessionId: string) {
  const context: EventContext = {
    client,
    taskContext,
  };
  return handleSessionIdleAction(context, sessionId);
}

async function handleSessionUpdated(client: any, sessionId: string) {
  const context: EventContext = {
    client,
    taskContext,
  };
  return handleSessionUpdatedAction(context, sessionId);
}

async function handleMessageUpdated(client: any, sessionId: string) {
  const context: EventContext = {
    client,
    taskContext,
  };
  return handleMessageUpdatedAction(context, sessionId);
}

async function processSessionMessages(client: any, sessionId: string) {
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
