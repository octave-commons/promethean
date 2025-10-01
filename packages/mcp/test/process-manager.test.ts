import test from "ava";

import {
  __resetProcessManagerForTests,
  processEnqueueTask,
  processGetQueue,
  processGetStdout,
  processGetTaskRunnerConfig,
  processStopTask,
  processUpdateTaskRunnerConfig,
} from "../src/tools/process-manager.js";

test.beforeEach(() => {
  __resetProcessManagerForTests();
});

const ctx = {
  env: {},
  fetch,
  now: () => new Date(),
} as const;

test.serial("returns and updates task runner config", async (t) => {
  const getCfg = processGetTaskRunnerConfig(ctx);
  const updateCfg = processUpdateTaskRunnerConfig(ctx);
  const initial = await getCfg.invoke(undefined);
  t.truthy(initial.config.path);
  t.is(initial.config.maxRunning, 1);

  await updateCfg.invoke({ key: "maxRunning", value: 2 });
  await updateCfg.invoke({ key: "path", value: process.cwd() });
  const after = await getCfg.invoke(undefined);
  t.is(after.config.maxRunning, 2);
  t.is(after.config.path, process.cwd());
});

test.serial("enqueues tasks and captures stdout", async (t) => {
  const enqueue = processEnqueueTask(ctx);
  const queue = processGetQueue(ctx);
  const stdout = processGetStdout(ctx);
  const updateCfg = processUpdateTaskRunnerConfig(ctx);
  await updateCfg.invoke({ key: "path", value: process.cwd() });
  await updateCfg.invoke({ key: "maxRunning", value: 1 });

  await enqueue.invoke({
    command: process.execPath,
    args: ["-e", 'console.log("first");'],
    name: "first",
  });
  await enqueue.invoke({
    command: process.execPath,
    args: ["-e", 'console.log("second");'],
    name: "second",
  });

  let completed = 0;
  for (let i = 0; i < 20; i += 1) {
    const state = await queue.invoke(undefined);
    completed = state.completed.length;
    if (completed === 2) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  const finalState = await queue.invoke(undefined);
  t.is(finalState.completed.length, 2);
  t.deepEqual(
    finalState.completed.map((task) => task.name),
    ["first", "second"],
  );

  const logs = await stdout.invoke({ handle: "first", startLine: 1, count: 5 });
  t.true(logs.logs.includes("first"));
  t.true(logs.lastPage);
});

test.serial("stops running task and returns tail", async (t) => {
  const enqueue = processEnqueueTask(ctx);
  const stop = processStopTask(ctx);
  const queue = processGetQueue(ctx);
  const updateCfg = processUpdateTaskRunnerConfig(ctx);
  await updateCfg.invoke({ key: "path", value: process.cwd() });
  await updateCfg.invoke({ key: "maxRunning", value: 1 });

  await enqueue.invoke({
    command: process.execPath,
    args: [
      "-e",
      'console.log("start"); setInterval(() => console.log("tick"), 20); setTimeout(() => {}, 1000);',
    ],
    name: "ticker",
  });

  let pid: number | null = null;
  for (let i = 0; i < 20; i += 1) {
    const state = await queue.invoke(undefined);
    const running = state.running.find((task) => task.name === "ticker");
    if (running?.pid) {
      pid = running.pid;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  t.truthy(pid);

  const result = await stop.invoke({ handle: "ticker", tail: 20 });
  t.true(result.tail.length <= 20);
  t.true(result.tail.includes("tick") || result.tail.includes("start"));

  for (let i = 0; i < 20; i += 1) {
    const state = await queue.invoke(undefined);
    if (state.running.length === 0 && state.waiting.length === 0) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  const finalState = await queue.invoke(undefined);
  t.is(finalState.running.length, 0);
});
