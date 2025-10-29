import { promises as fs } from 'node:fs';
import path from 'node:path';
import { stringify as yamlStringify } from 'yaml';

import { readTaskFile, createBackup } from '../../task-content/parser.js';
import type { Board } from '../../types.js';
import { writeBoard, maybeRefreshIndex } from '../../serializers/board.js';
import { locateTask } from '../../core/task-utils.js';
import { ensureTaskFileBase } from '../../core/slugs.js';

export type RenameTaskInput = {
  board: Board;
  tasksDir: string;
  taskUuid: string;
  newTitle: string;
  options?: { createBackup?: boolean };
  boardPath?: string;
};

export type RenameTaskResult = { success: boolean; taskUuid: string; path: string };

const findTaskFile = async (tasksDir: string, uuid: string): Promise<string | null> => {
  const files = await fs.readdir(tasksDir);
  const byName = files.find((f) => f.includes(uuid));
  if (byName) return path.join(tasksDir, byName);
  for (const f of files) {
    const p = path.join(tasksDir, f);
    try {
      const { frontmatter } = await readTaskFile(p);
      if (frontmatter && frontmatter.uuid === uuid) return p;
    } catch (_) {}
  }
  return null;
};

export const renameTask = async (input: RenameTaskInput): Promise<RenameTaskResult> => {
  const { board, tasksDir, taskUuid, newTitle, options, boardPath } = input;

  const filePath = await findTaskFile(tasksDir, taskUuid);
  if (!filePath) {
    throw new Error(`task file for ${taskUuid} not found`);
  }

  const parsed = await readTaskFile(filePath);
  const front = parsed.frontmatter ?? {};
  const content = parsed.body ?? '';

  if (options?.createBackup) {
    await createBackup(filePath);
  }

  const newFront = { ...front, title: newTitle } as Record<string, unknown>;
  const yaml = yamlStringify(newFront).trim();
  const output = `---\n${yaml}\n---\n\n${content}`;
  await fs.writeFile(filePath, output, 'utf8');

  const located = locateTask(board, taskUuid);
  if (located) {
    const slug = ensureTaskFileBase({ ...located.task, title: newTitle });
    located.column.tasks[located.index] = {
      ...located.task,
      title: newTitle,
      slug,
    };
  }

  if (boardPath) {
    await writeBoard(boardPath, board);
  }
  await maybeRefreshIndex(tasksDir);

  return { success: true, taskUuid, path: filePath };
};
