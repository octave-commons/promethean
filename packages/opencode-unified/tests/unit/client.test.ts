import test from 'ava';

// Import client module
const { CLIENT_VERSION, defaultClientConfig } = await import('../../src/typescript/client');

test('client module exports correct version', (t) => {
  t.is(CLIENT_VERSION, '1.0.0');
});

test('default client config is valid', (t) => {
  const config = defaultClientConfig;

  t.is(config.endpoint, 'http://localhost:3000');
  t.is(config.timeout, 30000);
  t.is(config.retries, 3);
});

test('client config has required properties', (t) => {
  const config = defaultClientConfig;

  t.true(typeof config.endpoint === 'string');
  t.true(typeof config.timeout === 'number');
  t.true(typeof config.retries === 'number');
});
