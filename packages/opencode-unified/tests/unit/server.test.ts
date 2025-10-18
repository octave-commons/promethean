import test from 'ava';

// Import server module
const { SERVER_VERSION, defaultServerConfig } = await import('../../src/typescript/server');

test('server module exports correct version', (t) => {
  t.is(SERVER_VERSION, '1.0.0');
});

test('default server config is valid', (t) => {
  const config = defaultServerConfig;

  t.is(config.port, 3000);
  t.is(config.host, '0.0.0.0');
  t.true(config.cors);
  t.true(config.swagger);
});

test('server config has required properties', (t) => {
  const config = defaultServerConfig;

  t.true(typeof config.port === 'number');
  t.true(typeof config.host === 'string');
  t.true(typeof config.cors === 'boolean');
  t.true(typeof config.swagger === 'boolean');
});
