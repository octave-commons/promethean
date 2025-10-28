import fs from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import test from 'ava';

import {
  CONFIG_FILE_NAME,
  ConfigSchema,
  loadConfigWithSource,
  saveConfigFile,
} from '../config/load-config.js';

const writeJson = (filePath: string, value: unknown) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
};

test('loadConfigWithSource identifies explicit config file', (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'mcp-config-'));
  t.teardown(() => fs.rmSync(dir, { recursive: true, force: true }));

  const configPath = path.join(dir, 'promethean.mcp.json');
  const config = { transport: 'stdio', tools: ['exec_run'], endpoints: {} };
  writeJson(configPath, config);

  const env = Object.create(null) as NodeJS.ProcessEnv;
  const { config: loaded, source } = loadConfigWithSource(
    env,
    ['node', 'test', '--config', configPath],
    dir,
  );

  t.deepEqual(loaded.tools, ['exec_run']);
  t.is(source.type, 'file');
  if (source.type === 'file') {
    t.is(source.path, configPath);
  }
});

test('loadConfigWithSource accepts absolute paths outside cwd', (t) => {
  const root = mkdtempSync(path.join(tmpdir(), 'mcp-absolute-'));
  t.teardown(() => fs.rmSync(root, { recursive: true, force: true }));

  const configPath = path.join(root, 'promethean.mcp.json');
  const runnerCwd = path.join(root, 'packages', 'mcp');
  const config = { transport: 'stdio', tools: ['exec_run'], endpoints: {} };
  writeJson(configPath, config);
  fs.mkdirSync(runnerCwd, { recursive: true });

  const env = Object.create(null) as NodeJS.ProcessEnv;
  const { config: loaded, source } = loadConfigWithSource(
    env,
    ['node', 'test', '--config', configPath],
    runnerCwd,
  );

  t.deepEqual(loaded.tools, ['exec_run']);
  t.is(source.type, 'file');
  if (source.type === 'file') {
    t.is(source.path, configPath);
  }
});

test('saveConfigFile writes normalized configuration', (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'mcp-write-'));
  t.teardown(() => fs.rmSync(dir, { recursive: true, force: true }));

  const target = path.join(dir, 'configs', CONFIG_FILE_NAME);
  const config = ConfigSchema.parse({
    transport: 'http',
    tools: ['files_view_file'],
    endpoints: {
      '/docs': { tools: ['files_view_file'] },
    },
    version: '2025-06-18',
    metadata: { source: 'test-suite' },
  });

  const saved = saveConfigFile(target, config);
  t.true(fs.existsSync(target));

  const written = JSON.parse(fs.readFileSync(target, 'utf8'));
  t.deepEqual(written, saved);
  t.deepEqual(saved.endpoints?.['/docs']?.tools, ['files_view_file']);
  t.is(saved.version, '2025-06-18');
  t.deepEqual(saved.metadata, { source: 'test-suite' });
});
