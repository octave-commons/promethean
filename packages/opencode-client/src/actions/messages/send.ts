import { messageStore } from '../../index.js';

export interface SendMessageOptions {
  sessionId: string;
  content: string;
  role?: 'user' | 'assistant' | 'system';
}

export async function sendMessage(
  options: SendMessageOptions,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Store the message in the context store
    await messageStore.insert({
      id: messageId,
      text: JSON.stringify({
        id: messageId,
        sessionId: options.sessionId,
        content: options.content,
        role: options.role || 'user',
        timestamp: new Date().toISOString(),
        parts: [
          {
            type: 'text',
            text: options.content,
          },
        ],
      }),
      timestamp: new Date().toISOString(),
      metadata: {
        type: 'message',
        sessionId: options.sessionId,
        role: options.role || 'user',
        messageId: messageId,
      },
    });

    // Also store a reference in the session's messages collection
    const sessionMessageKey = `${options.sessionId}:messages`;
    await messageStore.insert({
      id: sessionMessageKey,
      text: JSON.stringify({
        sessionId: options.sessionId,
        messageId: messageId,
        content: options.content,
        role: options.role || 'user',
        timestamp: new Date().toISOString(),
      }),
      timestamp: new Date().toISOString(),
      metadata: {
        type: 'session_message',
        sessionId: options.sessionId,
        messageId: messageId,
      },
    });

    return { success: true, id: messageId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
