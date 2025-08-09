import test from "ava";
import { TaskQueue } from "../shared/js/taskQueue.js";

test("enqueue, pull, and ack workflow", (t) => {
  const q = new TaskQueue();
  const task = q.enqueue("alpha", { x: 1 });
  t.is(q.list("alpha").length, 1);

  const pulled = q.pull("alpha", "worker1");
  t.is(pulled.id, task.id);
  t.is(q.list("alpha").length, 0);
  t.is(q.inflightTasks().length, 1);

  const acked = q.ack(task.id);
  t.true(acked);
  t.is(q.inflightTasks().length, 0);
});

test("fail requeues task by default", (t) => {
  const q = new TaskQueue();
  const task = q.enqueue("beta", { y: 2 });
  q.pull("beta", "worker1");
  t.is(q.list("beta").length, 0);

  const failed = q.fail(task.id);
  t.true(failed);
  t.is(q.list("beta").length, 1);
  t.is(q.inflightTasks().length, 0);
});

test("fail without requeue drops task", (t) => {
  const q = new TaskQueue();
  const task = q.enqueue("gamma", { z: 3 });
  q.pull("gamma", "worker1");

  const failed = q.fail(task.id, false);
  t.true(failed);
  t.is(q.list("gamma").length, 0);
  t.is(q.inflightTasks().length, 0);
});

test("fail returns false when task not inflight", (t) => {
  const q = new TaskQueue();
  const result = q.fail("missing-id");
  t.false(result);
});

test("fail requeues task when original queue removed", (t) => {
  const q = new TaskQueue();
  const task = q.enqueue("delta", { n: 4 });
  q.pull("delta", "worker1");
  q.queues.delete("delta");

  const failed = q.fail(task.id);
  t.true(failed);
  t.is(q.list("delta").length, 1);
});

test("list returns empty array for unknown queue", (t) => {
  const q = new TaskQueue();
  t.deepEqual(q.list("omega"), []);
});

test("pull returns null when queue empty", (t) => {
  const q = new TaskQueue();
  const result = q.pull("delta", "worker1");
  t.is(result, null);
});

test("allQueues returns all active queues", (t) => {
  const q = new TaskQueue();
  q.enqueue("alpha", { a: 1 });
  q.enqueue("beta", { b: 2 });
  const queues = q.allQueues();
  t.is(queues.length, 2);
  t.deepEqual(queues.map(([name]) => name).sort(), ["alpha", "beta"]);
});

test("ack returns false when task not inflight", (t) => {
  const q = new TaskQueue();
  const result = q.ack("missing-id");
  t.false(result);
});
