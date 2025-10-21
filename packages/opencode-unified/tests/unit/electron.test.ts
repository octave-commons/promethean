import test from 'ava';

// Import electron module
const { ELECTRON_VERSION, defaultElectronConfig } = await import('../../src/typescript/electron');

test('electron module exports correct version', (t) => {
  t.is(ELECTRON_VERSION, '1.0.0');
});

test('default electron config is valid', (t) => {
  const config = defaultElectronConfig;

  t.is(config.width, 1200);
  t.is(config.height, 800);
  t.true(config.webSecurity);
  t.false(config.nodeIntegration);
  t.true(config.contextIsolation);
});

test('electron config has security defaults', (t) => {
  const config = defaultElectronConfig;

  t.true(config.webSecurity);
  t.false(config.nodeIntegration);
  t.true(config.contextIsolation);
});
