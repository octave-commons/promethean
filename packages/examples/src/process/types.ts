export interface HeartbeatPayload {
    pid: number;
    name: string;
    host: string;
    cpu_pct: number;
    mem_mb: number;
    sid?: string;
}

export interface ProcessState {
    processId: string; // `${host}:${name}:${pid}`
    name: string;
    host: string;
    pid: number;
    sid?: string;
    cpu_pct: number;
    mem_mb: number;
    last_seen_ts: number;
    status: 'alive' | 'stale';
}
