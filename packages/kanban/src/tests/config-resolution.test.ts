import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

import test from 'ava';

import { loadKanbanConfig } from '../board/config.js';
import { withTempDir } from '../test-utils/helpers.js';

const writeJson = async (filePath: string, value: unknown): Promise<void> => {
  await writeFile(filePath, JSON.stringify(value), 'utf8');
};

test.serial('loadKanbanConfig resolves repo root from nested package directories', async (t) => {
  const repoRoot = await withTempDir(t);

  await mkdir(path.join(repoRoot, '.git'), { recursive: true });
  await mkdir(path.join(repoRoot, 'docs', 'agile', 'tasks'), { recursive: true });
  await mkdir(path.join(repoRoot, 'docs', 'agile', 'boards'), { recursive: true });

  await writeJson(path.join(repoRoot, 'promethean.kanban.json'), {
    tasksDir: 'docs/agile/tasks',
    boardFile: 'docs/agile/boards/generated.md',
    indexFile: 'docs/agile/boards/index.jsonl',
  });

  const nestedDir = path.join(repoRoot, 'packages', 'kanban');
  await mkdir(nestedDir, { recursive: true });
  await writeFile(path.join(nestedDir, 'package.json'), '{}', 'utf8');

  const originalCwd = process.cwd();
  process.chdir(nestedDir);
  t.teardown(() => {
    process.chdir(originalCwd);
  });

  const { config } = await loadKanbanConfig({
    argv: [],
    env: {} as NodeJS.ProcessEnv,
  });

  t.is(config.repo, repoRoot);
  t.is(config.boardFile, path.join(repoRoot, 'docs', 'agile', 'boards', 'generated.md'));
  t.is(config.tasksDir, path.join(repoRoot, 'docs', 'agile', 'tasks'));
  t.is(config.indexFile, path.join(repoRoot, 'docs', 'agile', 'boards', 'index.jsonl'));
});

test.serial(
  'loadKanbanConfig resolves config-relative paths when invoked from nested directories',
  async (t) => {
    const repoRoot = await withTempDir(t);

    await mkdir(path.join(repoRoot, '.git'), { recursive: true });
    await mkdir(path.join(repoRoot, 'docs', 'agile', 'tasks'), { recursive: true });
    await mkdir(path.join(repoRoot, 'docs', 'agile', 'boards'), { recursive: true });

    const configDir = path.join(repoRoot, 'config', 'kanban');
    await mkdir(configDir, { recursive: true });
    const configPath = path.join(configDir, 'promethean.kanban.json');

    await writeJson(configPath, {
      tasksDir: '../docs/agile/tasks',
      boardFile: '../docs/agile/boards/generated.md',
      indexFile: '../docs/agile/boards/index.jsonl',
    });

    const nestedDir = path.join(repoRoot, 'services', 'planner', 'src');
    await mkdir(nestedDir, { recursive: true });
    await writeFile(path.join(nestedDir, 'package.json'), '{}', 'utf8');

    const originalCwd = process.cwd();
    process.chdir(nestedDir);
    t.teardown(() => {
      process.chdir(originalCwd);
    });

    const relativeConfig = path.relative(nestedDir, configPath);

    const { config } = await loadKanbanConfig({
      argv: ['--config', relativeConfig],
      env: {} as NodeJS.ProcessEnv,
    });

    t.is(config.repo, repoRoot);
    t.is(config.boardFile, path.join(repoRoot, 'docs', 'agile', 'boards', 'generated.md'));
    t.is(config.tasksDir, path.join(repoRoot, 'docs', 'agile', 'tasks'));
    t.is(config.indexFile, path.join(repoRoot, 'docs', 'agile', 'boards', 'index.jsonl'));
  },
);
