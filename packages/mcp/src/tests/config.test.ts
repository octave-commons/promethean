import test from 'ava';
import { resolveHttpEndpoints, resolveStdioTools } from '../core/resolve-config.js';
import type { AppConfig } from '../config/load-config.js';

test('resolveHttpEndpoints falls back to /mcp with top-level tools', (t) => {
  const cfg: AppConfig = {
    transport: 'http',
    tools: ['files_view_file'],
    endpoints: {},
    stdioProxyConfig: null,
    stdioProxies: [],
  };

  const result = resolveHttpEndpoints(cfg);
  t.deepEqual(result, [{ path: '/mcp', tools: ['files_view_file'] }]);
});

test('resolveHttpEndpoints normalizes endpoint paths', (t) => {
  const cfg: AppConfig = {
    transport: 'http',
    tools: [],
    endpoints: {
      'github/mcp': { tools: ['github_request'] },
      '/fs/mcp': { tools: ['files_list_directory'] },
    },
    stdioProxyConfig: null,
    stdioProxies: [],
  };

  const result = resolveHttpEndpoints(cfg);
  t.deepEqual(result, [
    { path: '/github/mcp', tools: ['github_request'] },
    { path: '/fs/mcp', tools: ['files_list_directory'] },
  ]);
});

test('resolveHttpEndpoints retains legacy /mcp when endpoints present', (t) => {
  const cfg: AppConfig = {
    transport: 'http',
    tools: ['files_view_file'],
    endpoints: {
      'github/mcp': { tools: ['github_request'] },
    },
    stdioProxyConfig: null,
    stdioProxies: [],
  };

  const result = resolveHttpEndpoints(cfg);
  t.deepEqual(result, [
    { path: '/mcp', tools: ['files_view_file'] },
    { path: '/github/mcp', tools: ['github_request'] },
  ]);
});

test('resolveStdioTools prefers top-level tools', (t) => {
  const cfg: AppConfig = {
    transport: 'stdio',
    tools: ['files_view_file'],
    endpoints: {
      'github/mcp': { tools: ['github_request'] },
    },
    stdioProxyConfig: null,
    stdioProxies: [],
  };

  const result = resolveStdioTools(cfg);
  t.deepEqual(result, ['files_view_file']);
});

test('resolveStdioTools unions endpoint tools when top-level empty', (t) => {
  const cfg: AppConfig = {
    transport: 'stdio',
    tools: [],
    endpoints: {
      'github/mcp': { tools: ['github_request'] },
      'fs/mcp': { tools: ['files_list_directory', 'files_view_file'] },
    },
    stdioProxyConfig: null,
    stdioProxies: [],
  };

  const result = resolveStdioTools(cfg);
  t.deepEqual(
    new Set(result),
    new Set(['github_request', 'files_list_directory', 'files_view_file']),
  );
});
