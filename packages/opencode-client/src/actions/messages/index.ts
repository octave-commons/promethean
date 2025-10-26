import { DualStoreManager } from '@promethean-os/persistence';

import type { EventMessage } from '../../types/index.js';

export type MessageContext = {
  readonly sessionStore: DualStoreManager<'text', 'timestamp'>;
};

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
  /✅|🎉|🏆|✓/,
];

export function detectTaskCompletion(messages: readonly EventMessage[]): {
  readonly completed: boolean;
  readonly completionMessage?: string;
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

export async function processMessage(
  context: MessageContext,
  sessionId: string,
  message: EventMessage,
): Promise<void> {
  if (!message?.parts) return;

  // Store the complete message as a single entry
  const messageText = message.parts
    .filter((part) => part.type === 'text' && part.text?.trim())
    .map((part) => part.text)
    .join('\n\n');

  if (!messageText) return;

  try {
    await context.sessionStore.insert({
      id: message.info.id,
      text: JSON.stringify({
        info: message.info,
        parts: message.parts,
      }),
      timestamp: new Date().toISOString(),
      metadata: {
        sessionID: sessionId,
        messageID: message.info.id,
        type: 'message',
        role: message.info?.role,
      },
    });
    console.log(`📝 Indexed message ${message.info.id} from session ${sessionId}`);
  } catch (error) {
    console.error(`Error storing message ${message.info.id}:`, error);
  }
}

export async function processSessionMessages(
  context: MessageContext,
  client: {
    session: { messages: (params: { path: { id: string } }) => Promise<{ data?: EventMessage[] }> };
  },
  sessionId: string,
): Promise<void> {
  const messages = await getSessionMessages(client, sessionId);
  await Promise.all(
    messages.map((message: EventMessage) => processMessage(context, sessionId, message)),
  );
}

export async function getSessionMessages(
  client: {
    session: { messages: (params: { path: { id: string } }) => Promise<{ data?: EventMessage[] }> };
  },
  sessionId: string,
): Promise<EventMessage[]> {
  const result = await client.session
    .messages({
      path: { id: sessionId },
    })
    .catch((error: unknown) => {
      console.error(`Error fetching messages for session ${sessionId}:`, error);
      return { data: [] };
    });
  return (result.data as EventMessage[]) || [];
}
