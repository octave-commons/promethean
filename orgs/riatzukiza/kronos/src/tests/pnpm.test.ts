import test from 'ava';

import type { ToolContext } from '../core/types.js';
import {
  buildPnpmArgs,
  normalizeFilters,
  normalizeStringList,
  type PnpmResult,
  __test__,
} from '../tools/pnpm.js';

const noopFetch: typeof fetch = async (..._args) => {
  throw new Error('fetch not implemented');
};

const baseCtx: ToolContext = {
  env: {},
  fetch: noopFetch,
  now: () => new Date(0),
};

const makeResult = (args: readonly string[]): PnpmResult => ({
  command: 'pnpm',
  args,
  cwd: '/workspace',
  exitCode: 0,
  stdout: '',
  stderr: '',
});

test('normalizeStringList trims values', (t) => {
  t.deepEqual(normalizeStringList('pkg'), ['pkg']);
  t.deepEqual(normalizeStringList([' foo ', 'bar']), ['foo', 'bar']);
});

test('normalizeFilters dedupes filters', (t) => {
  t.deepEqual(normalizeFilters(undefined), []);
  t.deepEqual(normalizeFilters('pkg'), ['pkg']);
  t.deepEqual(normalizeFilters(['pkg', 'pkg', ' apps/* ']), ['pkg', 'apps/*']);
});

test('buildPnpmArgs prepends filters', (t) => {
  t.deepEqual(buildPnpmArgs(['install']), ['install']);
  t.deepEqual(buildPnpmArgs(['run', 'lint'], { filter: 'app' }), [
    '--filter',
    'app',
    'run',
    'lint',
  ]);
  t.deepEqual(buildPnpmArgs(['add', 'lodash'], { filter: ['pkg-a', 'pkg-b'] }), [
    '--filter',
    'pkg-a',
    '--filter',
    'pkg-b',
    'add',
    'lodash',
  ]);
});

test('pnpm_install tool forwards options', async (t) => {
  const tool = __test__.createInstallTool(baseCtx, async (args) => makeResult(args));
  const result = (await tool.invoke({
    filter: 'packages/*',
    frozenLockfile: true,
    offline: true,
  })) as PnpmResult;
  t.deepEqual(result.args, ['--filter', 'packages/*', 'install', '--frozen-lockfile', '--offline']);
});

test('pnpm_add tool builds dependency list', async (t) => {
  const tool = __test__.createAddTool(baseCtx, async (args) => makeResult(args));
  const result = (await tool.invoke({
    dependencies: ['lodash', 'fp-ts'],
    dev: true,
    exact: true,
    filter: 'pkg',
  })) as PnpmResult;
  t.deepEqual(result.args, [
    '--filter',
    'pkg',
    'add',
    '--save-dev',
    '--save-exact',
    'lodash',
    'fp-ts',
  ]);
});

test('pnpm_remove tool removes packages', async (t) => {
  const tool = __test__.createRemoveTool(baseCtx, async (args) => makeResult(args));
  const result = (await tool.invoke({
    dependencies: 'react',
  })) as PnpmResult;
  t.deepEqual(result.args, ['remove', 'react']);
});

test('pnpm_run_script tool passes script arguments', async (t) => {
  const tool = __test__.createRunScriptTool(baseCtx, async (args) => makeResult(args));
  const result = (await tool.invoke({
    script: 'build',
    args: ['--prod'],
    filter: ['pkg-a', 'pkg-b'],
  })) as PnpmResult;
  t.deepEqual(result.args, [
    '--filter',
    'pkg-a',
    '--filter',
    'pkg-b',
    'run',
    'build',
    '--',
    '--prod',
  ]);
});
