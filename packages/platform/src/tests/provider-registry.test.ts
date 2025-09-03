// SPDX-License-Identifier: GPL-3.0-only
import test from 'ava';
import path from 'node:path';
import { fileBackedRegistry } from '../provider-registry.js';

test('loads providers.yml and expands env', async (t) => {
    const configPath = path.resolve(process.cwd(), 'config/providers.yml');
    process.env.DISCORD_TOKEN_DUCK = 'x.test.token';
    const reg = fileBackedRegistry(configPath);
    const one = await reg.get('discord', 'duck');
    t.is(one.provider, 'discord');
    t.is(one.tenant, 'duck');
    t.truthy(one.credentials.bot_token);
    t.is(one.credentials.bot_token, 'x.test.token');
    const all = await reg.list('discord');
    t.true(all.length >= 1);
});
