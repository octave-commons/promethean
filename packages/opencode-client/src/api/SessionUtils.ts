import { AgentTask } from '../AgentTask.js';
import { SessionInfo } from '../SessionInfo.js';
import {
  extractSessionId as extractSessionIdAction,
  getSessionMessages as getSessionMessagesAction,
  determineActivityStatus as determineActivityStatusAction,
  createSessionInfo as createSessionInfoAction,
} from '../actions/sessions/utils.js';

export function extractSessionId(event: any): string | null {
  return extractSessionIdAction(event);
}

export async function getSessionMessages(client: any, sessionId: string) {
  return getSessionMessagesAction(client, sessionId);
}

export function determineActivityStatus(
  session: any,
  messageCount: number,
  agentTask?: AgentTask,
): string {
  return determineActivityStatusAction(session, messageCount, agentTask);
}

export function createSessionInfo(
  session: any,
  messageCount: number,
  agentTask?: AgentTask,
): SessionInfo {
  return createSessionInfoAction(session, messageCount, agentTask);
}

// Create a class-like export for backward compatibility
export const SessionUtils = {
  extractSessionId,
  getSessionMessages,
  determineActivityStatus,
  createSessionInfo,
};
