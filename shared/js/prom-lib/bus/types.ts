export type UUID = string;
export type Millis = number;
export type Partition = number;

export type Vec8 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface BrokerEnvelope<T = unknown> {
  id: UUID;
  ts: Millis;
  topic: string;
  key?: string;
  partition?: Partition;
  headers?: Record<string, string>;
  payload_sha256?: string;
  payload: T;
}

export interface EventRow<T = unknown> extends BrokerEnvelope<T> {
  offset: number;
  attempts?: number;
}

export interface TopicConfig {
  topic: string;
  partitions: number;
  retentionMs?: number;
  maxAttempts?: number;
  publishACL?: string[];
  subscribeACL?: string[];
}

export interface GroupOffset {
  topic: string;
  partition: number;
  group: string;
  lastCommitted: number;
  updatedTs: number;
}

export type FromSpec = {
  kind: "latest" | "offset" | "timestamp";
  value?: number;
};

export interface SubscribeRequest {
  type: "SUBSCRIBE";
  topic: string;
  group: string;
  from?: FromSpec;
  max_inflight?: number;
  filter?: { key?: string; header?: [string, string] };
}

export interface PublishRequest<T = unknown> {
  type: "PUBLISH";
  topic: string;
  key?: string;
  headers?: Record<string, string>;
  payload: T;
}
export interface Ack {
  type: "ACK" | "NACK";
  topic: string;
  partition: number;
  group: string;
  offset: number;
  reason?: string;
}

export interface IMessageFrame<T = unknown> {
  type: "MESSAGE";
  topic: string;
  partition: number;
  group: string;
  offset: number;
  envelope: BrokerEnvelope<T> & { offset?: number };
}

export interface Flow {
  type: "FLOW";
  credits: number;
}
