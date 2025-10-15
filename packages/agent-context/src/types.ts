import { z } from 'zod';

export const ContextEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  agentId: z.string(),
  timestamp: z.date(),
  data: z.record(z.any()),
  metadata: z.record(z.any()).optional(),
});

export const ContextSnapshotSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  timestamp: z.date(),
  state: z.record(z.any()),
  version: z.number(),
  eventId: z.string(),
});

export const AgentContextSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  state: z.record(z.any()),
  version: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.any()).optional(),
});

export const AuthTokenSchema = z.object({
  token: z.string(),
  agentId: z.string(),
  expiresAt: z.date(),
  permissions: z.array(z.string()),
});

export type ContextEvent = z.infer<typeof ContextEventSchema>;
export type ContextSnapshot = z.infer<typeof ContextSnapshotSchema>;
export type AgentContext = z.infer<typeof AgentContextSchema>;
export type AuthToken = z.infer<typeof AuthTokenSchema>;

export interface EventStore {
  appendEvent(event: ContextEvent): Promise<void>;
  getEvents(agentId: string, fromVersion?: number): Promise<ContextEvent[]>;
  getEvent(eventId: string): Promise<ContextEvent | null>;
}

export interface SnapshotStore {
  saveSnapshot(snapshot: ContextSnapshot): Promise<void>;
  getLatestSnapshot(agentId: string): Promise<ContextSnapshot | null>;
  getSnapshot(snapshotId: string): Promise<ContextSnapshot | null>;
}

export interface ContextManager {
  getContext(agentId: string): Promise<AgentContext>;
  updateContext(agentId: string, updates: Partial<AgentContext>): Promise<AgentContext>;
  appendEvent(event: Omit<ContextEvent, 'id' | 'timestamp'>): Promise<ContextEvent>;
  createSnapshot(agentId: string): Promise<ContextSnapshot>;
  restoreFromSnapshot(snapshotId: string): Promise<AgentContext>;
}

export interface AuthService {
  generateToken(agentId: string, permissions: string[]): Promise<AuthToken>;
  validateToken(token: string): Promise<AuthToken | null>;
  revokeToken(token: string): Promise<void>;
}

export interface ContextShare {
  id: string;
  sourceAgentId: string;
  targetAgentId: string;
  contextSnapshotId: string;
  shareType: 'read' | 'write' | 'admin';
  permissions: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  createdBy?: string;
}

export interface ContextMetadata {
  id: string;
  agentId: string;
  contextKey: string;
  contextValue: any;
  contextType: string;
  visibility: 'private' | 'shared' | 'public';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContextQuery {
  agentId?: string;
  contextType?: string;
  visibility?: string;
  keyPattern?: string;
  limit?: number;
  offset?: number;
}

export interface ContextShareStore {
  createShare(share: Omit<ContextShare, 'id' | 'createdAt'>): Promise<ContextShare>;
  getSharesForAgent(agentId: string): Promise<ContextShare[]>;
  getSharedContexts(agentId: string): Promise<ContextShare[]>;
  revokeShare(shareId: string): Promise<void>;
  updateShare(shareId: string, updates: Partial<ContextShare>): Promise<ContextShare>;
}

export interface ContextMetadataStore {
  setMetadata(
    metadata: Omit<ContextMetadata, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ContextMetadata>;
  getMetadata(agentId: string, key?: string): Promise<ContextMetadata[]>;
  updateMetadata(agentId: string, key: string, value: any): Promise<ContextMetadata>;
  deleteMetadata(agentId: string, key: string): Promise<void>;
  queryMetadata(query: ContextQuery): Promise<ContextMetadata[]>;
  cleanupExpired(): Promise<void>;
}

export interface ContextLifecycleManager {
  createContext(agentId: string, initialState?: any): Promise<AgentContext>;
  archiveContext(agentId: string): Promise<void>;
  deleteContext(agentId: string): Promise<void>;
  cleanupExpiredContexts(): Promise<void>;
  getContextStatistics(agentId: string): Promise<ContextStatistics>;
}

export interface ContextStatistics {
  totalEvents: number;
  totalSnapshots: number;
  totalShares: number;
  lastActivity: Date;
  contextSize: number;
  activeShares: number;
}
