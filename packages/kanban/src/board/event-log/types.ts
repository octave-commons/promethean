import type { ReadonlyDeep } from 'type-fest';

export type TransitionEvent = {
  readonly id: string;
  readonly timestamp: string;
  readonly taskId: string;
  readonly fromStatus: string;
  readonly toStatus: string;
  readonly reason?: string;
  readonly actor: 'agent' | 'human' | 'system';
  readonly metadata?: Record<string, unknown>;
};

export type TaskTransitionResult = {
  readonly finalStatus: string;
  readonly isValid: boolean;
  readonly lastValidEvent?: TransitionEvent;
  readonly invalidEvent?: TransitionEvent;
  readonly events: ReadonlyArray<TransitionEvent>;
};

export type LogStats = {
  readonly totalEvents: number;
  readonly uniqueTasks: number;
  readonly dateRange: {
    readonly earliest: string | null;
    readonly latest: string | null;
  };
};
