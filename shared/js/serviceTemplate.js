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
  // Heartbeats are sent automatically; override interval with BROKER_HEARTBEAT_MS

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

  // Handle task delivery
  if (queues.length > 0) {
    broker.onTaskReceived(async (task) => {
      console.log(`[${id}] received task:`, task.queue);
      broker.ack(task.id);
      try {
        await handleTask(task);
      } catch (err) {
        console.error(`[${id}] task failed:`, err);
      } finally {
        broker.ready(task.queue);
      }
    });

    for (const queue of queues) {
      broker.ready(queue);
    }
  }

  return broker;
}
