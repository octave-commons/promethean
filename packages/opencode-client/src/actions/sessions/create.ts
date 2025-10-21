import type { OpencodeClient } from '@opencode-ai/sdk';

export async function create({
  title,
  client,
}: {
  readonly title?: string;
  readonly client?: OpencodeClient;
}): Promise<string> {
  if (!client) {
    throw new Error('OpenCode client is required for session creation');
  }

  const result = await client.session
    .create({
      body: {
        title,
      },
    })
    .catch((error: unknown) => {
      throw new Error(
        `Failed to create session on OpenCode server: ${error instanceof Error ? error.message : String(error)}`,
      );
    });

  if (!result.data) {
    throw new Error('No session created');
  }

  return JSON.stringify({
    success: true,
    session: {
      id: result.data.id,
      title: result.data.title,
      createdAt: result.data.time?.created,
    },
  });
}
