import test from "ava";

import { sleep } from "@promethean/utils";
import { BrokerClient } from "@promethean/legacy/brokerClient.js";
import {
  getMemoryBroker,
  resetMemoryBroker,
} from "@promethean/test-utils/broker.js";

test.beforeEach(() => {
  resetMemoryBroker("unit-tasks");
});

test("memory broker: ready assigns enqueued task to worker", async (t) => {
  const url = "memory://unit-tasks";
  const worker = new BrokerClient({ url, id: "w1" });
  await worker.connect();

  let assigned;
  worker.onTaskReceived((task) => {
    assigned = task;
    worker.ack(task.id);
  });
  worker.ready("jobs");

  const prod = new BrokerClient({ url, id: "p1" });
  await prod.connect();
  prod.enqueue("jobs", { x: 1 });

  await sleep(10);
  t.truthy(assigned);
  t.is(assigned.payload.x, 1);

  const logs = getMemoryBroker("unit-tasks").logs;
  t.true(
    logs.some(
      (l) =>
        l.action === "ready" &&
        l.data.queue === "jobs" &&
        l.data.client === "w1",
    ),
  );
  t.true(logs.some((l) => l.action === "enqueue" && l.data.queue === "jobs"));
  t.true(
    logs.some((l) => l.action === "task-assigned" && l.data.queue === "jobs"),
  );
  t.true(logs.some((l) => l.action === "ack" && l.data.client === "w1"));

  worker.disconnect();
  prod.disconnect();
});
