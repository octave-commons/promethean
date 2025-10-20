import { TaskContext } from '../tasks/index.js';
import type { EventClient, OpenCodeEvent, EventMessage } from '../../types/index.js';
import { OpencodeClient } from '@opencode-ai/sdk';

export interface EventContext {
  client: EventClient;
  taskContext: TaskContext;
}

export async function handleSessionIdle(context: EventContext, sessionId: string): Promise<void> {
  console.log(`💤 Session ${sessionId} is idle`);
  const { updateTaskStatus } = await import('../tasks/index.js');
  await updateTaskStatus(context.taskContext, sessionId, 'idle');

  const messages = await getSessionMessages(context.client, sessionId);
  const completion = detectTaskCompletion(messages as EventMessage[]);
  if (completion.completed) {
    await updateTaskStatus(
      context.taskContext,
      sessionId,
      'completed',
      completion.completionMessage,
    );
  }
}

export async function handleSessionUpdated(
  context: EventContext,
  sessionId: string,
): Promise<void> {
  console.log(`🔄 Session ${sessionId} updated`);
  const { updateTaskStatus } = await import('../tasks/index.js');
  await updateTaskStatus(context.taskContext, sessionId, 'running');
}

export async function handleMessageUpdated(
  context: EventContext,
  sessionId: string,
): Promise<void> {
  console.log(`💬 Message updated in session ${sessionId}`);
  const { updateTaskStatus } = await import('../tasks/index.js');
  await updateTaskStatus(context.taskContext, sessionId, 'running');
}

export async function processSessionMessages(
  context: EventContext,
  sessionId: string,
): Promise<void> {
  await processSessionMessagesAction(context.client, sessionId);
}

export function extractSessionId(event: OpenCodeEvent): string | null {
  const extractors: Record<string, () => string | undefined> = {
    'session.idle': () =>
      (event.properties as any)?.sessionID || (event.properties as any)?.session?.id,
    'session.updated': () =>
      (event.properties as any)?.info?.id || (event.properties as any)?.session?.id,
    'message.updated': () => (event.properties as any)?.message?.session_id || event.sessionId,
    'message.part.updated': () => (event.properties as any)?.message?.session_id || event.sessionId,
    'session.compacted': () => event.sessionId || (event.properties as any)?.session?.id,
  };

  const extractor = extractors[event.type];
  return extractor ? extractor() || null : null;
}

export async function getSessionMessages(client: OpencodeClient, sessionId: string) {
  try {
    const { data: messages } = await client.session.messages({
      path: { id: sessionId },
    });
    return messages || [];
  } catch (error: unknown) {
    console.error(`Error fetching messages for session ${sessionId}:`, error);
    return [];
  }
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

export async function processSessionMessagesAction(client: EventClient, sessionId: string) {
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
) {
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
