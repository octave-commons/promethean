import type { Task } from './task.js';
export type TaskStatus = 'succeeded' | 'failed' | 'aborted';
export type TaskOutput = Readonly<{
    logs: readonly string[];
    data?: unknown;
    error?: string;
}>;
export type TaskResult = Readonly<{
    id: string;
    startedAt: string;
    finishedAt: string;
    status: TaskStatus;
    output: TaskOutput;
}>;
export type RunTaskDependencies = Readonly<{
    fetch: typeof fetch;
    baseUrl: string;
    now?: () => Date;
}>;
export type RunTaskOptions = Readonly<{
    signal?: AbortSignal;
    timeoutMs?: number;
    debug?: boolean;
}>;
export type DebugMetrics = Readonly<{
    tokensIn: number;
    tokensOut: number;
    durationMs: number;
}>;
export type TaskStreamEvent = Readonly<{
    raw: string;
    json?: unknown;
    textDelta?: string;
    done?: boolean;
}>;
export type RunTaskSuccess = Readonly<{
    kind: 'Success';
    result: TaskResult;
    debug?: DebugMetrics;
}>;
export type RunTaskRateLimited = Readonly<{
    kind: 'RateLimited';
    retryAfterMs: number | null;
}>;
export type RunTaskTimeout = Readonly<{
    kind: 'Timeout';
}>;
export type RunTaskError = Readonly<{
    kind: 'Error';
    error: string;
    status?: number;
}>;
export type RunTaskResult = RunTaskSuccess | RunTaskRateLimited | RunTaskTimeout | RunTaskError;
export type TaskRun = Readonly<{
    stream: AsyncIterable<TaskStreamEvent>;
    result: Promise<RunTaskResult>;
}>;
export declare const runTask: (task: Task, deps: RunTaskDependencies, options?: RunTaskOptions) => Promise<TaskRun>;
//# sourceMappingURL=runner.d.ts.map