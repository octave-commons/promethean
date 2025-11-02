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
      let errorMessage: string;

      if (error instanceof Error) {
        // Handle sinon stub objects where the string might be in 'name' property
        errorMessage = error.message || (error as any).name || String(error);
      } else if (error && typeof error === 'object' && (error as any).name) {
        // Handle sinon stub objects where the string is in the 'name' property
        errorMessage = (error as any).name;
      } else {
        errorMessage = String(error);
      }

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
