import test from 'ava';

// Import shared module
const { SHARED_VERSION, defaultLoggerConfig } = await import('../../src/typescript/shared');

test('shared module exports correct version', (t) => {
  t.is(SHARED_VERSION, '1.0.0');
});

test('default logger config is valid', (t) => {
  const config = defaultLoggerConfig;

  t.is(config.level, 'info');
  t.is(config.format, 'text');
});

test('logger config has required properties', (t) => {
  const config = defaultLoggerConfig;

  t.true(['debug', 'info', 'warn', 'error'].includes(config.level));
  t.true(['json', 'text'].includes(config.format));
});
