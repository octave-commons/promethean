import test from 'ava';

import { normalizeDiscordMessage } from './normalize.js';

const raw = {
    id: '12345',
    author: { id: 'u1' },
    channel_id: 'c1',
    content: 'hello world',
    attachments: [
        { id: 'a1', url: 'https://cdn/1', content_type: 'image/png', size: 10, hash: 'h1' },
        { id: 'a2', url: 'https://cdn/2', content_type: 'text/plain', size: 20, hash: 'h2' },
    ],
    timestamp: '2024-01-01T00:00:00.000Z',
};

test('normalizeDiscordMessage maps fields and attachments', (t) => {
    const evt = normalizeDiscordMessage(raw as any, 'duck');
    t.is(evt.provider, 'discord');
    t.is(evt.tenant, 'duck');
    t.is(evt.message_id, '12345');
    t.is(evt.text, 'hello world');
    t.is(evt.attachments?.length, 2);
    t.true(evt.attachments![0].urn.startsWith('urn:discord:attachment:duck:'));
    t.is(evt.attachments![0].url, 'https://cdn/1');
});
