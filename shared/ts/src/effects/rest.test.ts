import test from 'ava';
import { restRequest } from '../effects/rest.js';

test('restRequest wraps provider/tenant/route/body', (t) => {
    const out = restRequest('discord', 'duck', '/channels/1/messages', { content: 'hi' });
    t.deepEqual(out, { provider: 'discord', tenant: 'duck', route: '/channels/1/messages', body: { content: 'hi' } });
});
