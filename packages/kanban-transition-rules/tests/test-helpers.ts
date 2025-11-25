import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { ExecutionContext } from 'ava';

export const withTempDir = async (t?: ExecutionContext): Promise<string> => {
  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'kanban-transition-rules-'));
  if (t?.teardown) {
    t.teardown(async () => {
      await fs.promises.rm(dir, { recursive: true, force: true });
    });
  }
  return dir;
};
