// shared/js/serviceTemplate.js

import { BrokerClient } from "./brokerClient.js";

export async function startService({
  id,
  queues = [],
  topics = [],
  handleEvent = async (event) => {},
  handleTask = async (task) => {},
}) {
  const broker = new BrokerClient({ id });
  await broker.connect();
  console.log(`[${id}] connected to broker`);

  // Subscribe to topics
  for (const topic of topics) {
    broker.subscribe(topic, async (event) => {
      console.log(`[${id}] received event:`, event.type);
      try {
        await handleEvent(event);
      } catch (err) {
        console.error(`[${id}] event handler error:`, err);
      }
    });
  }

  // Handle task pulling
  if (queues.length > 0) {
    broker.onTaskReceived(async (task, queue) => {
      const q = task?.queue || queue;
      if (!q) return;
      if (!task) {
        setTimeout(() => broker.pull(q), 500);
        return;
      }
      console.log(`[${id}] received task:`, q);
      try {
        await handleTask(task);
        broker.ack(task.id);
      } catch (err) {
        console.error(`[${id}] task failed:`, err);
        broker.fail(task.id, err.message);
      } finally {
        setTimeout(() => broker.pull(q), 100); // pull next
      }
    });

    // Start pulling
    for (const queue of queues) {
      broker.pull(queue);
    }
  }

  return broker;
}
