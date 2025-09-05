import test from 'ava';

import { makePolicy, NotAllowedError } from '@promethean/security/policy.js';

const policy = makePolicy({
  providerAccess: { allowPatterns: ['services/ts/discord-rest/'] },
});

test('provider caps allowed for access agents', async (t) => {
  await t.notThrowsAsync(() =>
    policy.checkCapability('services/ts/discord-rest/', {
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
      policy.checkCapability('services/ts/discord-message-indexer/', {
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
    } as any),
  );
});
