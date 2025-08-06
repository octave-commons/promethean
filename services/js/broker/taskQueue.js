import { createClient } from "redis";

class InMemoryTaskQueue {
  constructor() {
    this.queues = new Map();
  }
  async enqueue(name, task) {
    if (!this.queues.has(name)) this.queues.set(name, []);
    this.queues.get(name).push(task);
  }
  async dequeue(name) {
    const q = this.queues.get(name);
    if (!q || q.length === 0) return null;
    return q.shift();
  }
  async close() {}
}

class RedisTaskQueue {
  constructor(client) {
    this.client = client;
  }
  async enqueue(name, task) {
    await this.client.rPush(name, JSON.stringify(task));
  }
  async dequeue(name) {
    const result = await this.client.lPop(name);
    return result ? JSON.parse(result) : null;
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
