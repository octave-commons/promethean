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
    if (message) {
      // const { data: sentMessage, error: messageError } = await client.session.prompt({
      //   path: { id: session.id },
      //   body: { parts: [{ type: 'text' as const, text: message }] },
      // });

      // if we don't do this, then it blocks the agent who is
      // spawning from doing anything else, which defeats the purpose.
      // But it also means we can't return the message info here.
      client.session.prompt({
        path: { id: session.id },
        body: { parts: [{ type: 'text' as const, text: message }] },
      });
    }

    // we need to stop doing this.
    // we end up just parsing it again later.
    // this should not be the responsibility of an action
    // return JSON.stringify({
    //   success: true,
    //   session: {
    //     id: session.id,
    //     title: session.title,
    //     createdAt: session.time?.created,
    //   },
    //   message: messageResult
    //     ? {
    //         id: messageResult.info?.id,
    //         content: message,
    //         sentAt: messageResult.info?.time?.created,
    //       }
    //     : null,
    // });
  } catch (error: unknown) {
    throw new Error(
      `Failed to spawn session on OpenCode server: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
