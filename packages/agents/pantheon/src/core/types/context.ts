/**
 * Context management types for the Pantheon Agent Framework
 */

import type { AgentId } from './agent.js';

export type ContextId = {
  readonly value: string;
  readonly type: 'session' | 'agent' | 'workflow' | 'global';
};

export type ContextMetadata = {
  readonly id: ContextId;
  readonly agentId?: AgentId;
  readonly parentId?: ContextId;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly expiresAt?: Date;
  readonly tags?: readonly string[];
  readonly permissions: ContextPermissions;
};

export type ContextPermissions = {
  readonly read: readonly AgentId[];
  readonly write: readonly AgentId[];
  readonly admin: readonly AgentId[];
  readonly public: boolean;
};

export type ContextEvent = {
  readonly id: string;
  readonly contextId: ContextId;
  readonly type: string;
  readonly data: unknown;
  readonly timestamp: Date;
  readonly agentId?: AgentId;
  readonly sequence: number;
};

export type ContextSnapshot = {
  readonly id: string;
  readonly contextId: ContextId;
  readonly data: unknown;
  readonly metadata: ContextMetadata;
  readonly timestamp: Date;
  readonly version: number;
};
