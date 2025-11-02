import { randomUUID } from "node:crypto";

import type {
  CompletionStatus,
  QueueOptions,
  QueueSnapshot,
  QueueTask,
  TaskQueue,
} from "./types.js";
import type {
  PendingEntry,
  ProcessingEntry,
  QueueStateController,
} from "./state.js";
import {
  completeState,
  createQueueStateController,
  enqueueState,
  startNextState,
  toSnapshot,
} from "./state.js";

export type {
  CompletionStatus,
  QueueOptions,
  QueueSnapshot,
  QueueTask,
  TaskQueue,
} from "./types.js";

const clampPositiveInteger = (value: number, fallback: number): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return Math.floor(value);
};

const createSnapshotReader =
  <TInput, TResult>(
    state: QueueStateController<TInput, TResult>,
    recentLimit: number,
  ): (() => QueueSnapshot) =>
  () =>
    toSnapshot(state.get(), recentLimit);

const createCompletionDispatcher = <TInput, TResult>(
  state: QueueStateController<TInput, TResult>,
  recentLimit: number,
): ((
  entry: Readonly<ProcessingEntry<TInput, TResult>>,
  status: CompletionStatus,
) => void) => {
  return (entry, status) => {
    state.update((current) =>
      completeState(current, {
        entry,
        status,
        finishedAt: Date.now(),
        recentLimit,
      }),
    );
  };
};

type SchedulerDependencies<TInput, TResult> = {
  readonly state: QueueStateController<TInput, TResult>;
  readonly concurrency: number;
  readonly processor: (task: Readonly<QueueTask<TInput>>) => Promise<TResult>;
  readonly onComplete: (
    entry: Readonly<ProcessingEntry<TInput, TResult>>,
    status: CompletionStatus,
  ) => void;
};

const processEntry = <TInput, TResult>(
  deps: SchedulerDependencies<TInput, TResult>,
  entry: Readonly<ProcessingEntry<TInput, TResult>>,
): Promise<void> =>
  deps
    .processor(entry.task)
    .then((value) => {
      entry.resolve(value);
      deps.onComplete(entry, "completed");
    })
    .catch((error) => {
      entry.reject(error);
      deps.onComplete(entry, "failed");
    });

const createScheduler = <TInput, TResult>(
  deps: SchedulerDependencies<TInput, TResult>,
): (() => void) => {
  const run = (): void => {
    const { nextState, entry } = startNextState(
      deps.state.get(),
      deps.concurrency,
    );
    deps.state.set(nextState);

    if (!entry) {
      return;
    }

    void processEntry(deps, entry).finally(run);

    if (nextState.processing.length < deps.concurrency) {
      run();
    }
  };

  return run;
};

type EnqueueDependencies<TInput, TResult> = {
  readonly state: QueueStateController<TInput, TResult>;
  readonly idFactory: () => string;
  readonly schedule: () => void;
};

const createEnqueuer = <TInput, TResult>(
  deps: EnqueueDependencies<TInput, TResult>,
): ((input: Readonly<TInput>) => Promise<TResult>) => {
  return (input) => {
    const task: QueueTask<TInput> = {
      id: deps.idFactory(),
      input,
      enqueuedAt: Date.now(),
    };

    return new Promise<TResult>((resolve, reject) => {
      const entry: PendingEntry<TInput, TResult> = {
        task,
        resolve,
        reject,
      };

      deps.state.update((current) => enqueueState(current, entry));
      deps.schedule();
    });
  };
};

const createSizer =
  <TInput, TResult>(
    state: QueueStateController<TInput, TResult>,
  ): (() => number) =>
  () =>
    state.get().pending.length;

export const createTaskQueue = <TInput, TResult>(
  processor: (task: Readonly<QueueTask<TInput>>) => Promise<TResult>,
  options: Readonly<QueueOptions> = {},
): TaskQueue<TInput, TResult> => {
  const concurrency = clampPositiveInteger(options.concurrency ?? 1, 1);
  const recentLimit = clampPositiveInteger(options.recentLimit ?? 10, 10);
  const idFactory = options.idFactory ?? (() => randomUUID());

  const state = createQueueStateController<TInput, TResult>({
    pending: [],
    processing: [],
    metrics: { enqueued: 0, completed: 0, failed: 0 },
    recent: [],
  });

  const snapshot = createSnapshotReader(state, recentLimit);
  const complete = createCompletionDispatcher(state, recentLimit);
  const scheduleNext = createScheduler({
    state,
    concurrency,
    processor,
    onComplete: complete,
  });
  const enqueue = createEnqueuer({ state, idFactory, schedule: scheduleNext });
  const size = createSizer(state);

  return { enqueue, size, snapshot };
};
