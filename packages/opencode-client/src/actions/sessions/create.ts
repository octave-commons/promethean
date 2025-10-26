import type { OpencodeClient } from '@opencode-ai/sdk';

export type CreateSessionResult = {
  readonly success: boolean;
  readonly session: {
    readonly id: string;
    readonly title?: string;
    readonly createdAt?: string | number;
  };
};

export async function create({
  title,
  client,
}: {
  readonly title?: string;
  readonly client?: OpencodeClient;
}): Promise<CreateSessionResult> {
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
      console.error('Debug - raw error:', error, 'type:', typeof error);
      console.error('Debug - error keys:', error ? Object.keys(error) : 'no keys');
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Debug - errorMessage:', errorMessage, 'type:', typeof errorMessage);
      throw new Error(`Failed to create session on OpenCode server: ${errorMessage}`);
    });

  if (!result.data) {
    throw new Error('No session created');
  }

  return {
    success: true,
    session: {
      id: result.data.id,
      title: result.data.title,
      createdAt: result.data.time?.created,
    },
  };
}
