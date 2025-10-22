import type { ReadonlyDeep } from 'type-fest';

import type { KanbanConfig } from '../config/shared.js';
import type { TransitionEvent, TaskTransitionResult, LogStats } from './types.js';

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

export const makeEventLogManager = (config: ReadonlyDeep<KanbanConfig>): EventLogManager => {
  const logPath = makeLogPath(config);

  const logTransition = async (
    taskId: string,
    fromStatus: string,
    toStatus: string,
    options: {
      readonly actor?: 'agent' | 'human' | 'system';
      readonly reason?: string;
      readonly metadata?: Record<string, unknown>;
    } = {},
  ): Promise<void> => {
    const event = createTransitionEvent(taskId, fromStatus, toStatus, options);
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

export type EventLogManager = {
  readonly logTransition: (
    taskId: string,
    fromStatus: string,
    toStatus: string,
    options?: {
      readonly actor?: 'agent' | 'human' | 'system';
      readonly reason?: string;
      readonly metadata?: Record<string, unknown>;
    },
  ) => Promise<void>;
  readonly readEventLog: () => Promise<ReadonlyArray<TransitionEvent>>;
  readonly getTaskHistory: (taskId: string) => Promise<ReadonlyArray<TransitionEvent>>;
  readonly replayTaskTransitions: (
    taskId: string,
    currentStatus: string,
  ) => Promise<TaskTransitionResult>;
  readonly getAllTaskHistories: () => Promise<ReadonlyMap<string, ReadonlyArray<TransitionEvent>>>;
  readonly clearLog: () => Promise<void>;
  readonly getLogStats: () => Promise<LogStats>;
};
