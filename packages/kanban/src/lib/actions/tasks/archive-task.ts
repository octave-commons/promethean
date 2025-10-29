import { promises as fs } from 'fs';
import path from 'path';
import {
  readTaskFile,
  createBackup,
  updateTimestamp,
  generateDiff,
} from '../../task-content/parser.js';

export type ArchiveTaskInput = {
  tasksDir: string;
  taskUuid: string;
  options?: { createBackup?: boolean; moveToArchiveDir?: boolean };
};

export type ArchiveTaskResult = {
  success: boolean;
  path?: string;
  backupPath?: string;
  diff?: string;
};

const findTaskFile = async (tasksDir: string, uuid: string): Promise<string | null> => {
  const files = await fs.readdir(tasksDir);
  const byName = files.find((f) => f.includes(uuid) && f.endsWith('.md'));
  if (byName) return path.join(tasksDir, byName);

  for (const f of files) {
    if (!f.endsWith('.md')) continue;
    const p = path.join(tasksDir, f);
    try {
      const { frontmatter } = await readTaskFile(p);
      if (frontmatter && frontmatter.uuid === uuid) return p;
    } catch (_) {
      // ignore
    }
  }

  return null;
};

export const archiveTask = async (input: ArchiveTaskInput): Promise<ArchiveTaskResult> => {
  const { tasksDir, taskUuid, options } = input;
  const filePath = await findTaskFile(tasksDir, taskUuid);
  if (!filePath) throw new Error(`task file for ${taskUuid} not found`);

  const beforeRaw = await fs.readFile(filePath, 'utf8');
  const parsed = await readTaskFile(filePath);
  const front = parsed.frontmatter ?? {};
  const body = parsed.body ?? '';

  if (options?.createBackup) {
    await createBackup(filePath);
  }

  const newFront = updateTimestamp({ ...front, status: 'Archive' });
  const yaml = (await import('yaml')).stringify(newFront).trim();
  const after = `---\n${yaml}\n---\n\n${body}`;

  if (options?.moveToArchiveDir) {
    const archiveDir = path.join(tasksDir, 'archive');
    try {
      await fs.mkdir(archiveDir, { recursive: true });
    } catch (_) {}
    const dest = path.join(archiveDir, path.basename(filePath));
    await fs.writeFile(dest, after, 'utf8');
    try {
      await fs.unlink(filePath);
    } catch (_) {}
    const diff = generateDiff(beforeRaw, after);
    return { success: true, path: dest, diff };
  }

  await fs.writeFile(filePath, after, 'utf8');
  const diff = generateDiff(beforeRaw, after);
  return { success: true, path: filePath, diff };
};
