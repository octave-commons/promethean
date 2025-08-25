// shared/js/redisTaskQueue.js

import { createClient } from "redis";
import { randomUUID } from "crypto";

export class RedisTaskQueue {
  constructor({ redisUrl = "redis://localhost:6379" } = {}) {
    this.redis = createClient({ url: redisUrl });
    this.redis.on("error", (err) => console.error("Redis error:", err));
    this.ready = this.redis.connect();
  }

  async enqueue(queue, payload) {
    await this.ready;
    const id = randomUUID();
    const task = {
      id,
      queue,
      payload,
      createdAt: new Date().toISOString(),
      attempts: 0,
    };
    await this.redis.rPush(`queue:${queue}`, JSON.stringify(task));
    return task;
  }

  async pull(queue, clientId) {
    await this.ready;
    const raw = await this.redis.lPop(`queue:${queue}`);
    if (!raw) return null;
    const task = JSON.parse(raw);
    task.attempts += 1;
    task.assignedTo = clientId;
    await this.redis.set(`inflight:${task.id}`, JSON.stringify(task));
    return task;
  }

  async ack(taskId) {
    await this.ready;
    await this.redis.del(`inflight:${taskId}`);
    return true;
  }

  async fail(taskId, requeue = true) {
    await this.ready;
    const raw = await this.redis.get(`inflight:${taskId}`);
    if (!raw) return false;
    const task = JSON.parse(raw);
    await this.redis.del(`inflight:${taskId}`);
    if (requeue) {
      await this.redis.rPush(`queue:${task.queue}`, JSON.stringify(task));
    }
    return true;
  }

  async list(queue) {
    await this.ready;
    const rawList = await this.redis.lRange(`queue:${queue}`, 0, -1);
    return rawList.map((raw) => JSON.parse(raw));
  }

  async inflightTasks() {
    await this.ready;
    const keys = await this.redis.keys("inflight:*");
    const values = await this.redis.mGet(keys);
    return values.map((raw) => JSON.parse(raw));
  }

  async allQueues() {
    await this.ready;
    const keys = await this.redis.keys("queue:*");
    return Promise.all(
      keys.map(async (k) => {
        const queue = k.replace(/^queue:/, "");
        const list = await this.list(queue);
        return [queue, list];
      }),
    );
  }
}
