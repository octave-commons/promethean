import type { OpencodeClient } from '@opencode-ai/sdk';

export async function create({ title, client }: { title?: string; client?: OpencodeClient }) {
  if (!client) {
    throw new Error('OpenCode client is required for session creation');
  }

  try {
    const { data: session, error } = await client.session.create({
      body: {
        title,
      },
    });

    if (error) {
      throw new Error(`Failed to create session: ${error}`);
    }

    if (!session) {
      throw new Error('No session created');
    }

    return JSON.stringify({
      success: true,
      session: {
        id: session.id,
        title: session.title,
        createdAt: session.time?.created,
      },
    });
  } catch (error: any) {
    throw new Error(`Failed to create session on OpenCode server: ${error.message}`);
  }
}
