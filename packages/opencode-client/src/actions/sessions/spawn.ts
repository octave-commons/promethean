import type { OpencodeClient } from '@opencode-ai/sdk';

export async function spawn({
  title,
  message,
  client,
}: {
  title?: string;
  message?: string;
  client?: OpencodeClient;
}) {
  if (!client) {
    throw new Error('OpenCode client is required for session spawning');
  }

  try {
    // Create the session first
    const { data: session, error: createError } = await client.session.create({
      body: {
        title: title || 'Spawn Session',
      },
    });

    if (createError) {
      throw new Error(`Failed to create session: ${createError}`);
    }

    if (!session) {
      throw new Error('No session created');
    }

    // Send the spawn message if provided
    let messageResult = null;
    if (message) {
      const { data: sentMessage, error: messageError } = await client.session.prompt({
        path: { id: session.id },
        body: { parts: [{ type: 'text' as const, text: message }] },
      });

      if (messageError) {
        throw new Error(`Failed to send spawn message: ${messageError}`);
      }

      messageResult = sentMessage;
    }

    return JSON.stringify({
      success: true,
      session: {
        id: session.id,
        title: session.title,
        createdAt: session.time?.created,
      },
      message: messageResult
        ? {
            id: messageResult.info?.id,
            content: message,
            sentAt: messageResult.info?.time?.created,
          }
        : null,
    });
  } catch (error: unknown) {
    throw new Error(
      `Failed to spawn session on OpenCode server: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
