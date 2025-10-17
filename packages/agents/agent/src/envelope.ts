export type AgentEnvelope<T = unknown> = {
    id: string;
    ts: string;
    src: string;
    dst: string;
    provider: string;
    tenant: string;
    intent: string;
    payload: T;
    trace?: string;
    corr?: string;
    build_sha?: string;
    models?: Array<{ name: string; version: string; checksum?: string }>;
    config_rev?: string;
};
