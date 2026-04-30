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

test('resolveHttpEndpoints normalizes dotted and camelCase tool ids', (t) => {
  const cfg: AppConfig = {
    transport: 'http',
    tools: ['files.viewFile', 'mcp.help'],
    endpoints: {
      'github/review': {
        tools: ['github.review.openPullRequest', 'github.review.submitReview'],
      },
      workspace: { tools: ['pnpm.runScript', 'pnpm.install'] },
    },
    stdioProxyConfig: null,
    stdioProxies: [],
  } as unknown as AppConfig;

  const result = resolveHttpEndpoints(cfg);
  t.deepEqual(result, [
    {
      path: '/mcp',
      tools: ['files_view_file', 'mcp_help'],
    },
    {
      path: '/github/review',
      tools: ['github_review_open_pull_request', 'github_review_submit_review'],
    },
    { path: '/workspace', tools: ['pnpm_run_script', 'pnpm_install'] },
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

test('resolveStdioTools normalizes endpoint tool identifiers', (t) => {
  const cfg: AppConfig = {
    transport: 'stdio',
    tools: [],
    endpoints: {
      workspace: { tools: ['pnpm.runScript', 'pnpm.remove'] },
      process: { tools: ['process.getTaskRunnerConfig', 'process.stop'] },
    },
    stdioProxyConfig: null,
    stdioProxies: [],
  } as unknown as AppConfig;

  const result = resolveStdioTools(cfg);
  t.deepEqual(
    new Set(result),
    new Set(['pnpm_run_script', 'pnpm_remove', 'process_get_task_runner_config', 'process_stop']),
  );
});
