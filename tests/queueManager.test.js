import test from "ava";
import { queueManager } from "../shared/js/queueManager.js";

test.serial("ready and enqueue dispatches and acknowledges task", (t) => {
  const messages = [];
  const ws = { send: (msg) => messages.push(msg) };
  const workerId = "worker1";
  const queue = "alpha";

  queueManager.ready(ws, workerId, queue);
  const task = queueManager.enqueue(queue, { foo: "bar" });

  t.is(messages.length, 1);
  const msg = JSON.parse(messages[0]);
  t.is(msg.action, "task-assigned");
  t.is(msg.task.id, task.id);

  const acked = queueManager.acknowledge(workerId, task.id);
  t.true(acked);

  const state = queueManager.getState();
  t.is(state.assignments[workerId], undefined);
  t.is(state.queues[queue], 0);
  queueManager.unregisterWorker(workerId);
});

test.serial("heartbeat updates lastSeen", async (t) => {
  const ws = { send: () => {} };
  const workerId = "worker2";
  const queue = "beta";

  queueManager.ready(ws, workerId, queue);
  const before = queueManager.getState().workers[workerId].lastSeen;

  await new Promise((resolve) => setTimeout(resolve, 10));
  queueManager.heartbeat(workerId);
  const after = queueManager.getState().workers[workerId].lastSeen;
  t.true(after >= before);
  queueManager.unregisterWorker(workerId);
});
