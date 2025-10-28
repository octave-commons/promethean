import type { TransitionEvent, TaskTransitionResult } from './types.js';
export declare const getTaskHistory: (logPath: string, taskId: string) => Promise<ReadonlyArray<TransitionEvent>>;
export declare const replayTaskTransitions: (logPath: string, taskId: string, currentStatus: string) => Promise<TaskTransitionResult>;
export declare const getAllTaskHistories: (logPath: string) => Promise<ReadonlyMap<string, ReadonlyArray<TransitionEvent>>>;
//# sourceMappingURL=task-history.d.ts.map