/**
 * Protocol and communication types for the Pantheon Agent Framework
 */

import type { AgentId } from './agent.js';

export type MessageId = {
  readonly value: string;
  readonly type: 'uuid' | 'correlation';
};

export type MessageEnvelope = {
  readonly id: MessageId;
  readonly from: AgentId;
  readonly to: AgentId;
  readonly type: string;
  readonly payload: unknown;
  readonly timestamp: Date;
  readonly correlationId?: MessageId;
  readonly priority: MessagePriority;
  readonly ttl?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export enum MessagePriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

export type TransportConfig = {
  readonly type: 'amqp' | 'websocket' | 'http' | 'memory';
  readonly connection: unknown;
  readonly options?: Readonly<Record<string, unknown>>;
};
