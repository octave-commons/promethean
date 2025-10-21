import { OpencodeClient } from '@opencode-ai/sdk';

import type { OpenCodeEvent, EventMessage } from '../../types/index.js';

export type EventContext = {
  readonly client: OpencodeClient;
};

export async function handleSessionIdle(_context: EventContext, sessionId: string): Promise<void> {
  console.log(`💤 Session ${sessionId} is idle`);
  // Simple session state tracking - no task management
}

export async function handleSessionUpdated(
  _context: EventContext,
  sessionId: string,
): Promise<void> {
  console.log(`🔄 Session ${sessionId} updated`);
  // Simple session state tracking - no task management
}

export async function handleMessageUpdated(
  _context: EventContext,
  sessionId: string,
): Promise<void> {
  console.log(`💬 Message updated in session ${sessionId}`);
  // Simple message tracking - no task management
}

export async function processSessionMessages(
  context: EventContext,
  sessionId: string,
): Promise<void> {
  await processSessionMessagesAction(context.client, sessionId);
}

export function extractSessionId(event: OpenCodeEvent): string | null {
  // All OpenCodeEvent types have sessionId directly
  return event.sessionId || null;
}

export async function getSessionMessages(
  client: OpencodeClient,
  sessionId: string,
): Promise<unknown[]> {
  const result = await client.session
    .messages({
      path: { id: sessionId },
    })
    .catch((error: unknown) => {
      console.error(`Error fetching messages for session ${sessionId}:`, error);
      return { data: [] };
    });
  return result.data || [];
}

const COMPLETION_PATTERNS = [
  /task.*completed/i,
  /finished.*task/i,
  /done.*with.*task/i,
  /task.*finished/i,
  /completed.*successfully/i,
  /work.*complete/i,
  /all.*done/i,
  /mission.*accomplished/i,
  /objective.*achieved/i,
  /✅|🎉|🏆|✓/g,
];

export function detectTaskCompletion(messages: EventMessage[]): {
  completed: boolean;
  completionMessage?: string;
} {
  if (!messages?.length) return { completed: false };

  const lastMessage = messages[messages.length - 1];
  const textParts = lastMessage?.parts?.filter((part) => part.type === 'text') || [];

  if (!textParts.length) return { completed: false };

  const lastText = textParts[textParts.length - 1]?.text?.toLowerCase() || '';
  const isCompleted = COMPLETION_PATTERNS.some((pattern) => pattern.test(lastText));

  return {
    completed: isCompleted,
    completionMessage: isCompleted ? lastText : undefined,
  };
}

export async function processSessionMessagesAction(
  client: OpencodeClient,
  sessionId: string,
): Promise<void> {
  const messages = await getSessionMessages(client, sessionId);
  await Promise.all(
    (messages as EventMessage[]).map((message: EventMessage) =>
      processMessage(client, sessionId, message),
    ),
  );
}

export async function processMessage(
  _client: OpencodeClient,
  sessionId: string,
  message: EventMessage,
): Promise<void> {
  if (!message?.parts) return;

  // This would need session store context - for now just log
  console.log(`Processing message ${message.info.id} from session ${sessionId}`);

  await Promise.all(
    message.parts.map(async (part) => {
      if (part.type === 'text' && part.text?.trim()) {
        console.log(`📝 Processing text part from message ${message.info.id}`);
      }
    }),
  );
}
