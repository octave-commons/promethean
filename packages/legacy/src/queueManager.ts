export interface LegacyQueueJob {
  id: string;
  payload: unknown;
}

export interface LegacyQueueManager {
  enqueue: (payload: unknown) => Promise<LegacyQueueJob>;
  dequeue: () => Promise<LegacyQueueJob | null>;
}

export const createLegacyQueueManager = (): LegacyQueueManager => {
  const queue: LegacyQueueJob[] = [];
  return {
    async enqueue(payload) {
      const job = { id: `${Date.now()}`, payload };
      queue.push(job);
      return job;
    },
    async dequeue() {
      return queue.shift() ?? null;
    },
  };
};
