/**
 * Read/Write Separated Message Processor
 * Write operations (sending messages) go directly to OpenCode SDK
 * Read operations (getting messages) come from local database cache
 * EventWatcherService handles synchronization between SDK and local cache
 */

import {
  sendMessage as sendViaSDK,
  getSessionMessages as getFromCache,
} from './sessions-rw-separated.js';

export interface Message {
  info: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    time: {
      created: number;
      updated: number;
    };
  };
  parts: Array<{
    type: 'text' | 'image' | 'file';
    text?: string;
    [key: string]: any;
  }>;
}

export interface MessageContext {
  // No session store needed in write-separated architecture
  // All operations go through SDK or cache
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

/**
 * Detect if a task is completed based on message content
 */
export function detectTaskCompletion(messages: Message[]): {
  completed: boolean;
  completionMessage?: string;
} {
  if (!messages?.length) return { completed: false };

  const lastMessage = messages[messages.length - 1];
  const textParts = lastMessage?.parts?.filter((part) => part.type === 'text') || [];

  if (!textParts.length) return { completed: false };

  const lastText = (textParts[0]?.text || '').toLowerCase();
  const isCompleted = COMPLETION_PATTERNS.some((pattern) => pattern.test(lastText));

  return {
    completed: isCompleted,
    completionMessage: isCompleted ? lastText : undefined,
  };
}

/**
 * WRITE OPERATION: Send a message via OpenCode SDK
 * The EventWatcherService will handle projecting this to the local cache
 */
export async function processMessage(
  _context: MessageContext,
  sessionId: string,
  message: any,
): Promise<void> {
  if (!message?.parts) return;

  // Extract text content from message parts
  const textParts = message.parts.filter((part: any) => part.type === 'text' && part.text.trim());

  if (!textParts.length) return;

  // Send each text part via SDK
  await Promise.all(
    textParts.map(async (part: any) => {
      try {
        await sendViaSDK({
          sessionId,
          message: part.text,
        });
        console.log(`📝 Sent message ${message.info.id} to session ${sessionId} via SDK`);
      } catch (error) {
        console.error(`Error sending message ${message.info.id} via SDK:`, error);
        throw error; // Re-throw to handle upstream
      }
    }),
  );
}

/**
 * READ OPERATION: Get messages from local cache
 */
export async function getSessionMessages(
  _context: MessageContext,
  sessionId: string,
): Promise<Message[]> {
  try {
    return await getFromCache(sessionId);
  } catch (error) {
    console.error(`Error fetching messages for session ${sessionId} from cache:`, error);
    return [];
  }
}

/**
 * Process all messages in a session (for bulk operations)
 * This is primarily used for initial indexing or bulk synchronization
 */
export async function processSessionMessages(
  context: MessageContext,
  _client: any, // Client not needed in read-separated architecture
  sessionId: string,
): Promise<void> {
  const messages = await getSessionMessages(context, sessionId);

  // In read-separated architecture, this would typically be used by the EventWatcherService
  // to project messages from SDK to local cache
  console.log(`📋 Processing ${messages.length} messages for session ${sessionId}`);

  // The actual projection is handled by EventWatcherService
  // This function is mainly for compatibility with existing code
}

/**
 * Create a message object in the expected format
 */
export function createMessage(
  content: string,
  role: 'user' | 'assistant' | 'system' = 'user',
): Message {
  const now = Date.now();
  return {
    info: {
      id: `msg_${now}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      time: {
        created: now,
        updated: now,
      },
    },
    parts: [
      {
        type: 'text',
        text: content,
      },
    ],
  };
}

// Create a class-like export for backward compatibility
export const MessageProcessor = {
  detectTaskCompletion,
  processMessage,
  getSessionMessages,
  processSessionMessages,
  createMessage,
};

// Types are already exported above
