import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import test from 'ava';

import { loadConfig } from '../config/load-config.js';
import { loadHttpTransportConfig } from '../index.js';

const serialize = (value: unknown) => JSON.stringify(value, null, 2);

test('loadHttpTransportConfig prefers inline stdio proxies over legacy path', async (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'mcp-http-inline-'));
  const configPath = path.join(dir, 'promethean.mcp.json');
  const missingPath = path.join(dir, 'missing.edn');

  const jsonConfig = {
    transport: 'http',
    tools: ['files.view-file'],
    endpoints: {
      'analytics/api': { tools: ['github.request'] },
    },
    stdioProxyConfig: missingPath,
    stdioProxies: [
      {
        name: 'inline-proxy',
        command: './bin/server.sh',
        httpPath: 'inline',
      },
    ],
  } as const;
  writeFileSync(configPath, serialize(jsonConfig), 'utf8');

  const env = Object.create(null) as NodeJS.ProcessEnv;
  const cfg = loadConfig(env, ['node', 'test', '--config', configPath], dir);

  const httpConfig = await loadHttpTransportConfig(cfg);

  t.deepEqual(
    httpConfig.endpoints.map((endpoint) => endpoint.path),
    ['/mcp', '/analytics/api'],
  );
  t.deepEqual(httpConfig.endpoints[0]?.tools, ['files.view-file']);

  t.is(httpConfig.inlineProxySpecs.length, 1);
  const inlineProxy = httpConfig.inlineProxySpecs[0]!;
  t.is(inlineProxy.name, 'inline-proxy');
  t.is(inlineProxy.command, './bin/server.sh');
  t.is(inlineProxy.httpPath, '/inline');
  t.is(httpConfig.legacyProxySpecs.length, 0);
});

test('loadHttpTransportConfig loads stdio proxies from legacy config path', async (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'mcp-http-'));
  const configPath = path.join(dir, 'promethean.mcp.json');
  const ednPath = path.join(dir, 'servers.edn');

  const edn =
    '{:mcp-servers {:proxy {:command "./bin/server.sh" :args ["--stdio"] :http-path "/proxy"}}}';
  writeFileSync(ednPath, edn, 'utf8');

  const jsonConfig = {
    transport: 'http',
    tools: ['files.view-file'],
    endpoints: {
      'analytics/api': { tools: ['github.request'] },
    },
    stdioProxyConfig: ednPath,
  } as const;
  writeFileSync(configPath, serialize(jsonConfig), 'utf8');

  const env = Object.create(null) as NodeJS.ProcessEnv;
  const cfg = loadConfig(env, ['node', 'test', '--config', configPath], dir);

  const httpConfig = await loadHttpTransportConfig(cfg);

  t.deepEqual(
    httpConfig.endpoints.map((endpoint) => endpoint.path),
    ['/mcp', '/analytics/api'],
  );
  t.deepEqual(httpConfig.endpoints[0]?.tools, ['files.view-file']);

  t.is(httpConfig.inlineProxySpecs.length, 0);
  t.is(httpConfig.legacyProxySpecs.length, 1);
  const proxy = httpConfig.legacyProxySpecs[0]!;
  t.is(proxy.name, 'proxy');
  t.true(proxy.command.endsWith(path.join('bin', 'server.sh')));
  t.is(proxy.httpPath, '/proxy');
});
