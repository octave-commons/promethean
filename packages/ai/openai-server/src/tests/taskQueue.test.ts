import { sleep } from "@promethean/utils";
import test from "ava";

import { createTaskQueue } from "../queue/taskQueue.js";

/* eslint-disable functional/no-let */
const createRecorder = <T>() => {
  let values: ReadonlyArray<T> = [];
  return {
    add: (value: T) => {
      values = [...values, value];
    },
    all: (): ReadonlyArray<T> => values,
  };
};
/* eslint-enable functional/no-let */

test("processes tasks sequentially when concurrency is one", async (t) => {
  const processed = createRecorder<string>();
  const queue = createTaskQueue<string, string>(
    async (task) => {
      processed.add(`${task.id}:${task.input}`);
      await sleep(5);
      return task.input.toUpperCase();
    },
    {
      concurrency: 1,
    },
  );

  const results = await Promise.all([
    queue.enqueue("alpha"),
    queue.enqueue("beta"),
    queue.enqueue("gamma"),
  ]);

  t.deepEqual(results, ["ALPHA", "BETA", "GAMMA"]);
  const seenInputs = processed.all().map((entry) => entry.split(":")[1]);
  t.deepEqual(seenInputs, ["alpha", "beta", "gamma"]);

  const snapshot = queue.snapshot();
  t.is(snapshot.pending.length, 0);
  t.is(snapshot.metrics.completed, 3);
  t.is(snapshot.metrics.failed, 0);
  t.is(snapshot.recent.length, 3);
});

test("records failed tasks without blocking subsequent work", async (t) => {
  const queue = createTaskQueue<number, number>(
    async (task) => {
      if (task.input === 2) {
        throw new Error(`boom-${task.input}`);
      }
      await sleep(2);
      return task.input * 2;
    },
    {
      concurrency: 2,
      recentLimit: 5,
    },
  );

  const first = queue.enqueue(1);
  const second = queue.enqueue(2);
  const third = queue.enqueue(3);

  await t.throwsAsync(second, { message: /boom-2/ });
  const resolved = await Promise.all([first, third]);
  t.deepEqual(resolved, [2, 6]);

  const snapshot = queue.snapshot();
  t.is(snapshot.metrics.completed, 2);
  t.is(snapshot.metrics.failed, 1);
  t.is(snapshot.pending.length, 0);
  t.is(snapshot.processing.length, 0);
  t.truthy(snapshot.recent.find((entry) => entry.status === "failed"));
});
