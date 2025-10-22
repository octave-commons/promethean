import test from 'ava';
import { makePolicy, NotAllowedError } from '@promethean/security';

const policy = makePolicy({
    providerAccess: { allowPatterns: ['services/ts/discord/'] },
});

test('provider caps allowed for access agents', async (t) => {
    await t.notThrowsAsync(() =>
        policy.checkCapability('services/ts/discord/', {
            kind: 'provider.rest.call',
            provider: 'discord',
            tenant: 'duck',
            route: '/foo',
        }),
    );
});

test('provider caps denied for others', async (t) => {
    await t.throwsAsync(
        () =>
            policy.checkCapability('services/ts/discord-other/', {
                kind: 'provider.rest.call',
                provider: 'discord',
                tenant: 'duck',
                route: '/foo',
            }),
        { instanceOf: NotAllowedError },
    );
});

test('provider caps do not overmatch similar prefixes', async (t) => {
    const pol = makePolicy({
        providerAccess: { allowPatterns: ['services/ts/discord/'] },
    });
    await t.throwsAsync(
        () =>
            pol.checkCapability('services/ts/discord-bad/', {
                kind: 'provider.rest.call',
                provider: 'discord',
                tenant: 'duck',
                route: '/foo',
            }),
        { instanceOf: NotAllowedError },
    );
});

test('non-provider caps pass by default', async (t) => {
    await t.notThrowsAsync(() =>
        policy.checkCapability('any/agent', {
            kind: 'storage.mongo',
            db: 'db',
            coll: 'messages',
        }),
    );
});
