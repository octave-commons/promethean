import test from 'ava';
import { createPostMessage } from '../src/index.js';

test('creates PostMessage command with provider+tenant', (t) => {
    const cmd = createPostMessage('discord', 'duck', 'urn:discord:space:duck:channel42', 'hi');
    t.is(cmd.provider, 'discord');
    t.is(cmd.tenant, 'duck');
    t.is(cmd.space_urn, 'urn:discord:space:duck:channel42');
    t.is(cmd.text, 'hi');
});
