import test from 'ava';
import { embedMessage } from '../src/index.js';

test('embeds text into provider+tenant namespace', async (t) => {
    process.env.DISCORD_TOKEN_DUCK = 'test';
    process.env.EMBEDDING_DIM = '16';
    const out = await embedMessage({
        message_id: 'm1',
        author_urn: 'urn:discord:user:duck:u1',
        space_urn: 'urn:discord:space:duck:c1',
        text: 'hello',
        created_at: new Date().toISOString(),
        provider: 'discord',
        tenant: 'duck',
    } as any);
    t.truthy(out);
    t.regex(out!.ns, /discord__duck/);
});
