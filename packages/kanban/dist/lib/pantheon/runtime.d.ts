import type { BehaviorMode, Message } from '@promethean-os/pantheon-core';
type PantheonComputationOptions<TRequest, TResult> = {
    actorName: string;
    goal: string;
    mode?: BehaviorMode;
    request?: TRequest;
    logger?: (params: {
        level: 'debug' | 'info' | 'warn' | 'error';
        message: string;
        meta?: unknown;
    }) => void;
    compute: (params: {
        goal: string;
        context: Message[];
        request: TRequest | undefined;
    }) => Promise<TResult>;
};
/**
 * Runs a lightweight Pantheon actor in-memory to perform a deterministic computation.
 * The computation result is emitted as a message action and captured from the message bus.
 */
export declare function runPantheonComputation<TRequest, TResult>(options: PantheonComputationOptions<TRequest, TResult>): Promise<TResult>;
export {};
//# sourceMappingURL=runtime.d.ts.map