export function defineHeartbeatComponents(world) {
  const MonitoredProcess = world.defineComponent({
    name: "MonitoredProcess",
    defaults: () => ({ pid: 0, name: "", sessionId: "", lastHeartbeat: 0 }),
  });

  const ProcessMetrics = world.defineComponent({
    name: "ProcessMetrics",
    defaults: () => ({ cpu: 0, memory: 0, netRx: 0, netTx: 0 }),
  });

  const KillRequest = world.defineComponent({
    name: "KillRequest",
    defaults: () => ({ pid: 0, requestedAt: 0, reason: "" }),
  });

  const BrokerQueue = world.defineComponent({
    name: "HeartbeatBrokerQueue",
    defaults: () => ({ pending: [], version: 0 }),
  });

  return {
    MonitoredProcess,
    ProcessMetrics,
    KillRequest,
    BrokerQueue,
  };
}
