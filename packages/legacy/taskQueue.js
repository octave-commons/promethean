// SPDX-License-Identifier: GPL-3.0-only
// shared/js/taskQueue.js

import { randomUUID } from "crypto";

export class TaskQueue {
  constructor() {
    this.queues = new Map(); // queueName -> task[]
    this.inflight = new Map(); // taskId -> { task, queue, assignedTo }
  }

  enqueue(queue, payload) {
    const id = randomUUID();
    const task = {
      id,
      queue,
      payload,
      createdAt: new Date().toISOString(),
      attempts: 0,
    };
    if (!this.queues.has(queue)) this.queues.set(queue, []);
    this.queues.get(queue).push(task);
    return task;
  }

  pull(queue, clientId) {
    const list = this.queues.get(queue);
    if (!list || list.length === 0) return null;
    const task = list.shift();
    task.attempts += 1;
    this.inflight.set(task.id, { task, queue, assignedTo: clientId });
    return task;
  }

  ack(taskId) {
    return this.inflight.delete(taskId);
  }

  fail(taskId, requeue = true) {
    const entry = this.inflight.get(taskId);
    if (!entry) return false;
    this.inflight.delete(taskId);
    if (requeue) {
      if (!this.queues.has(entry.queue)) this.queues.set(entry.queue, []);
      this.queues.get(entry.queue).push(entry.task);
    }
    return true;
  }

  list(queue) {
    return this.queues.get(queue) || [];
  }

  inflightTasks() {
    return Array.from(this.inflight.values());
  }

  allQueues() {
    return Array.from(this.queues.entries());
  }
}
