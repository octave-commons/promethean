import { promises as fs } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { stringify as yamlStringify } from 'yaml';
import { readTaskFile, createBackup, generateDiff } from '../../task-content/parser.js';

export type UpdateDescriptionInput = {
  tasksDir: string;
  taskUuid: string;
  newContent: string;
  options?: { createBackup?: boolean };
};

export type UpdateDescriptionResult = {
  success: boolean;
  taskUuid: string;
  backupPath?: string;
  diff?: string;
};

const findTaskFile = async (tasksDir: string, uuid: string): Promise<string | null> => {
  const files = await fs.readdir(tasksDir);
  // quick match by filename
  const byName = files.find((f) => f.includes(uuid));
  if (byName) return path.join(tasksDir, byName);

  // fallback: inspect frontmatter
  for (const f of files) {
    const p = path.join(tasksDir, f);
    try {
      const { frontmatter } = await readTaskFile(p);
      if (frontmatter && frontmatter.uuid === uuid) return p;
    } catch (e) {
      // ignore parse errors
    }
  }

  return null;
};

export const updateTaskDescription = async (
  input: UpdateDescriptionInput,
): Promise<UpdateDescriptionResult> => {
  const filePath = await findTaskFile(input.tasksDir, input.taskUuid);
  if (!filePath) throw new Error(`task file for ${input.taskUuid} not found`);

  const beforeRaw = await fs.readFile(filePath, 'utf8');
  const parsed = await readTaskFile(filePath);
  const frontmatter = parsed.frontmatter ?? {};

  // update content in frontmatter too if present
  const newFront = { ...frontmatter, content: input.newContent } as Record<string, any>;
  const yaml = yamlStringify(newFront).trim();
  const after = `---\n${yaml}\n---\n\n${input.newContent}`;

  let backupPath: string | undefined;
  if (input.options?.createBackup) {
    backupPath = await createBackup(filePath);
  }

  await fs.writeFile(filePath, after, 'utf8');
  const diff = generateDiff(beforeRaw, after);
  return { success: true, taskUuid: input.taskUuid, backupPath, diff };
};
