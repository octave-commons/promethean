import test from "ava";
import { queueManager } from "../shared/js/queueManager.js";

function createWS() {
  return {
    messages: [],
    send(msg) {
      this.messages.push(msg);
    },
  };
}

// If you can add a reset in queueManager, uncomment:
// test.beforeEach(() => queueManager.reset());

test.serial("ready dispatches queued task and acknowledge clears assignment", (t) => {
  const ws = createWS();
  const workerId = "w1";
  const queue = "alpha";

  queueManager.ready(ws, workerId, queue);
  const task = queueManager.enqueue(queue, { value: 1 });

  t.is(ws.messages.length, 1);
  const msg = JSON.parse(ws.messages[0]);
  t.is(msg.action, "task-assigned");
  t.is(msg.task.id, task.id);

  t.true(queueManager.acknowledge(workerId, task.id));

  const state = queueManager.getState();
  t.is(state.queues[queue], 0);
  t.is(state.assignments[workerId], undefined);

  queueManager.unregisterWorker(workerId);
});

test.serial("unregisterWorker requeues unacked task", (t) => {
  const ws = createWS();
  const workerId = "w2";
  const queue = "beta";

  queueManager.ready(ws, workerId, queue);
  const task = queueManager.enqueue(queue, { value: 2 });

  // first assignment went out
  t.is(ws.messages.length, 1);
  const assigned = JSON.parse(ws.messages[0]);
  t.is(assigned.task.id, task.id);

  // drop the worker without ack -> task should be requeued
  queueManager.unregisterWorker(workerId);

  const state = queueManager.getState();
  t.is(state.queues[queue], 1);
  t.deepEqual(Object.keys(state.assignments), []);

  // prove it can be reassigned to a new worker and acked
  const ws2 = createWS();
  const cleanupId = "cleanup";
  queueManager.ready(ws2, cleanupId, queue);

  t.is(ws2.messages.length, 1);
  const reassigned = JSON.parse(ws2.messages[0]);
  t.true(queueManager.acknowledge(cleanupId, reassigned.task.id));

  queueManager.unregisterWorker(cleanupId);
});

test.serial("heartbeat updates lastSeen", async (t) => {
  const ws = createWS();
  const workerId = "w3";
  const queue = "gamma";

  queueManager.ready(ws, workerId, queue);
  const before = queueManager.getState().workers[workerId].lastSeen;

  await new Promise((r) => setTimeout(r, 10));
  queueManager.heartbeat(workerId);
  const after = queueManager.getState().workers[workerId].lastSeen;

  t.true(after >= before);

  queueManager.unregisterWorker(workerId);
});

