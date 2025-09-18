import test from "ava";
import { TaskQueue } from "../taskQueue.js";

const queueName = "ingest";

const createQueue = () => new TaskQueue();

test("enqueue stores tasks with metadata", (t) => {
  const q = createQueue();
  const task = q.enqueue(queueName, { foo: "bar" });

  t.truthy(task.id);
  t.is(task.queue, queueName);
  t.is(task.attempts, 0);
  t.is(q.list(queueName).length, 1);
});

test("pull assigns tasks and tracks inflight attempts", (t) => {
  const q = createQueue();
  q.enqueue(queueName, { foo: "bar" });

  const task = q.pull(queueName, "worker-a");
  t.truthy(task);
  t.is(task.attempts, 1);
  t.is(q.list(queueName).length, 0);
  t.deepEqual(q.inflightTasks()[0]?.assignedTo, "worker-a");
});

test("ack removes inflight tasks", (t) => {
  const q = createQueue();
  const task = q.enqueue(queueName, {});
  const pulled = q.pull(queueName, "worker-a");

  t.deepEqual(pulled.id, task.id);
  t.true(q.ack(task.id));
  t.is(q.inflightTasks().length, 0);
});

test("fail optionally requeues tasks", (t) => {
  const q = createQueue();
  const task = q.enqueue(queueName, {});
  q.pull(queueName, "worker-a");

  t.true(q.fail(task.id));
  t.is(q.list(queueName).length, 1);
  const retry = q.pull(queueName, "worker-b");
  t.is(retry.attempts, 2);

  q.pull(queueName, "worker-c");
  t.true(q.fail(task.id, false));
  t.is(q.list(queueName).length, 0);
});

test("allQueues exposes queue snapshots", (t) => {
  const q = createQueue();
  q.enqueue(queueName, {});
  q.enqueue("secondary", {});

  const entries = q.allQueues();
  const names = entries.map(([name]) => name).sort();

  t.deepEqual(names, ["ingest", "secondary"]);
});
