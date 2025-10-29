import { promises as fs } from 'fs';
import path from 'path';
import { readTaskFile, createBackup } from '../../task-content/parser.js';

export type DeleteTaskInput = {
  board: any;
  tasksDir: string;
  taskUuid: string;
  options?: { createBackup?: boolean };
};

export type DeleteTaskResult = { success: boolean; taskPath?: string; backupPath?: string };

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
      // ignore parse errors
    }
  }

  return null;
};

export const deleteTask = async (
  board: any,
  taskUuid: string,
  tasksDir: string,
  _boardFile?: string,
  options?: { createBackup?: boolean },
): Promise<boolean> => {
  const filePath = await findTaskFile(tasksDir, taskUuid);
  if (!filePath) return false;

  let backupPath: string | undefined;
  if (options?.createBackup) {
    backupPath = await createBackup(filePath);
  }

  try {
    await fs.unlink(filePath);
  } catch (err) {
    // failed to delete
    return false;
  }

  // Remove from in-memory board if provided
  try {
    if (board && board.columns && Array.isArray(board.columns)) {
      for (const col of board.columns) {
        if (!col.tasks || !Array.isArray(col.tasks)) continue;
        col.tasks = col.tasks.filter((t: any) => t.uuid !== taskUuid);
      }
    }
  } catch (_) {
    // ignore
  }

  return true;
};
