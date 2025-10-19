/**
 * Mock implementations for testing context module
 */

import type {
  ContextEvent,
  ContextSnapshot,
  AgentContext,
  EventStore,
  SnapshotStore,
  AuthToken,
  ContextShare,
  ContextQuery,
} from '../../../src/context/types.js';
import type { ContextMetadata as CoreContextMetadata } from '../../../src/core/types/context.js';

export class MockEventStore implements EventStore {
  private events: Map<string, ContextEvent[]> = new Map();

  async appendEvent(event: ContextEvent): Promise<void> {
    const agentEvents = this.events.get(event.agentId) || [];
    agentEvents.push(event);
    this.events.set(event.agentId, agentEvents);
  }

  async getEvents(
    agentId: string,
    fromVersion?: number
  ): Promise<ContextEvent[]> {
    const agentEvents = this.events.get(agentId) || [];
    if (fromVersion !== undefined) {
      return agentEvents.filter(
        (event) => event.metadata?.version >= fromVersion
      );
    }
    return [...agentEvents];
  }

  async getEvent(eventId: string): Promise<ContextEvent | null> {
    for (const events of this.events.values()) {
      const event = events.find((e) => e.id === eventId);
      if (event) return event;
    }
    return null;
  }

  // Helper method for testing
  clear(): void {
    this.events.clear();
  }

  // Helper method to inspect internal state
  getAllEvents(): Map<string, ContextEvent[]> {
    return new Map(this.events);
  }
}

export class MockSnapshotStore implements SnapshotStore {
  private snapshots: Map<string, ContextSnapshot> = new Map();
  private latestSnapshots: Map<string, ContextSnapshot> = new Map();

  async saveSnapshot(snapshot: ContextSnapshot): Promise<void> {
    this.snapshots.set(snapshot.id, snapshot);
    this.latestSnapshots.set(snapshot.agentId, snapshot);
  }

  async getLatestSnapshot(agentId: string): Promise<ContextSnapshot | null> {
    return this.latestSnapshots.get(agentId) || null;
  }

  async getSnapshot(snapshotId: string): Promise<ContextSnapshot | null> {
    return this.snapshots.get(snapshotId) || null;
  }

  // Helper methods for testing
  clear(): void {
    this.snapshots.clear();
    this.latestSnapshots.clear();
  }

  getAllSnapshots(): Map<string, ContextSnapshot> {
    return new Map(this.snapshots);
  }
}

export class MockAuthService {
  private tokens: Map<string, AuthToken> = new Map();

  async generateToken(
    agentId: string,
    permissions: string[]
  ): Promise<AuthToken> {
    const token: AuthToken = {
      token: `mock-token-${Date.now()}-${Math.random()}`,
      agentId,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      permissions,
    };

    this.tokens.set(token.token, token);
    return token;
  }

  async validateToken(token: string): Promise<AuthToken | null> {
    const authToken = this.tokens.get(token);
    if (!authToken) return null;

    // Check if expired
    if (authToken.expiresAt < new Date()) {
      this.tokens.delete(token);
      return null;
    }

    return authToken;
  }

  async revokeToken(token: string): Promise<void> {
    this.tokens.delete(token);
  }

  // Helper methods for testing
  clear(): void {
    this.tokens.clear();
  }

  getAllTokens(): Map<string, AuthToken> {
    return new Map(this.tokens);
  }
}

export class MockContextShareStore {
  private shares: Map<string, ContextShare> = new Map();

  async createShare(
    shareData: Omit<ContextShare, 'id' | 'createdAt'>
  ): Promise<ContextShare> {
    const share: ContextShare = {
      ...shareData,
      id: `share-${Date.now()}-${Math.random()}`,
      createdAt: new Date(),
    };

    this.shares.set(share.id, share);
    return share;
  }

  async getSharesForAgent(agentId: string): Promise<ContextShare[]> {
    return Array.from(this.shares.values()).filter(
      (share) =>
        share.sourceAgentId === agentId || share.targetAgentId === agentId
    );
  }

  async getSharedContexts(agentId: string): Promise<ContextShare[]> {
    return Array.from(this.shares.values()).filter(
      (share) => share.targetAgentId === agentId
    );
  }

  async revokeShare(shareId: string): Promise<void> {
    this.shares.delete(shareId);
  }

  async updateShare(
    shareId: string,
    updates: Partial<ContextShare>
  ): Promise<ContextShare> {
    const existingShare = this.shares.get(shareId);
    if (!existingShare) {
      throw new Error(`Share not found: ${shareId}`);
    }

    const updatedShare = { ...existingShare, ...updates };
    this.shares.set(shareId, updatedShare);
    return updatedShare;
  }

  // Helper methods for testing
  clear(): void {
    this.shares.clear();
  }

  getAllShares(): Map<string, ContextShare> {
    return new Map(this.shares);
  }
}

export class MockContextMetadataStore {
  private metadata: Map<string, CoreContextMetadata[]> = new Map();

  async setMetadata(metadataData: Omit<CoreContextMetadata, 'id' | 'createdAt' | 'updatedAt'>): Promise<CoreContextMetadata> {
    const metadata: CoreContextMetadata = {
      ...metadataData,
      id: {
        value: `metadata-${Date.now()}-${Math.random()}`,
        type: 'agent'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const agentMetadata = this.metadata.get(metadata.agentId?.value || 'unknown') || [];
    agentMetadata.push(metadata);
    this.metadata.set(metadata.agentId?.value || 'unknown', agentMetadata);
    
    return metadata;
  }

  async getMetadata(agentId: string, key?: string): Promise<CoreContextMetadata[]> {
    const agentMetadata = this.metadata.get(agentId) || [];
    if (key) {
      return agentMetadata.filter(meta => meta.name === key);
    }
    return [...agentMetadata];
  }

  async updateMetadata(agentId: string, key: string, value: any): Promise<CoreContextMetadata> {
    const agentMetadata = this.metadata.get(agentId) || [];
    const existingIndex = agentMetadata.findIndex(meta => meta.name === key);
    
    if (existingIndex === -1) {
      throw new Error(`Metadata not found for key: ${key}`);
    }
    
    const updatedMetadata = {
      ...agentMetadata[existingIndex],
      description: typeof value === 'string' ? value : JSON.stringify(value),
      updatedAt: new Date(),
    };
    
    agentMetadata[existingIndex] = updatedMetadata;
    this.metadata.set(agentId, agentMetadata);
    
    return updatedMetadata;
  }

  async deleteMetadata(agentId: string, key: string): Promise<void> {
    const agentMetadata = this.metadata.get(agentId) || [];
    const filteredMetadata = agentMetadata.filter(meta => meta.name !== key);
    this.metadata.set(agentId, filteredMetadata);
  }

  async queryMetadata(query: any): Promise<CoreContextMetadata[]> {
    let results: CoreContextMetadata[] = [];
    
    for (const agentMetadata of this.metadata.values()) {
      results.push(...agentMetadata);
    }
    
    // Apply filters
    if (query.agentId) {
      results = results.filter(meta => meta.agentId?.value === query.agentId);
    }
    if (query.contextType) {
      results = results.filter(meta => meta.tags?.includes(query.contextType));
    }
    if (query.visibility) {
      results = results.filter(meta => meta.permissions.public === (query.visibility === 'public'));
    }
    if (query.keyPattern) {
      const regex = new RegExp(query.keyPattern);
      results = results.filter(meta => regex.test(meta.name));
    }
    
    // Apply pagination
    if (query.offset) {
      results = results.slice(query.offset);
    }
    if (query.limit) {
      results = results.slice(0, query.limit);
    }
    
    return results;
  }

  async cleanupExpired(): Promise<void> {
    const now = new Date();
    
    for (const [agentId, agentMetadata] of this.metadata.entries()) {
      const validMetadata = agentMetadata.filter(meta => 
        !meta.expiresAt || meta.expiresAt > now
      );
      this.metadata.set(agentId, validMetadata);
    }
  }

  // Helper methods for testing
  clear(): void {
    this.metadata.clear();
  }

  getAllMetadata(): Map<string, CoreContextMetadata[]> {
    return new Map(this.metadata);
  }
}

  async getMetadata(agentId: string, key?: string): Promise<ContextMetadata[]> {
    const agentMetadata = this.metadata.get(agentId) || [];
    if (key) {
      return agentMetadata.filter((meta) => meta.contextKey === key);
    }
    return [...agentMetadata];
  }

  async updateMetadata(
    agentId: string,
    key: string,
    value: any
  ): Promise<ContextMetadata> {
    const agentMetadata = this.metadata.get(agentId) || [];
    const existingIndex = agentMetadata.findIndex(
      (meta) => meta.contextKey === key
    );

    if (existingIndex === -1) {
      throw new Error(`Metadata not found for key: ${key}`);
    }

    const updatedMetadata = {
      ...agentMetadata[existingIndex],
      contextValue: value,
      updatedAt: new Date(),
    };

    agentMetadata[existingIndex] = updatedMetadata;
    this.metadata.set(agentId, agentMetadata);

    return updatedMetadata;
  }

  async deleteMetadata(agentId: string, key: string): Promise<void> {
    const agentMetadata = this.metadata.get(agentId) || [];
    const filteredMetadata = agentMetadata.filter(
      (meta) => meta.contextKey !== key
    );
    this.metadata.set(agentId, filteredMetadata);
  }

  async queryMetadata(query: any): Promise<ContextMetadata[]> {
    let results: ContextMetadata[] = [];

    for (const agentMetadata of this.metadata.values()) {
      results.push(...agentMetadata);
    }

    // Apply filters
    if (query.agentId) {
      results = results.filter((meta) => meta.agentId === query.agentId);
    }
    if (query.contextType) {
      results = results.filter(
        (meta) => meta.contextType === query.contextType
      );
    }
    if (query.visibility) {
      results = results.filter((meta) => meta.visibility === query.visibility);
    }
    if (query.keyPattern) {
      const regex = new RegExp(query.keyPattern);
      results = results.filter((meta) => regex.test(meta.contextKey));
    }

    // Apply pagination
    if (query.offset) {
      results = results.slice(query.offset);
    }
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  async cleanupExpired(): Promise<void> {
    const now = new Date();

    for (const [agentId, agentMetadata] of this.metadata.entries()) {
      const validMetadata = agentMetadata.filter(
        (meta) => !meta.expiresAt || meta.expiresAt > now
      );
      this.metadata.set(agentId, validMetadata);
    }
  }

  // Helper methods for testing
  clear(): void {
    this.metadata.clear();
  }

  getAllMetadata(): Map<string, ContextMetadata[]> {
    return new Map(this.metadata);
  }
}
