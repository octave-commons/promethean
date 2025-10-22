import type { ReadonlyDeep } from 'type-fest';

import type { KanbanConfig } from '../config/shared.js';

import {
  makeLogPath,
  ensureLogDirectory,
  readEventLog,
  writeEvent,
  clearLog,
} from './file-operations.js';
import { createTransitionEvent } from './event-creator.js';
import { getTaskHistory, replayTaskTransitions, getAllTaskHistories } from './task-history.js';
import { getLogStats } from './stats.js';

export type { TransitionEvent, TaskTransitionResult, LogStats } from './types.js';

export const makeEventLogManager = (config: ReadonlyDeep<KanbanConfig>) => {
  const logPath = makeLogPath(config);

  const logTransition = async (
    taskId: string,
    fromStatus: string,
    toStatus: string,
    actor: 'agent' | 'human' | 'system' = 'system',
    reason?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> => {
    const event = createTransitionEvent(taskId, fromStatus, toStatus, actor, reason, metadata);
    await ensureLogDirectory(logPath);
    await writeEvent(logPath, event);
  };

  return {
    logTransition,
    readEventLog: () => readEventLog(logPath),
    getTaskHistory: (taskId: string) => getTaskHistory(logPath, taskId),
    replayTaskTransitions: (taskId: string, currentStatus: string) =>
      replayTaskTransitions(logPath, taskId, currentStatus),
    getAllTaskHistories: () => getAllTaskHistories(logPath),
    clearLog: () => clearLog(logPath),
    getLogStats: () => getLogStats(logPath),
  };
};

export type EventLogManager = ReturnType<typeof makeEventLogManager>;
