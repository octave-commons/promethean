import test from 'ava';

import { makePolicy, NotAllowedError } from '../policy.js';

const providerPolicy = makePolicy({
  providerAccess: { allowPatterns: ['services/ts/discord-rest/'] },
});

test('provider caps obey access rules', async (t) => {
  await t.notThrowsAsync(() =>
    providerPolicy.checkCapability('services/ts/discord-rest/', {
      kind: 'provider.rest.call',
      provider: 'discord',
      tenant: 'duck',
      route: '/foo',
    }),
  );
  await t.throwsAsync(
    () =>
      providerPolicy.checkCapability('services/ts/discord-message-indexer/', {
        kind: 'provider.rest.call',
        provider: 'discord',
        tenant: 'duck',
        route: '/foo',
      }),
    { instanceOf: NotAllowedError },
  );
});

test('permission gate denies as configured', async (t) => {
  const policy = makePolicy({
    permissionGate: (subject, action) => subject === 'good' && action === 'ping',
  });
  await t.notThrowsAsync(() => policy.assertAllowed('good', 'ping'));
  await t.throwsAsync(() => policy.assertAllowed('bad', 'ping'), {
    instanceOf: NotAllowedError,
  });
});
