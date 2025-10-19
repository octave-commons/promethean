import { randomUUID } from 'node:crypto';
import { sessionStore } from '../../index.js';
import type { OpencodeClient } from '@opencode-ai/sdk';

export async function create({
  title,
  files,
  delegates,
  client,
}: {
  title?: string;
  files?: string[];
  delegates?: string[];
  client?: OpencodeClient;
}) {
  try {
    // Try server first if client is provided
    if (client) {
      const { data: session, error } = await client.session.create({
        body: {
          title,
        },
      });

      if (error) return `Failed to create session: ${error}`;
      if (!session) return 'No session created';

      return JSON.stringify({
        success: true,
        session: {
          id: session.id,
          title: session.title,
          createdAt: session.time?.created,
        },
      });
    }
  } catch (error: any) {
    console.error('Server create failed, falling back to local:', error.message);
  }

  // Local fallback
  try {
    const sessionId = randomUUID();
    const sessionTitle = title || 'New session';
    const now = new Date().toISOString();

    const sessionData = {
      id: sessionId,
      title: sessionTitle,
      activityStatus: 'active',
      isAgentTask: false,
      messageCount: 0,
      createdAt: now,
      lastActivityTime: now,
      files: files || [],
      delegates: delegates || [],
      metadata: {
        title: sessionTitle,
        activityStatus: 'active',
        isAgentTask: false,
        messageCount: 0,
        createdAt: now,
        files: files || [],
        delegates: delegates || [],
      },
    };

    await sessionStore.insert({
      id: sessionId,
      text: JSON.stringify(sessionData),
      metadata: sessionData.metadata,
      timestamp: now,
    });

    return JSON.stringify({
      success: true,
      session: {
        id: sessionId,
        title: sessionTitle,
        createdAt: now,
      },
    });
  } catch (error: any) {
    console.error('Error creating session locally:', error);
    return `Failed to create session: ${error.message}`;
  }
}
