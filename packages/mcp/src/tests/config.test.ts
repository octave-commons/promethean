import test from 'ava';
import { resolveHttpEndpoints, resolveStdioTools } from '../core/resolve-config.js';
import type { AppConfig } from '../config/load-config.js';

test('resolveHttpEndpoints falls back to /mcp with top-level tools', (t) => {
  const cfg: AppConfig = {
    transport: 'http',
    tools: ['files.view-file'],
    endpoints: {},
    stdioProxyConfig: null,
    stdioProxies: [],
  };

  const result = resolveHttpEndpoints(cfg);
  t.deepEqual(result, [{ path: '/mcp', tools: ['files.view-file'] }]);
});

test('resolveHttpEndpoints normalizes endpoint paths', (t) => {
  const cfg: AppConfig = {
    transport: 'http',
    tools: [],
    endpoints: {
      'github/mcp': { tools: ['github.request'] },
      '/fs/mcp': { tools: ['files.list-directory'] },
    },
    stdioProxyConfig: null,
    stdioProxies: [],
  };

  const result = resolveHttpEndpoints(cfg);
  t.deepEqual(result, [
    { path: '/github/mcp', tools: ['github.request'] },
    { path: '/fs/mcp', tools: ['files.list-directory'] },
  ]);
});

test('resolveHttpEndpoints retains legacy /mcp when endpoints present', (t) => {
  const cfg: AppConfig = {
    transport: 'http',
    tools: ['files.view-file'],
    endpoints: {
      'github/mcp': { tools: ['github.request'] },
    },
    stdioProxyConfig: null,
    stdioProxies: [],
  };

  const result = resolveHttpEndpoints(cfg);
  t.deepEqual(result, [
    { path: '/mcp', tools: ['files.view-file'] },
    { path: '/github/mcp', tools: ['github.request'] },
  ]);
});

test('resolveStdioTools prefers top-level tools', (t) => {
  const cfg: AppConfig = {
    transport: 'stdio',
    tools: ['files.view-file'],
    endpoints: {
      'github/mcp': { tools: ['github.request'] },
    },
    stdioProxyConfig: null,
    stdioProxies: [],
  };

  const result = resolveStdioTools(cfg);
  t.deepEqual(result, ['files.view-file']);
});

test('resolveStdioTools unions endpoint tools when top-level empty', (t) => {
  const cfg: AppConfig = {
    transport: 'stdio',
    tools: [],
    endpoints: {
      'github/mcp': { tools: ['github.request'] },
      'fs/mcp': { tools: ['files.list-directory', 'files.view-file'] },
    },
    stdioProxyConfig: null,
    stdioProxies: [],
  };

  const result = resolveStdioTools(cfg);
  t.deepEqual(
    new Set(result),
    new Set(['github.request', 'files.list-directory', 'files.view-file']),
  );
});
