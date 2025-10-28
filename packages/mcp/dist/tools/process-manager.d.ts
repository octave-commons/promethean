import type { ToolFactory } from '../core/types.js';
type RunnerConfig = Readonly<{
    path: string;
    maxRunning: number;
    timeout?: number;
    terminateGraceMs: number;
    terminateForceMs: number;
    lineBufferSize: number;
    charBufferSize: number;
}>;
export declare const processGetTaskRunnerConfig: ToolFactory;
export declare const processUpdateTaskRunnerConfig: ToolFactory;
export declare const processEnqueueTask: ToolFactory;
export declare const processStopTask: ToolFactory;
export declare const processGetStdout: ToolFactory;
export declare const processGetStderr: ToolFactory;
export declare const processGetQueue: ToolFactory;
export declare const __resetProcessManagerForTests: () => void;
export type { RunnerConfig };
//# sourceMappingURL=process-manager.d.ts.map