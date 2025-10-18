export type CompletionStatus = "completed" | "failed";

export type QueueRecord = {
  readonly id: string;
  readonly status: CompletionStatus;
  readonly enqueuedAt: number;
  readonly startedAt: number;
  readonly finishedAt: number;
  readonly durationMs: number;
};

export type QueueSnapshot = {
  readonly pending: ReadonlyArray<{
    readonly id: string;
    readonly enqueuedAt: number;
  }>;
  readonly processing: ReadonlyArray<{
    readonly id: string;
    readonly enqueuedAt: number;
    readonly startedAt: number;
  }>;
  readonly metrics: {
    readonly enqueued: number;
    readonly completed: number;
    readonly failed: number;
  };
  readonly recent: ReadonlyArray<QueueRecord>;
  readonly updatedAt: number;
};

export type QueueTask<TInput> = {
  readonly id: string;
  readonly input: Readonly<TInput>;
  readonly enqueuedAt: number;
};

export type QueueOptions = {
  readonly concurrency?: number;
  readonly recentLimit?: number;
  readonly idFactory?: () => string;
};

export type TaskQueue<TInput, TResult> = {
  readonly enqueue: (input: Readonly<TInput>) => Promise<TResult>;
  readonly size: () => number;
  readonly snapshot: () => QueueSnapshot;
};
