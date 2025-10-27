import { readFile, writeFile, mkdir } from 'node:fs/promises';
import * as path from 'node:path';
import type { ReadonlyDeep } from 'type-fest';

import type { KanbanConfig } from '../config/shared.js';
import type { TransitionEvent } from './types.js';

export const makeLogPath = (config: ReadonlyDeep<KanbanConfig>): string =>
  path.join(config.cachePath || 'docs/agile/boards/.cache', 'event-log.jsonl');

export const ensureLogDirectory = async (logPath: string): Promise<void> => {
  const dir = path.dirname(logPath);
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory already exists or creation failed
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
};

export const readEventLog = async (logPath: string): Promise<ReadonlyArray<TransitionEvent>> => {
  try {
    const content = await readFile(logPath, 'utf8');
    const lines = content
      .trim()
      .split('\n')
      .filter((line) => line.length > 0);
    return lines.map((line) => JSON.parse(line) as TransitionEvent);
  } catch {
    return [];
  }
};

export const writeEvent = async (
  logPath: string,
  event: ReadonlyDeep<TransitionEvent>,
): Promise<void> => {
  const eventLine = JSON.stringify(event) + '\n';
  await writeFile(logPath, eventLine, { flag: 'a' });
};

export const clearLog = async (logPath: string): Promise<void> => {
  await ensureLogDirectory(logPath);
  await writeFile(logPath, '');
};
