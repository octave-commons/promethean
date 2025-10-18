import type {
  CompletionStatus,
  QueueRecord,
  QueueSnapshot,
  QueueTask,
} from "./types.js";

type PendingEntry<TInput, TResult> = {
  readonly task: QueueTask<TInput>;
  readonly resolve: (value: TResult) => void;
  readonly reject: (reason: unknown) => void;
};

type ProcessingEntry<TInput, TResult> = PendingEntry<TInput, TResult> & {
  readonly startedAt: number;
};

type QueueState<TInput, TResult> = {
  readonly pending: ReadonlyArray<PendingEntry<TInput, TResult>>;
  readonly processing: ReadonlyArray<ProcessingEntry<TInput, TResult>>;
  readonly metrics: {
    readonly enqueued: number;
    readonly completed: number;
    readonly failed: number;
  };
  readonly recent: ReadonlyArray<QueueRecord>;
};

type ImmutableQueueState<TInput, TResult> = Readonly<
  QueueState<TInput, TResult>
>;

type QueueStateController<TInput, TResult> = {
  readonly get: () => QueueState<TInput, TResult>;
  readonly set: (
    state: ImmutableQueueState<TInput, TResult>,
  ) => QueueState<TInput, TResult>;
  readonly update: (
    updater: (
      state: ImmutableQueueState<TInput, TResult>,
    ) => QueueState<TInput, TResult>,
  ) => QueueState<TInput, TResult>;
};

type CompletionContext<TInput, TResult> = {
  readonly entry: ProcessingEntry<TInput, TResult>;
  readonly status: CompletionStatus;
  readonly finishedAt: number;
  readonly recentLimit: number;
};

const dropFirst = <T>(
  items: ReadonlyArray<T>,
): {
  readonly head: T | undefined;
  readonly tail: ReadonlyArray<T>;
} => {
  if (items.length === 0) {
    return { head: undefined, tail: items };
  }
  const [head, ...tail] = items;
  return { head, tail };
};

const removeById = <T extends { readonly task: QueueTask<unknown> }>(
  items: ReadonlyArray<T>,
  id: string,
): ReadonlyArray<T> => items.filter((entry) => entry.task.id !== id);

const buildRecord = <TInput, TResult>(
  entry: Readonly<ProcessingEntry<TInput, TResult>>,
  status: CompletionStatus,
  finishedAt: number,
): QueueRecord => ({
  id: entry.task.id,
  status,
  enqueuedAt: entry.task.enqueuedAt,
  startedAt: entry.startedAt,
  finishedAt,
  durationMs: finishedAt - entry.startedAt,
});

export const createQueueStateController = <TInput, TResult>(
  initial: ImmutableQueueState<TInput, TResult>,
): QueueStateController<TInput, TResult> => {
  /* eslint-disable functional/no-let */
  let current = initial;
  const set = (
    state: ImmutableQueueState<TInput, TResult>,
  ): QueueState<TInput, TResult> => {
    current = state;
    return current;
  };
  /* eslint-enable functional/no-let */

  const update = (
    updater: (
      state: QueueState<TInput, TResult>,
    ) => QueueState<TInput, TResult>,
  ): QueueState<TInput, TResult> => set(updater(current));

  return {
    get: () => current,
    set,
    update,
  };
};

export const toSnapshot = <TInput, TResult>(
  state: ImmutableQueueState<TInput, TResult>,
  recentLimit: number,
): QueueSnapshot => ({
  pending: state.pending.map(({ task }) => ({
    id: task.id,
    enqueuedAt: task.enqueuedAt,
  })),
  processing: state.processing.map(({ task, startedAt }) => ({
    id: task.id,
    enqueuedAt: task.enqueuedAt,
    startedAt,
  })),
  metrics: {
    enqueued: state.metrics.enqueued,
    completed: state.metrics.completed,
    failed: state.metrics.failed,
  },
  recent: state.recent.slice(0, recentLimit),
  updatedAt: Date.now(),
});

export const enqueueState = <TInput, TResult>(
  state: ImmutableQueueState<TInput, TResult>,
  entry: PendingEntry<TInput, TResult>,
): QueueState<TInput, TResult> => ({
  pending: [...state.pending, entry],
  processing: state.processing,
  metrics: {
    ...state.metrics,
    enqueued: state.metrics.enqueued + 1,
  },
  recent: state.recent,
});

export const completeState = <TInput, TResult>(
  state: ImmutableQueueState<TInput, TResult>,
  context: CompletionContext<TInput, TResult>,
): QueueState<TInput, TResult> => {
  const recentRecord = buildRecord(
    context.entry,
    context.status,
    context.finishedAt,
  );
  const metrics =
    context.status === "completed"
      ? {
          ...state.metrics,
          completed: state.metrics.completed + 1,
        }
      : {
          ...state.metrics,
          failed: state.metrics.failed + 1,
        };

  return {
    pending: state.pending,
    processing: removeById(state.processing, context.entry.task.id),
    metrics,
    recent: [recentRecord, ...state.recent].slice(0, context.recentLimit),
  };
};

export const startNextState = <TInput, TResult>(
  state: ImmutableQueueState<TInput, TResult>,
  concurrency: number,
): {
  readonly nextState: QueueState<TInput, TResult>;
  readonly entry?: ProcessingEntry<TInput, TResult>;
} => {
  if (state.processing.length >= concurrency) {
    return { nextState: state };
  }

  const { head, tail } = dropFirst(state.pending);
  if (!head) {
    return { nextState: state };
  }

  const processingEntry: ProcessingEntry<TInput, TResult> = {
    ...head,
    startedAt: Date.now(),
  };

  return {
    nextState: {
      pending: tail,
      processing: [...state.processing, processingEntry],
      metrics: state.metrics,
      recent: state.recent,
    },
    entry: processingEntry,
  };
};

export type { PendingEntry, ProcessingEntry, QueueState, QueueStateController };
