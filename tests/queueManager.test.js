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

test.serial(
  "ready dispatches queued task and acknowledge clears assignment",
  (t) => {
    const ws = createWS();
    queueManager.ready(ws, "w1", "alpha");
    const task = queueManager.enqueue("alpha", { value: 1 });

    t.is(ws.messages.length, 1);
    const msg = JSON.parse(ws.messages[0]);
    t.is(msg.action, "task-assigned");
    t.is(msg.task.id, task.id);

    t.true(queueManager.acknowledge("w1", task.id));
    const state = queueManager.getState();
    t.is(state.queues.alpha, 0);
    t.is(Object.keys(state.assignments).length, 0);

    queueManager.unregisterWorker("w1");
  },
);

test.serial("unregisterWorker requeues unacked task", (t) => {
  const ws = createWS();
  queueManager.ready(ws, "w2", "beta");
  const task = queueManager.enqueue("beta", { value: 2 });
  JSON.parse(ws.messages[0]);

  queueManager.unregisterWorker("w2");
  const state = queueManager.getState();
  t.is(state.queues.beta, 1);
  t.is(Object.keys(state.assignments).length, 0);

  const ws2 = createWS();
  queueManager.ready(ws2, "cleanup", "beta");
  const msg2 = JSON.parse(ws2.messages[0]);
  queueManager.acknowledge("cleanup", msg2.task.id);
  queueManager.unregisterWorker("cleanup");
});

test.serial("heartbeat updates lastSeen", async (t) => {
  const ws = createWS();
  queueManager.ready(ws, "w3", "gamma");
  const before = queueManager.getState().workers["w3"].lastSeen;
  await new Promise((r) => setTimeout(r, 10));
  queueManager.heartbeat("w3");
  const after = queueManager.getState().workers["w3"].lastSeen;
  t.true(after > before);
  queueManager.unregisterWorker("w3");
});
