import { DualStoreManager } from '@promethean/persistence';

export interface MessageContext {
  sessionStore: DualStoreManager<'text', 'timestamp'>;
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

export function detectTaskCompletion(messages: any[]): {
  completed: boolean;
  completionMessage?: string;
} {
  if (!messages?.length) return { completed: false };

  const lastMessage = messages[messages.length - 1];
  const textParts = lastMessage?.parts?.filter((part: any) => part.type === 'text') || [];

  if (!textParts.length) return { completed: false };

  const lastText = textParts[textParts.length - 1].text.toLowerCase();
  const isCompleted = COMPLETION_PATTERNS.some((pattern) => pattern.test(lastText));

  return {
    completed: isCompleted,
    completionMessage: isCompleted ? lastText : undefined,
  };
}

export async function processMessage(context: MessageContext, sessionId: string, message: any) {
  if (!message?.parts) return;

  await Promise.all(
    message.parts.map(async (part: any) => {
      if (part.type === 'text' && part.text.trim()) {
        try {
          await context.sessionStore.insert({
            id: message.info.id,
            text: part.text,
            timestamp: new Date().toISOString(),
            metadata: {
              sessionID: sessionId,
              messageID: message.info.id,
              type: 'text',
            },
          });
          console.log(`📝 Indexed message ${message.info.id} from session ${sessionId}`);
        } catch (error) {
          console.error(`Error storing message ${message.info.id}:`, error);
        }
      }
    }),
  );
}

export async function processSessionMessages(
  context: MessageContext,
  client: any,
  sessionId: string,
) {
  const messages = await getSessionMessages(client, sessionId);
  await Promise.all(messages.map((message: any) => processMessage(context, sessionId, message)));
}

export async function getSessionMessages(client: any, sessionId: string) {
  try {
    const { data: messages } = await client.session.messages({
      path: { id: sessionId },
    });
    return messages || [];
  } catch (error) {
    console.error(`Error fetching messages for session ${sessionId}:`, error);
    return [];
  }
}
