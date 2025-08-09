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
