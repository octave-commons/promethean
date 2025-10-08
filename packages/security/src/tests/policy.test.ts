import test from 'ava';

import { makePolicy, NotAllowedError } from '../index.js';

const providerPolicy = makePolicy({
  providerAccess: { allowPatterns: ['services/ts/discord/'] },
});

test('provider caps obey access rules', async (t) => {
  await t.notThrowsAsync(() =>
    providerPolicy.checkCapability('services/ts/discord/', {
      kind: 'provider.rest.call',
      provider: 'discord',
      tenant: 'duck',
      route: '/foo',
    }),
  );
  await t.throwsAsync(
    () =>
      providerPolicy.checkCapability('services/ts/discord-other/', {
        kind: 'provider.rest.call',
        provider: 'discord',
        tenant: 'duck',
        route: '/foo',
      }),
    {
      instanceOf: NotAllowedError,
      message: /Policy denied .*provider\.rest\.call.*agent services\/ts\/discord-other\//,
    },
  );
});

test('provider glob patterns escape regex specials', async (t) => {
  const policy = makePolicy({
    providerAccess: { allowPatterns: ['services/ts/discord.v1'] },
  });

  await t.notThrowsAsync(() =>
    policy.checkCapability('services/ts/discord.v1', {
      kind: 'provider.rest.call',
      provider: 'discord',
      tenant: 'duck',
      route: '/foo',
    }),
  );

  await t.throwsAsync(
    () =>
      policy.checkCapability('services/ts/discordxv1', {
        kind: 'provider.rest.call',
        provider: 'discord',
        tenant: 'duck',
        route: '/foo',
      }),
    {
      instanceOf: NotAllowedError,
      message: /Policy denied .*provider\.rest\.call.*agent services\/ts\/discordxv1/,
    },
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
  // capability checks should not be blocked by permissionGate
  await t.notThrowsAsync(() =>
    policy.checkCapability('any', { kind: 'http.fetch', url: 'https://example.test' }),
  );
});
