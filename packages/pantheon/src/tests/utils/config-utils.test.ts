import test from 'ava';

import { mergeConfigs, validateConfig } from '../../utils/index.js';

test('mergeConfigs combines configurations', (t) => {
  const defaultConfig = {
    name: 'default',
    timeout: 5000,
    retries: 3,
    enabled: true,
  };

  const userConfig = {
    timeout: 10000,
    retries: 5,
  };

  const merged = mergeConfigs(defaultConfig, userConfig);

  t.is(merged.name, 'default'); // From default
  t.is(merged.timeout, 10000); // From user
  t.is(merged.retries, 5); // From user
  t.is(merged.enabled, true); // From default
});

test('mergeConfigs with empty user config', (t) => {
  const defaultConfig = {
    name: 'test',
    value: 42,
  };

  const userConfig = {};

  const merged = mergeConfigs(defaultConfig, userConfig);

  t.deepEqual(merged, defaultConfig);
});

test('mergeConfigs with empty default config', (t) => {
  const defaultConfig = {};
  const userConfig = {
    name: 'user',
    value: 100,
  };

  const merged = mergeConfigs(defaultConfig, userConfig);

  t.deepEqual(merged, userConfig);
});

test('mergeConfigs with nested objects', (t) => {
  const defaultConfig = {
    database: {
      host: 'localhost',
      port: 5432,
      ssl: false,
    },
    api: {
      version: 'v1',
    },
  };

  const userConfig = {
    database: {
      host: 'production.com',
      port: 5432,
      ssl: true,
    },
  };

  const merged = mergeConfigs(defaultConfig, userConfig);

  t.is(merged.database.host, 'production.com'); // Overridden
  t.is(merged.database.port, 5432); // Preserved from default
  t.is(merged.database.ssl, true); // Overridden
  t.is(merged.api.version, 'v1'); // Preserved from default
});

test('validateConfig with valid configuration', (t) => {
  const config = {
    name: 'test',
    timeout: 5000,
    retries: 3,
  };

  const requiredKeys = ['name', 'timeout', 'retries'];

  const isValid = validateConfig(config, requiredKeys);

  t.true(isValid);
});

test('validateConfig with missing required keys', (t) => {
  const config = {
    name: 'test',
    timeout: 5000,
    // Missing 'retries'
  };

  const requiredKeys = ['name', 'timeout', 'retries'];

  const isValid = validateConfig(config, requiredKeys);

  t.false(isValid);
});

test('validateConfig with empty required keys', (t) => {
  const config = {
    name: 'test',
  };

  const requiredKeys: string[] = [];

  const isValid = validateConfig(config, requiredKeys);

  t.true(isValid); // Always valid when no keys required
});

test('validateConfig with extra keys', (t) => {
  const config = {
    name: 'test',
    timeout: 5000,
    retries: 3,
    debug: true, // Extra key
    version: '1.0', // Extra key
  };

  const requiredKeys = ['name', 'timeout', 'retries'];

  const isValid = validateConfig(config, requiredKeys);

  t.true(isValid); // Extra keys don't affect validation
});

test('validateConfig with null/undefined values', (t) => {
  const config1 = {
    name: null,
    timeout: 5000,
  };

  const config2 = {
    name: 'test',
    timeout: undefined,
  };

  const requiredKeys = ['name', 'timeout'];

  t.false(validateConfig(config1, requiredKeys));
  t.false(validateConfig(config2, requiredKeys));
});
