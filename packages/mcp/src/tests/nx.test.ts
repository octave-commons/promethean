import test from 'ava';

import type { ToolContext } from '../core/types.js';
import {
  __test__,
  buildNxGenerateArgs,
  resolvePreset,
  type NxGenerateResult,
} from '../tools/nx.js';

const noopFetch: typeof fetch = async (..._args) => {
  throw new Error('fetch not implemented');
};

const baseCtx: ToolContext = {
  env: {},
  fetch: noopFetch,
  now: () => new Date(0),
};

const makeResult = (args: readonly string[]): NxGenerateResult => ({
  command: 'pnpm',
  args,
  cwd: '/workspace',
  exitCode: 0,
  stdout: '',
  stderr: '',
});

test('resolvePreset maps aliases and defaults', (t) => {
  t.is(resolvePreset(undefined), 'ts-lib');
  t.is(resolvePreset('library'), 'ts-lib');
  t.is(resolvePreset('service'), 'fastify-service');
  t.is(resolvePreset('frontend'), 'web-frontend');
});

test('resolvePreset throws on unknown presets', (t) => {
  t.throws(() => resolvePreset('unknown'), {
    message: /Unknown preset/,
  });
});

test('buildNxGenerateArgs includes dry run flag', (t) => {
  t.deepEqual(buildNxGenerateArgs({ name: 'demo', preset: 'ts-lib', dryRun: false }), [
    'exec',
    'nx',
    'generate',
    'tools:package',
    '--name',
    'demo',
    '--preset',
    'ts-lib',
    '--no-interactive',
  ]);

  t.deepEqual(buildNxGenerateArgs({ name: 'demo', preset: 'ts-lib', dryRun: true }), [
    'exec',
    'nx',
    'generate',
    'tools:package',
    '--name',
    'demo',
    '--preset',
    'ts-lib',
    '--no-interactive',
    '--dry-run',
  ]);
});

test('nx_generate_package tool normalizes inputs', async (t) => {
  const executor = async (args: readonly string[]) => makeResult(args);

  const tool = __test__.createTool(baseCtx, executor);
  const result = (await tool.invoke({
    name: ' My Service ',
    preset: 'frontend',
    dryRun: true,
  })) as NxGenerateResult;

  t.deepEqual(result.args, [
    'exec',
    'nx',
    'generate',
    'tools:package',
    '--name',
    'My Service',
    '--preset',
    'web-frontend',
    '--no-interactive',
    '--dry-run',
  ]);
  t.is(result.exitCode, 0);
});
