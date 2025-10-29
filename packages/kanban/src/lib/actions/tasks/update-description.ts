import type { Task, Board, CreateTaskInput } from '../../types.js';
import {
  readTaskFile,
  generateDiff,
  createBackup,
  updateTimestamp,
} from '../../task-content/parser.js';
import { serializeBoard } from '../../markdown-output.js';
import { promises as fs } from 'fs';

export type UpdateDescriptionInput = {
  readonly tasksDir: string;
  readonly taskUuid: string;
  readonly newContent: string;
  readonly options?: { createBackup?: boolean; updateTimestamp?: boolean };
};

export type UpdateDescriptionOutput = {
  success: boolean;
  taskUuid: string;
  backupPath?: string;
  diff?: string;
};

export const updateTaskDescription = async (
  input: UpdateDescriptionInput,
): Promise<UpdateDescriptionOutput> => {
  const taskFiles = await fs.readdir(input.tasksDir);
  const matching = taskFiles.find((f) => f.includes(input.taskUuid));
  if (!matching) throw new Error(`Task file for ${input.taskUuid} not found`);
  const taskPath = `${input.tasksDir}/${matching}`;

  const { rawContent, task } = await readTaskFile(taskPath);
  if (!task) throw new Error('Parsed task missing from file');

  const before = rawContent;
  const after = `---\n${JSON.stringify({ ...task, content: input.newContent }, null, 2)}\n---\n\n${input.newContent}`;

  let backupPath: string | undefined;
  if (input.options?.createBackup) {
    backupPath = await createBackup(taskPath);
  }

  await fs.writeFile(taskPath, after, 'utf8');

  const diff = generateDiff(before, after);
  return { success: true, taskUuid: input.taskUuid, backupPath, diff };
};
