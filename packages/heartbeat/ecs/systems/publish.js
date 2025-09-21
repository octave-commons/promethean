export function createQueueSystem(components) {
  return {
    name: "heartbeat.brokerQueue",
    stage: "cleanup",
    reads: ["outgoingEvents", "service", "broker"],
    writes: ["outgoingEvents", "service"],
    writesComponents: [components.BrokerQueue],
    run({ resources, world, cmd }) {
      const outgoing = resources.get("outgoingEvents");
      if (!outgoing.events.length) return;
      const service = resources.get("service");
      const broker = resources.get("broker");
      const queue = world.get(service.entity, components.BrokerQueue);
      const hasQueue = Boolean(queue);
      const basePending =
        queue && broker.lastPublishedVersion === queue.version
          ? []
          : queue?.pending || [];
      const pending = basePending.concat(outgoing.events);
      outgoing.events.length = 0;
      if (!pending.length && !hasQueue) return;
      const nextVersion = queue ? queue.version + (pending.length ? 1 : 0) : 1;
      const nextState = {
        pending,
        version: nextVersion,
      };
      if (hasQueue) {
        cmd.set(service.entity, components.BrokerQueue, nextState);
      } else {
        cmd.add(service.entity, components.BrokerQueue, nextState);
      }
    },
  };
}

export function createPublishSystem(components) {
  return {
    name: "heartbeat.publish",
    stage: "cleanup",
    reads: ["broker", "service"],
    writes: ["broker"],
    writesComponents: [components.BrokerQueue],
    after: ["heartbeat.brokerQueue"],
    async run({ resources, world, cmd }) {
      const service = resources.get("service");
      const queue = world.get(service.entity, components.BrokerQueue);
      if (!queue || !queue.pending.length) return;
      const broker = resources.get("broker");
      if (!broker.client) return;
      let failed = false;
      for (const event of queue.pending) {
        try {
          broker.client.publish(event.type, event.payload);
        } catch (err) {
          console.error("heartbeat publish failed", err);
          failed = true;
        }
      }
      if (failed) return;
      broker.lastPublishedVersion = queue.version;
      cmd.remove(service.entity, components.BrokerQueue);
    },
  };
}
