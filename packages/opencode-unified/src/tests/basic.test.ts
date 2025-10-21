import test from 'ava';

test('package structure is valid', (t) => {
  t.pass('Basic test passes');
});

test('modules can be imported', async (t) => {
  const { SERVER_VERSION } = await import('../../dist/typescript/server/index.js');
  const { CLIENT_VERSION } = await import('../../dist/typescript/client/index.js');
  const { SHARED_VERSION } = await import('../../dist/typescript/shared/index.js');
  const { ELECTRON_VERSION } = await import('../../dist/typescript/electron/index.js');

  t.is(SERVER_VERSION, '1.0.0');
  t.is(CLIENT_VERSION, '1.0.0');
  t.is(SHARED_VERSION, '1.0.0');
  t.is(ELECTRON_VERSION, '1.0.0');
});
