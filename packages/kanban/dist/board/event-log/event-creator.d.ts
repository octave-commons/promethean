import type { TransitionEvent } from './types.js';
type CreateEventOptions = {
    readonly actor?: 'agent' | 'human' | 'system';
    readonly reason?: string;
    readonly metadata?: Record<string, unknown>;
};
export declare const createTransitionEvent: (taskId: string, fromStatus: string, toStatus: string, options?: CreateEventOptions) => TransitionEvent;
export {};
//# sourceMappingURL=event-creator.d.ts.map