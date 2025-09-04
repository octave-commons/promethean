import test from 'ava';

import { topic } from '../topic.js';

test('topic formats correctly', (t) => {
    const s = topic({ provider: 'discord', tenant: 'duck', area: 'events', name: 'created' });
    t.is(s, 'promethean.p.discord.t.duck.events.created');
});
