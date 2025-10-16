import { promises as fs } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';

import test from 'ava';
import {
  setChromaClient,
  setEmbeddingFactory,
  type IndexerManager,
} from '@promethean/indexer-core';

import { createIndexerServiceClient, IndexerServiceError } from '../client.js';
import { buildServer } from '../server.js';

test.before(() => {
  setChromaClient({
    async getOrCreateCollection() {
      return {
        upsert: async () => {},
        delete: async () => {},
        query: async () => ({
          ids: [],
          documents: [],
          metadatas: [],
          distances: [],
        }),
      };
    },
  });
  setEmbeddingFactory(async () => ({
    generate: async () => [],
  }));
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForIdle(manager: IndexerManager, timeoutMs = 10_000) {
  const start = Date.now();
  while (manager.isBusy()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('waitForIdle timeout');
    }
    await delay(25);
  }
}

async function createTempDir() {
  const dir = await fs.mkdtemp(path.join(tmpdir(), 'indexer-service-'));
  return dir;
}

test.serial('indexer service resets and reports status', async (t) => {
  const root = await createTempDir();
  const cachePath = path.join(root, '.cache');
  await fs.mkdir(cachePath, { recursive: true });
  await fs.writeFile(path.join(root, 'doc.md'), '# hello\n');

  const { app, manager } = await buildServer({
    rootPath: root,
    cachePath,
    port: 0,
    host: '127.0.0.1',
    enableDocs: false,
    enableRateLimit: false,
  });
  await waitForIdle(manager);
  t.teardown(async () => {
    await waitForIdle(manager).catch(() => {});
    await app.close().catch(() => {});
    await fs.rm(root, { recursive: true, force: true }).catch(() => {});
  });

  const resetRes = await app.inject({ method: 'POST', url: '/indexer/reset' });
  t.is(resetRes.statusCode, 200);

  await waitForIdle(manager);

  const statusRes = await app.inject({ method: 'GET', url: '/indexer/status' });
  t.is(statusRes.statusCode, 200);
  const payload = statusRes.json();
  t.true(payload.ok);
  t.true(['bootstrap', 'indexed'].includes(String(payload.status?.mode ?? '')));
});

test('client surfaces HTTP errors', async (t) => {
  const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
  const client = createIndexerServiceClient({
    baseUrl: 'http://localhost:4260',
    fetchImpl: async (input, init) => {
      const url =
        typeof input === 'string' ? input : input instanceof URL ? input.toString() : String(input);
      fetchCalls.push({ url, init });
      return new Response(JSON.stringify({ ok: false, error: 'boom' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    },
  });

  await t.throwsAsync(client.status(), { instanceOf: IndexerServiceError });
  t.is(fetchCalls[0]?.url, 'http://localhost:4260/indexer/status');
});

// Security Tests for Path Traversal Vulnerabilities
test.serial('rejects path traversal attacks in single file operations', async (t) => {
  const root = await createTempDir();
  const cachePath = path.join(root, '.cache');
  await fs.mkdir(cachePath, { recursive: true });
  await fs.writeFile(path.join(root, 'doc.md'), '# hello\n');

  const { app, manager } = await buildServer({
    rootPath: root,
    cachePath,
    port: 0,
    host: '127.0.0.1',
    enableDocs: false,
    enableRateLimit: false,
  });
  await waitForIdle(manager);
  t.teardown(async () => {
    await waitForIdle(manager).catch(() => {});
    await app.close().catch(() => {});
    await fs.rm(root, { recursive: true, force: true }).catch(() => {});
  });

  // Test various path traversal attacks
  const pathTraversalAttacks = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '/etc/passwd',
    '\\windows\\system32\\config\\sam',
    '....//....//....//etc/passwd',
    '..%2f..%2f..%2fetc%2fpasswd',
    '..%5c..%5c..%5cwindows%5csystem32%5cconfig%5csam',
    'test/../../../etc/passwd',
    'test\\..\\..\\..\\windows\\system32\\config\\sam',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '....\\\\....\\\\....\\\\etc\\\\passwd',
  ];

  for (const attack of pathTraversalAttacks) {
    const indexRes = await app.inject({
      method: 'POST',
      url: '/indexer/index',
      payload: { path: attack },
    });
    t.is(indexRes.statusCode, 400, `Should reject path traversal: ${attack}`);

    const removeRes = await app.inject({
      method: 'POST',
      url: '/indexer/remove',
      payload: { path: attack },
    });
    t.is(removeRes.statusCode, 400, `Should reject path traversal in remove: ${attack}`);
  }
});

test.serial('rejects path traversal attacks in batch reindex operations', async (t) => {
  const root = await createTempDir();
  const cachePath = path.join(root, '.cache');
  await fs.mkdir(cachePath, { recursive: true });
  await fs.writeFile(path.join(root, 'doc.md'), '# hello\n');

  const { app, manager } = await buildServer({
    rootPath: root,
    cachePath,
    port: 0,
    host: '127.0.0.1',
    enableDocs: false,
    enableRateLimit: false,
  });
  await waitForIdle(manager);
  t.teardown(async () => {
    await waitForIdle(manager).catch(() => {});
    await app.close().catch(() => {});
    await fs.rm(root, { recursive: true, force: true }).catch(() => {});
  });

  // Test path traversal in arrays
  const batchAttacks = [
    ['valid.md', '../../../etc/passwd'],
    ['../../../etc/passwd', 'valid.md'],
    ['../../../etc/passwd', '..\\..\\windows\\system32\\config\\sam'],
    ['**/*.md', '../../../etc/passwd'],
    ['src/**', '..\\..\\..\\windows\\**'],
  ];

  for (const attack of batchAttacks) {
    const reindexRes = await app.inject({
      method: 'POST',
      url: '/indexer/files/reindex',
      payload: { path: attack },
    });
    t.is(
      reindexRes.statusCode,
      400,
      `Should reject batch path traversal: ${JSON.stringify(attack)}`,
    );
  }
});

test.serial('rejects null byte injection attacks', async (t) => {
  const root = await createTempDir();
  const cachePath = path.join(root, '.cache');
  await fs.mkdir(cachePath, { recursive: true });

  const { app, manager } = await buildServer({
    rootPath: root,
    cachePath,
    port: 0,
    host: '127.0.0.1',
    enableDocs: false,
    enableRateLimit: false,
  });
  await waitForIdle(manager);
  t.teardown(async () => {
    await waitForIdle(manager).catch(() => {});
    await app.close().catch(() => {});
    await fs.rm(root, { recursive: true, force: true }).catch(() => {});
  });

  const nullByteAttacks = ['test\0.txt', 'test\0../../../etc/passwd', 'test.txt\0', '\0etc/passwd'];

  for (const attack of nullByteAttacks) {
    const indexRes = await app.inject({
      method: 'POST',
      url: '/indexer/index',
      payload: { path: attack },
    });
    t.is(indexRes.statusCode, 400, `Should reject null byte injection: ${attack}`);
  }
});

test.serial('rejects dangerous character injection', async (t) => {
  const root = await createTempDir();
  const cachePath = path.join(root, '.cache');
  await fs.mkdir(cachePath, { recursive: true });

  const { app, manager } = await buildServer({
    rootPath: root,
    cachePath,
    port: 0,
    host: '127.0.0.1',
    enableDocs: false,
    enableRateLimit: false,
  });
  await waitForIdle(manager);
  t.teardown(async () => {
    await waitForIdle(manager).catch(() => {});
    await app.close().catch(() => {});
    await fs.rm(root, { recursive: true, force: true }).catch(() => {});
  });

  const dangerousCharAttacks = [
    'test.txt;rm -rf /',
    'test.txt|cat /etc/passwd',
    'test.txt`whoami`',
    'test.txt$(id)',
    'test.txt&&echo hacked',
    'test.txt||echo hacked',
    'test.txt>output.txt',
    'test.txt<output.txt',
  ];

  for (const attack of dangerousCharAttacks) {
    const indexRes = await app.inject({
      method: 'POST',
      url: '/indexer/index',
      payload: { path: attack },
    });
    t.is(indexRes.statusCode, 400, `Should reject dangerous character injection: ${attack}`);
  }
});

test.serial('rejects Windows-specific path attacks', async (t) => {
  const root = await createTempDir();
  const cachePath = path.join(root, '.cache');
  await fs.mkdir(cachePath, { recursive: true });

  const { app, manager } = await buildServer({
    rootPath: root,
    cachePath,
    port: 0,
    host: '127.0.0.1',
    enableDocs: false,
    enableRateLimit: false,
  });
  await waitForIdle(manager);
  t.teardown(async () => {
    await waitForIdle(manager).catch(() => {});
    await app.close().catch(() => {});
    await fs.rm(root, { recursive: true, force: true }).catch(() => {});
  });

  const windowsAttacks = [
    'C:\\Windows\\System32\\config\\SAM',
    'D:\\secrets\\passwords.txt',
    '\\\\server\\share\\secrets.txt',
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'LPT1',
  ];

  for (const attack of windowsAttacks) {
    const indexRes = await app.inject({
      method: 'POST',
      url: '/indexer/index',
      payload: { path: attack },
    });
    t.is(indexRes.statusCode, 400, `Should reject Windows path attack: ${attack}`);
  }
});

test.serial('rejects Unix-specific system path attacks', async (t) => {
  const root = await createTempDir();
  const cachePath = path.join(root, '.cache');
  await fs.mkdir(cachePath, { recursive: true });

  const { app, manager } = await buildServer({
    rootPath: root,
    cachePath,
    port: 0,
    host: '127.0.0.1',
    enableDocs: false,
    enableRateLimit: false,
  });
  await waitForIdle(manager);
  t.teardown(async () => {
    await waitForIdle(manager).catch(() => {});
    await app.close().catch(() => {});
    await fs.rm(root, { recursive: true, force: true }).catch(() => {});
  });

  const unixAttacks = [
    '/dev/null',
    '/dev/random',
    '/proc/version',
    '/proc/self/environ',
    '/sys/kernel/version',
    '/etc/shadow',
    '/etc/passwd',
  ];

  for (const attack of unixAttacks) {
    const indexRes = await app.inject({
      method: 'POST',
      url: '/indexer/index',
      payload: { path: attack },
    });
    t.is(indexRes.statusCode, 400, `Should reject Unix system path attack: ${attack}`);
  }
});

test.serial('prevents information disclosure in error messages', async (t) => {
  const root = await createTempDir();
  const cachePath = path.join(root, '.cache');
  await fs.mkdir(cachePath, { recursive: true });

  const { app, manager } = await buildServer({
    rootPath: root,
    cachePath,
    port: 0,
    host: '127.0.0.1',
    enableDocs: false,
    enableRateLimit: false,
  });
  await waitForIdle(manager);
  t.teardown(async () => {
    await waitForIdle(manager).catch(() => {});
    await app.close().catch(() => {});
    await fs.rm(root, { recursive: true, force: true }).catch(() => {});
  });

  // Test that error messages don't leak sensitive information
  const indexRes = await app.inject({
    method: 'POST',
    url: '/indexer/index',
    payload: { path: '../../../etc/passwd' },
  });

  t.is(indexRes.statusCode, 400);
  const payload = indexRes.json();
  t.is(payload.error, 'Invalid request');
  t.false(payload.error.includes('etc/passwd'));
  t.false(payload.error.includes(root));
  t.false(payload.error.includes('..'));
});

test.serial('prevents array bypass vulnerability in single file operations', async (t) => {
  const root = await createTempDir();
  const cachePath = path.join(root, '.cache');
  await fs.mkdir(cachePath, { recursive: true });
  await fs.writeFile(path.join(root, 'doc.md'), '# hello\n');

  const { app, manager } = await buildServer({
    rootPath: root,
    cachePath,
    port: 0,
    host: '127.0.0.1',
    enableDocs: false,
    enableRateLimit: false,
  });
  await waitForIdle(manager);
  t.teardown(async () => {
    await waitForIdle(manager).catch(() => {});
    await app.close().catch(() => {});
    await fs.rm(root, { recursive: true, force: true }).catch(() => {});
  });

  // Test array bypass attempts - these should all be rejected
  const arrayBypassAttacks = [
    ['../../../etc/passwd'],
    ['valid.md', '../../../etc/passwd'],
    ['../../../etc/passwd', 'valid.md'],
    ['doc.md'],
    [], // Empty array
    [''], // Array with empty string
    ['..', '..', 'etc', 'passwd'], // Split traversal
  ];

  for (const attackArray of arrayBypassAttacks) {
    // Test index endpoint
    const indexRes = await app.inject({
      method: 'POST',
      url: '/indexer/index',
      payload: { path: attackArray },
    });
    t.is(
      indexRes.statusCode,
      400,
      `Index endpoint should reject array bypass: ${JSON.stringify(attackArray)}`,
    );

    // Test remove endpoint
    const removeRes = await app.inject({
      method: 'POST',
      url: '/indexer/remove',
      payload: { path: attackArray },
    });
    t.is(
      removeRes.statusCode,
      400,
      `Remove endpoint should reject array bypass: ${JSON.stringify(attackArray)}`,
    );
  }

  // Verify error messages don't leak information
  const indexRes = await app.inject({
    method: 'POST',
    url: '/indexer/index',
    payload: { path: ['../../../etc/passwd'] },
  });
  const payload = indexRes.json();
  t.is(payload.error, 'Invalid request');
  t.false(payload.error.includes('etc/passwd'));
  t.false(payload.error.includes('Array'));
});

test.serial('allows legitimate file operations', async (t) => {
  const root = await createTempDir();
  const cachePath = path.join(root, '.cache');
  await fs.mkdir(cachePath, { recursive: true });
  await fs.mkdir(path.join(root, 'src'), { recursive: true });
  await fs.writeFile(path.join(root, 'doc.md'), '# hello\n');
  await fs.writeFile(path.join(root, 'src', 'test.ts'), "console.log('test');\n");

  const { app, manager } = await buildServer({
    rootPath: root,
    cachePath,
    port: 0,
    host: '127.0.0.1',
    enableDocs: false,
    enableRateLimit: false,
  });
  await waitForIdle(manager);
  t.teardown(async () => {
    await waitForIdle(manager).catch(() => {});
    await app.close().catch(() => {});
    await fs.rm(root, { recursive: true, force: true }).catch(() => {});
  });

  // Test legitimate paths that should be allowed
  const legitimatePaths = ['doc.md', 'src/test.ts', 'src/**/*.ts', '*.md', 'src/**/*'];

  for (const legitPath of legitimatePaths) {
    const indexRes = await app.inject({
      method: 'POST',
      url: '/indexer/index',
      payload: { path: legitPath },
    });
    // Should not be rejected for path validation (may fail for other reasons)
    t.not(indexRes.statusCode, 400, `Should allow legitimate path: ${legitPath}`);
  }

  // Test batch operations with legitimate paths
  const batchRes = await app.inject({
    method: 'POST',
    url: '/indexer/files/reindex',
    payload: { path: ['*.md', 'src/**/*.ts'] },
  });
  t.not(batchRes.statusCode, 400, 'Should allow legitimate batch operations');
});
