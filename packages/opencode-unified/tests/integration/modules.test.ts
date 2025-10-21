import test from 'ava';

test('all modules can be imported together', async (t) => {
  const server = await import('../../src/typescript/server');
  const client = await import('../../src/typescript/client');
  const shared = await import('../../src/typescript/shared');
  const electron = await import('../../src/typescript/electron');
  const schemas = await import('../../src/schemas');

  // Test that all modules export expected versions
  t.is(server.SERVER_VERSION, '1.0.0');
  t.is(client.CLIENT_VERSION, '1.0.0');
  t.is(shared.SHARED_VERSION, '1.0.0');
  t.is(electron.ELECTRON_VERSION, '1.0.0');
  t.is(schemas.SCHEMAS_VERSION, '1.0.0');
});

test('main index exports all modules', async (t) => {
  const main = await import('../../src/typescript');

  // Test that main index re-exports all modules
  t.truthy(main.SERVER_VERSION);
  t.truthy(main.CLIENT_VERSION);
  t.truthy(main.SHARED_VERSION);
  t.truthy(main.ELECTRON_VERSION);
  t.truthy(main.SCHEMAS_VERSION);
  t.truthy(main.PACKAGE_INFO);
  t.truthy(main.VERSION);
});

test('package info is consistent', async (t) => {
  const { PACKAGE_INFO, VERSION } = await import('../../src/typescript');

  t.is(PACKAGE_INFO.name, '@promethean/opencode-unified');
  t.is(PACKAGE_INFO.version, VERSION);
  t.is(PACKAGE_INFO.author, 'Promethean Team');
  t.is(PACKAGE_INFO.license, 'GPL-3.0-only');
  t.true(PACKAGE_INFO.description.includes('Unified OpenCode'));
});
