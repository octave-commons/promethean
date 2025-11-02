import { promises as fs } from 'node:fs';
import path from 'node:path';
import { stringify as yamlStringify } from 'yaml';

import { readTaskFile, createBackup, generateDiff } from '../../task-content/parser.js';
import type { Board } from '../../types.js';
import { writeBoard, maybeRefreshIndex } from '../../serializers/board.js';
import { locateTask } from '../../core/task-utils.js';

export type UpdateDescriptionInput = {
  board: Board;
  tasksDir: string;
  taskUuid: string;
  newContent: string;
  options?: { createBackup?: boolean };
  boardPath?: string;
};

export type UpdateDescriptionResult = {
  success: boolean;
  taskUuid: string;
  backupPath?: string;
  diff?: string;
};

const findTaskFile = async (tasksDir: string, uuid: string): Promise<string | null> => {
  const files = await fs.readdir(tasksDir);
  const byName = files.find((f) => f.includes(uuid));
  if (byName) return path.join(tasksDir, byName);

  for (const file of files) {
    const filePath = path.join(tasksDir, file);
    try {
      const { frontmatter } = await readTaskFile(filePath);
      if (frontmatter && frontmatter.uuid === uuid) return filePath;
    } catch {
      // ignore parse errors
    }
  }

  return null;
};

export const updateTaskDescription = async (
  input: UpdateDescriptionInput,
): Promise<UpdateDescriptionResult> => {
  const { board, tasksDir, taskUuid, newContent, options, boardPath } = input;

  const filePath = await findTaskFile(tasksDir, taskUuid);
  if (!filePath) throw new Error(`task file for ${taskUuid} not found`);

  const beforeRaw = await fs.readFile(filePath, 'utf8');
  const parsed = await readTaskFile(filePath);
  const frontmatter = parsed.frontmatter ?? {};

  const updatedFrontmatter = { ...frontmatter, content: newContent } as Record<string, unknown>;
  const yaml = yamlStringify(updatedFrontmatter).trim();
  const after = `---\n${yaml}\n---\n\n${newContent}`;

  let backupPath: string | undefined;
  if (options?.createBackup) {
    backupPath = await createBackup(filePath);
  }

  await fs.writeFile(filePath, after, 'utf8');
  const diff = generateDiff(beforeRaw, after);

  const located = locateTask(board, taskUuid);
  if (located) {
    located.column.tasks[located.index] = {
      ...located.task,
      content: newContent,
    };
  }

  if (boardPath) {
    await writeBoard(boardPath, board);
  }
  await maybeRefreshIndex(tasksDir);

  return { success: true, taskUuid, backupPath, diff };
};
