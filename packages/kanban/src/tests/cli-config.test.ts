import path from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import test from 'ava';

import { makeTask, withTempDir, writeTaskFile } from '../test-utils/helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '..', '..');
const CLI_ENTRY = path.join(PACKAGE_ROOT, 'dist', 'index.js');

const runCli = async (
  args: ReadonlyArray<string>,
  options: Readonly<{ env?: NodeJS.ProcessEnv; cwd?: string }> = {},
): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [CLI_ENTRY, ...args], {
      cwd: options.cwd ?? PACKAGE_ROOT,
      env: { ...process.env, ...options.env },
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`CLI exited with code ${code ?? 'null'}`));
    });
  });

test('CLI regeneration respects board path from kanban config', async (t) => {
  const tempDir = await withTempDir(t);
  const configDir = path.join(tempDir, 'config');
  await mkdir(configDir, { recursive: true });

  const tasksDir = path.join(configDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });

  const boardDir = path.join(configDir, 'output');
  await mkdir(boardDir, { recursive: true });
  const boardPath = path.join(boardDir, 'board-from-config.md');

  const configPath = path.join(configDir, 'kanban.config.json');
  const config = {
    tasksDir: './tasks',
    boardFile: './output/board-from-config.md',
  } as const;
  await writeFile(configPath, JSON.stringify(config), 'utf8');

  const task = makeTask({
    uuid: 'cli-config',
    title: 'CLI Config',
    status: 'doing',
  });
  await writeTaskFile(tasksDir, task, { content: 'Task body' });

  await t.throwsAsync(() => readFile(boardPath, 'utf8'));

  await runCli(['regenerate'], {
    env: { KANBAN_CONFIG: configPath },
  });

  const boardContent = await readFile(boardPath, 'utf8');
  t.true(boardContent.includes('CLI Config'));
});

test('CLI resolves config relative paths when executed from nested directories', async (t) => {
  const repoRoot = await withTempDir(t);

  await mkdir(path.join(repoRoot, '.git'), { recursive: true });

  const tasksDir = path.join(repoRoot, 'docs', 'agile', 'tasks');
  await mkdir(tasksDir, { recursive: true });

  await mkdir(path.join(repoRoot, 'docs', 'agile', 'boards'), { recursive: true });

  const configPath = path.join(repoRoot, 'promethean.kanban.json');
  const config = {
    tasksDir: 'docs/agile/tasks',
    boardFile: 'docs/agile/boards/generated.md',
    indexFile: 'docs/agile/boards/index.jsonl',
  } as const;
  await writeFile(configPath, JSON.stringify(config), 'utf8');

  const task = makeTask({
    uuid: 'cli-config-nested',
    title: 'Nested CLI Config',
    status: 'doing',
  });
  await writeTaskFile(tasksDir, task, { content: 'Nested task' });

  const nestedCwd = path.join(repoRoot, 'packages', 'docs', 'writer');
  await mkdir(nestedCwd, { recursive: true });
  await writeFile(path.join(nestedCwd, 'package.json'), '{}', 'utf8');

  const boardPath = path.join(repoRoot, 'docs', 'agile', 'boards', 'generated.md');
  await t.throwsAsync(() => readFile(boardPath, 'utf8'));

  await runCli(['regenerate'], {
    cwd: nestedCwd,
  });

  const boardContent = await readFile(boardPath, 'utf8');
  t.true(boardContent.includes('Nested CLI Config'));
});
