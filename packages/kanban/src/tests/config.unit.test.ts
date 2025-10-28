import { resolve } from 'path';
import { existsSync } from 'fs';

import test from 'ava';

import { ConfigSchema } from '../config.ts';

test('ConfigSchema validates valid configuration', (t) => {
  const config = {
    path: process.cwd(),
    debounceMs: 5000,
    baseUrl: 'https://api.example.com/v1',
    apiKey: 'valid-key-123',
    model: 'gpt-4',
    temperature: 0.5,
    maxDiffBytes: 15000,
    exclude: '*.log,node_modules',
    signoff: true,
    dryRun: false,
  };

  const result = ConfigSchema.parse(config);
  t.is(result.path, config.path);
  t.is(result.debounceMs, 5000);
  t.is(result.apiKey, 'valid-key-123');
});

test('ConfigSchema uses defaults for missing fields', (t) => {
  const config = { path: process.cwd() };
  const result = ConfigSchema.parse(config);

  t.is(result.debounceMs, 10000);
  t.is(result.baseUrl, 'http://localhost:11434/v1');
  t.is(result.model, 'llama3.1:8b');
  t.is(result.temperature, 0.2);
  t.is(result.maxDiffBytes, 20000);
  t.is(result.exclude, '');
  t.is(result.signoff, false);
  t.is(result.dryRun, false);
});

test('ConfigSchema rejects invalid API key format', (t) => {
  const config = {
    path: process.cwd(),
    apiKey: 'invalid@key#',
  };

  t.throws(() => ConfigSchema.parse(config), {
    message: /API key contains invalid characters/,
  });
});

test('ConfigSchema accepts valid API key formats', (t) => {
  const validKeys = [
    'sk-1234567890',
    '1234567890abcdef',
    'test-key_with-underscores',
    'api.key.with.dots',
  ];

  validKeys.forEach((apiKey) => {
    const config = { path: process.cwd(), apiKey };
    const result = ConfigSchema.parse(config);
    t.is(result.apiKey, apiKey);
  });
});

test('ConfigSchema rejects invalid paths', (t) => {
  const config = {
    path: '../../../etc/passwd',
  };

  t.throws(() => ConfigSchema.parse(config), {
    message: /Invalid path/,
  });
});

test('ConfigSchema accepts valid paths', (t) => {
  const validPaths = [
    process.cwd(),
    resolve(process.cwd(), 'subdir'),
    '/tmp', // Existing absolute path
  ];

  validPaths.forEach((path) => {
    const config = { path };
    // Only test if path exists
    if (existsSync(path)) {
      const result = ConfigSchema.parse(config);
      t.is(result.path, path);
    }
  });
});

test('ConfigSchema validates debounceMs bounds', (t) => {
  // Too small
  t.throws(() => ConfigSchema.parse({ path: process.cwd(), debounceMs: 500 }), {
    message: /debounceMs/,
  });

  // Too large
  t.throws(() => ConfigSchema.parse({ path: process.cwd(), debounceMs: 500000 }), {
    message: /debounceMs/,
  });

  // Valid bounds
  const validValues = [1000, 10000, 300000];
  validValues.forEach((debounceMs) => {
    const result = ConfigSchema.parse({ path: process.cwd(), debounceMs });
    t.is(result.debounceMs, debounceMs);
  });
});

test('ConfigSchema validates temperature bounds', (t) => {
  // Too small
  t.throws(() => ConfigSchema.parse({ path: process.cwd(), temperature: -0.1 }), {
    message: /temperature/,
  });

  // Too large
  t.throws(() => ConfigSchema.parse({ path: process.cwd(), temperature: 2.1 }), {
    message: /temperature/,
  });

  // Valid bounds
  const validValues = [0, 0.5, 1, 2];
  validValues.forEach((temperature) => {
    const result = ConfigSchema.parse({ path: process.cwd(), temperature });
    t.is(result.temperature, temperature);
  });
});

test('ConfigSchema validates maxDiffBytes bounds', (t) => {
  // Too small
  t.throws(() => ConfigSchema.parse({ path: process.cwd(), maxDiffBytes: 500 }), {
    message: /maxDiffBytes/,
  });

  // Too large
  t.throws(() => ConfigSchema.parse({ path: process.cwd(), maxDiffBytes: 200000 }), {
    message: /maxDiffBytes/,
  });

  // Valid bounds
  const validValues = [1000, 20000, 100000];
  validValues.forEach((maxDiffBytes) => {
    const result = ConfigSchema.parse({ path: process.cwd(), maxDiffBytes });
    t.is(result.maxDiffBytes, maxDiffBytes);
  });
});

test('ConfigSchema validates URL format for baseUrl', (t) => {
  // Invalid URLs
  const invalidUrls = ['not-a-url', 'ftp://invalid-protocol.com', ''];

  invalidUrls.forEach((baseUrl) => {
    t.throws(() => ConfigSchema.parse({ path: process.cwd(), baseUrl }), {
      message: /baseUrl/,
    });
  });

  // Valid URLs
  const validUrls = [
    'https://api.openai.com/v1',
    'http://localhost:11434/v1',
    'https://example.com/api',
  ];

  validUrls.forEach((baseUrl) => {
    const result = ConfigSchema.parse({ path: process.cwd(), baseUrl });
    t.is(result.baseUrl, baseUrl);
  });
});

test('ConfigSchema coerces string numbers to numbers', (t) => {
  const config = {
    path: process.cwd(),
    debounceMs: '5000',
    temperature: '0.7',
    maxDiffBytes: '15000',
    signoff: 'true',
    dryRun: 'false',
  };

  const result = ConfigSchema.parse(config);
  t.is(result.debounceMs, 5000);
  t.is(result.temperature, 0.7);
  t.is(result.maxDiffBytes, 15000);
  t.is(result.signoff, true);
  t.is(result.dryRun, false);
});
