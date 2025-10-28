import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

import test from 'ava';

import { createTask } from '../lib/kanban.js';
import {
  getTaskFileByUuid,
  makeBoard,
  makeTask,
  withTempDir,
  writeTaskFile,
} from '../test-utils/helpers.js';

const BLOCKED_BY_HEADING = '## ⛓️ Blocked By';
const BLOCKS_HEADING = '## ⛓️ Blocks';

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const extractSection = (markdown: string, heading: string): string | undefined => {
  const pattern = new RegExp(`${escapeRegExp(heading)}\\s*\n([\\s\\S]*?)(?=^##\\s+|$)`, 'm');
  const match = pattern.exec(markdown);
  if (!match) return undefined;
  return match[1]?.trim();
};

const ensureTemplate = async (tempDir: string, content: string): Promise<string> => {
  const templatePath = path.join(tempDir, 'template.md');
  await writeFile(templatePath, content, 'utf8');
  return templatePath;
};

test('A task is created from the provided template', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const template = [
    '## Body',
    '',
    '{{BODY}}',
    '',
    BLOCKED_BY_HEADING,
    'Nothing',
    '',
    BLOCKS_HEADING,
    'Nothing',
    '',
  ].join('\n');
  const templatePath = await ensureTemplate(tempDir, template);

  const board = makeBoard([{ name: 'incoming', count: 0, limit: null, tasks: [] }]);

  const created = await createTask(
    board,
    'incoming',
    {
      title: 'New blocker',
      templatePath,
      blocking: ['blocked-2'],
    },
    tasksDir,
    boardPath,
  );

  const blockedPersisted = await getTaskFileByUuid(tasksDir, 'blocked-2');
  t.truthy(blockedPersisted);
  const section = extractSection(blockedPersisted!.content, BLOCKED_BY_HEADING);
  t.truthy(section);
  t.regex(section!, /\[\[[^|]+\|New blocker\]\]/i);
  const newTask = await getTaskFileByUuid(tasksDir, created.uuid);
  t.truthy(newTask);
});

test("When a task is created with a blocked by section, the blocking task's blocking section is also updated", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const baseContent = `${BLOCKED_BY_HEADING}\n\nNothing\n\n${BLOCKS_HEADING}\n\nNothing\n`;
  const blocker = makeTask({
    uuid: 'blocker-2',
    title: 'Existing helper',
    status: 'incoming',
    slug: 'existing-helper',
    content: baseContent,
  });
  const board = makeBoard([
    {
      name: 'incoming',
      count: 1,
      limit: null,
      tasks: [blocker],
    },
  ]);
  await writeTaskFile(tasksDir, blocker, { content: baseContent });

  const templatePath = await ensureTemplate(tempDir, baseContent);

  const created = await createTask(
    board,
    'incoming',
    {
      title: 'Blocked task',
      templatePath,
      blockedBy: ['blocker-2'],
    },
    tasksDir,
    boardPath,
  );

  const blockerPersisted = await getTaskFileByUuid(tasksDir, 'blocker-2');
  t.truthy(blockerPersisted);
  const section = extractSection(blockerPersisted!.content, BLOCKS_HEADING);
  t.truthy(section);
  t.regex(section!, /\[\[[^|]+\|Blocked task\]\]/i);
  const newTask = await getTaskFileByUuid(tasksDir, created.uuid);
  t.truthy(newTask);
});
