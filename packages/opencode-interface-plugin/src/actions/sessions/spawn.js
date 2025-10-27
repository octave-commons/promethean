// SPDX-License-Identifier: GPL-3.0-only
export async function spawn({ title, message, client, }) {
    if (!client) {
        throw new Error('OpenCode client is required for session spawning');
    }
    try {
        // Create session first
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
        // Send spawn message if provided
        if (message) {
            // const { data: sentMessage, error: messageError } = await client.session.prompt({
            //   path: { id: session.id },
            //   body: { parts: [{ type: 'text' as const, text: message }] },
            // });
            // if we don't do this, then it blocks agent who is
            // spawning from doing anything else, which defeats purpose.
            // But it also means we can't return message info here.
            client.session.prompt({
                path: { id: session.id },
                body: { parts: [{ type: 'text', text: message }] },
            });
        }
        // TODO: stop stringifying these actoins.
        return JSON.stringify({
            success: true,
            session: {
                id: session.id,
                title: session.title,
                createdAt: session.time?.created,
            },
        });
        // NOTE: returning message info here is problematic,
        // we need to stop doing this.
        // we end up just parsing it again later.
        // this should not be responsibility of an action
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
    }
    catch (error) {
        throw new Error(`Failed to spawn session on OpenCode server: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=spawn.js.map