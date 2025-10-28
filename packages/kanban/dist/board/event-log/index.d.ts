import type { ReadonlyDeep } from 'type-fest';
import type { KanbanConfig } from '../config/shared.js';
import type { TransitionEvent, TaskTransitionResult, LogStats } from './types.js';
export type { TransitionEvent, TaskTransitionResult, LogStats } from './types.js';
export declare const makeEventLogManager: (config: ReadonlyDeep<KanbanConfig>) => EventLogManager;
export type EventLogManager = {
    readonly logTransition: (taskId: string, fromStatus: string, toStatus: string, options?: {
        readonly actor?: 'agent' | 'human' | 'system';
        readonly reason?: string;
        readonly metadata?: Record<string, unknown>;
    }) => Promise<void>;
    readonly readEventLog: () => Promise<ReadonlyArray<TransitionEvent>>;
    readonly getTaskHistory: (taskId: string) => Promise<ReadonlyArray<TransitionEvent>>;
    readonly replayTaskTransitions: (taskId: string, currentStatus: string) => Promise<TaskTransitionResult>;
    readonly getAllTaskHistories: () => Promise<ReadonlyMap<string, ReadonlyArray<TransitionEvent>>>;
    readonly clearLog: () => Promise<void>;
    readonly getLogStats: () => Promise<LogStats>;
};
//# sourceMappingURL=index.d.ts.map