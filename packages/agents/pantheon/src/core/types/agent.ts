/**
 * Agent-related types for the Pantheon Agent Framework
 */

export type AgentId = {
  readonly value: string;
  readonly type: 'uuid' | 'name' | 'custom';
};

export type AgentCapability = {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly dependencies?: readonly string[];
};

export type AgentMetadata = {
  readonly id: AgentId;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly capabilities: readonly AgentCapability[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly tags?: readonly string[];
  readonly status: AgentStatus;
};

export enum AgentStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  BUSY = 'busy',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
}

export type AgentInstance = {
  readonly agentId: AgentId;
  readonly instanceId: string;
  readonly status: AgentStatus;
  readonly resources: ResourceUsage;
  readonly lastHeartbeat: Date;
  readonly config: Record<string, unknown>;
};

export type ResourceUsage = {
  readonly memory: number;
  readonly cpu: number;
  readonly network?: number;
  readonly disk?: number;
};
