export interface TopicConfig {
    name: string;
    retentionDays?: number;
    compaction?: boolean;
}

export const Topics: Record<string, TopicConfig> = {
    HeartbeatReceived: { name: 'heartbeat.received', retentionDays: 3 },
    ProcessState: { name: 'process.state', compaction: true }, // keyed by process-id
    KvSet: { name: 'kv.set', compaction: true }, // keyed by path
} as const;
