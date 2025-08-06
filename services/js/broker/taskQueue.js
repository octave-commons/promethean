import { createClient } from "redis";
import { randomUUID } from "crypto";

const DEFAULT_TTL = 60000; // 60s

class InMemoryTaskQueue {
  constructor() {
    this.queues = new Map();
  }

  async enqueue(name, payload, ttl = DEFAULT_TTL) {
    if (!this.queues.has(name)) this.queues.set(name, []);
    const task = {
      id: randomUUID(),
      payload,
      queue: name,
      expiresAt: Date.now() + ttl,
    };
    this.queues.get(name).push(task);
  }

  async dequeue(name) {
    const q = this.queues.get(name);
    if (!q || q.length === 0) return null;
    while (q.length > 0) {
      const task = q.shift();
      if (task.expiresAt > Date.now()) {
        return task;
      }
      // drop expired tasks
    }
    return null;
  }

  async close() {}
}

class RedisTaskQueue {
  constructor(client) {
    this.client = client;
  }

  async enqueue(name, payload, ttl = DEFAULT_TTL) {
    const task = {
      id: randomUUID(),
      payload,
      queue: name,
      expiresAt: Date.now() + ttl,
    };
    await this.client.rPush(name, JSON.stringify(task));
  }

  async dequeue(name) {
    while (true) {
      const result = await this.client.lPop(name);
      if (!result) return null;
      let task;
      try {
        task = JSON.parse(result);
      } catch {
        continue;
      }
      if (task.expiresAt > Date.now()) {
        return task;
      }
      // drop expired task and continue
    }
  }

  async close() {
    try {
      await this.client.quit();
    } catch {}
  }
}

export async function createTaskQueue() {
  const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  try {
    const client = createClient({ url });
    await client.connect();
    return new RedisTaskQueue(client);
  } catch (err) {
    console.warn("redis not available, using in-memory queue", err?.message);
    return new InMemoryTaskQueue();
  }
}

export { InMemoryTaskQueue, RedisTaskQueue };
