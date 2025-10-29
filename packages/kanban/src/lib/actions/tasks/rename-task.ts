import { promises as fs } from 'fs';
import path from 'path';
import { stringify as yamlStringify } from 'yaml';
import { readTaskFile, createBackup } from '../../task-content/parser.js';

export type RenameTaskInput = {
  tasksDir: string;
  taskUuid: string;
  newTitle: string;
  options?: { createBackup?: boolean };
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
  const filePath = await findTaskFile(input.tasksDir, input.taskUuid);
  if (!filePath) throw new Error(`task file for ${input.taskUuid} not found`);

  const parsed = await readTaskFile(filePath);
  const front = parsed.frontmatter ?? {};
  const content = parsed.body ?? '';

  if (input.options?.createBackup) await createBackup(filePath);

  const newFront = { ...front, title: input.newTitle } as Record<string, any>;
  const yaml = yamlStringify(newFront).trim();
  const out = `---\n${yaml}\n---\n\n${content}`;
  await fs.writeFile(filePath, out, 'utf8');
  return { success: true, taskUuid: input.taskUuid, path: filePath };
};
