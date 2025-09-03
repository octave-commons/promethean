import test from 'ava';

import { toUrn, fromUrn } from '../urn.js';

test('URN round-trip', (t) => {
    const u = toUrn('discord', 'space', 'duck', '123');
    t.is(u, 'urn:discord:space:duck:123');
    const p = fromUrn(u);
    t.deepEqual(p, { provider: 'discord', kind: 'space', tenant: 'duck', id: '123' });
});
