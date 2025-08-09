export const Topics = {
  HeartbeatReceived: { name: "heartbeat.received", retentionDays: 3 },
  ProcessState: { name: "process.state", compaction: true }, // keyed by process-id
  KvSet: { name: "kv.set", compaction: true }, // keyed by path
} as const;
