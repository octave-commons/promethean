import {
  EventStore,
  SnapshotStore,
  ContextShareStore,
  ContextMetadataStore,
  ContextEvent,
  ContextSnapshot,
  ContextShare,
  ContextMetadata,
  ContextQuery,
} from '../../types';

export class MockEventStore implements EventStore {
  private events: Map<string, ContextEvent[]> = new Map();
  private eventIndex: Map<string, ContextEvent> = new Map();

  async appendEvent(event: ContextEvent): Promise<void> {
    const agentEvents = this.events.get(event.agentId) || [];
    agentEvents.push(event);
    this.events.set(event.agentId, agentEvents);
    this.eventIndex.set(event.id, event);
  }

  async getEvents(agentId: string, fromVersion?: number): Promise<ContextEvent[]> {
    const agentEvents = this.events.get(agentId) || [];
    if (fromVersion !== undefined) {
      return agentEvents.filter((event) => event.data.version >= fromVersion);
    }
    return agentEvents;
  }

  async getEvent(eventId: string): Promise<ContextEvent | null> {
    return this.eventIndex.get(eventId) || null;
  }

  // Helper methods for testing
  clear(): void {
    this.events.clear();
    this.eventIndex.clear();
  }

  getEventCount(agentId: string): number {
    return (this.events.get(agentId) || []).length;
  }
}

export class MockSnapshotStore implements SnapshotStore {
  private snapshots: Map<string, ContextSnapshot[]> = new Map();
  private snapshotIndex: Map<string, ContextSnapshot> = new Map();

  async saveSnapshot(snapshot: ContextSnapshot): Promise<void> {
    const agentSnapshots = this.snapshots.get(snapshot.agentId) || [];
    agentSnapshots.push(snapshot);
    this.snapshots.set(snapshot.agentId, agentSnapshots);
    this.snapshotIndex.set(snapshot.id, snapshot);
  }

  async getLatestSnapshot(agentId: string): Promise<ContextSnapshot | null> {
    const agentSnapshots = this.snapshots.get(agentId) || [];
    if (agentSnapshots.length === 0) return null;

    // Return the snapshot with the highest version
    return agentSnapshots.reduce((latest, current) =>
      current.version > latest.version ? current : latest,
    );
  }

  async getSnapshot(snapshotId: string): Promise<ContextSnapshot | null> {
    return this.snapshotIndex.get(snapshotId) || null;
  }

  // Helper methods for testing
  clear(): void {
    this.snapshots.clear();
    this.snapshotIndex.clear();
  }

  getSnapshotCount(agentId: string): number {
    return (this.snapshots.get(agentId) || []).length;
  }
}

export class MockAuthService {
  private tokens: Map<string, any> = new Map();
  private revokedTokens: Set<string> = new Set();

  async generateToken(agentId: string, permissions: string[]): Promise<any> {
    const token = {
      token: `mock-jwt-${agentId}-${Date.now()}`,
      agentId,
      expiresAt: new Date(Date.now() + 3600000),
      permissions,
    };

    this.tokens.set(token.token, token);
    return token;
  }

  async validateToken(token: string): Promise<any | null> {
    if (this.revokedTokens.has(token)) {
      return null;
    }

    const tokenData = this.tokens.get(token);
    if (!tokenData) {
      return null;
    }

    // Check if expired
    if (tokenData.expiresAt < new Date()) {
      return null;
    }

    return tokenData;
  }

  async revokeToken(token: string): Promise<void> {
    this.revokedTokens.add(token);
  }

  // Helper methods for testing
  clear(): void {
    this.tokens.clear();
    this.revokedTokens.clear();
  }

  getTokenCount(): number {
    return this.tokens.size;
  }

  getRevokedCount(): number {
    return this.revokedTokens.size;
  }
}

export class MockShareStore implements ContextShareStore {
  private shares: Map<string, ContextShare> = new Map();
  private agentShares: Map<string, Set<string>> = new Map(); // agentId -> Set of shareIds

  async createShare(share: Omit<ContextShare, 'id' | 'createdAt'>): Promise<ContextShare> {
    const newShare: ContextShare = {
      ...share,
      id: `share-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date(),
    };

    this.shares.set(newShare.id, newShare);

    // Track shares for both source and target agents
    const sourceShares = this.agentShares.get(newShare.sourceAgentId) || new Set();
    sourceShares.add(newShare.id);
    this.agentShares.set(newShare.sourceAgentId, sourceShares);

    const targetShares = this.agentShares.get(newShare.targetAgentId) || new Set();
    targetShares.add(newShare.id);
    this.agentShares.set(newShare.targetAgentId, targetShares);

    return newShare;
  }

  async getSharesForAgent(agentId: string): Promise<ContextShare[]> {
    // Return shares where this agent is the source (created shares)
    const shareIds = this.agentShares.get(agentId) || new Set();
    return Array.from(shareIds)
      .map((id) => this.shares.get(id))
      .filter(
        (share): share is ContextShare => share !== undefined && share.sourceAgentId === agentId,
      )
      .sort((a, b) => {
        // Sort by permission level (admin > write > read) then by creation time
        const permissionLevels = { read: 1, write: 2, admin: 3 };
        const levelDiff = permissionLevels[b.shareType] - permissionLevels[a.shareType];
        if (levelDiff !== 0) return levelDiff;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }

  async getSharedContexts(agentId: string): Promise<ContextShare[]> {
    // Return shares where this agent is the target (received shares)
    const shareIds = this.agentShares.get(agentId) || new Set();
    return Array.from(shareIds)
      .map((id) => this.shares.get(id))
      .filter(
        (share): share is ContextShare => share !== undefined && share.targetAgentId === agentId,
      )
      .sort((a, b) => {
        // Sort by permission level (admin > write > read) then by creation time
        const permissionLevels = { read: 1, write: 2, admin: 3 };
        const levelDiff = permissionLevels[b.shareType] - permissionLevels[a.shareType];
        if (levelDiff !== 0) return levelDiff;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }

  async revokeShare(shareId: string): Promise<void> {
    const share = this.shares.get(shareId);
    if (!share) return;

    this.shares.delete(shareId);

    // Remove from both agents' share tracking
    const sourceShares = this.agentShares.get(share.sourceAgentId);
    if (sourceShares) {
      sourceShares.delete(shareId);
      if (sourceShares.size === 0) {
        this.agentShares.delete(share.sourceAgentId);
      }
    }

    const targetShares = this.agentShares.get(share.targetAgentId);
    if (targetShares) {
      targetShares.delete(shareId);
      if (targetShares.size === 0) {
        this.agentShares.delete(share.targetAgentId);
      }
    }
  }

  async updateShare(shareId: string, updates: Partial<ContextShare>): Promise<ContextShare> {
    const share = this.shares.get(shareId);
    if (!share) {
      throw new Error(`Share with ID ${shareId} not found`);
    }

    const updatedShare: ContextShare = {
      ...share,
      ...updates,
    };

    this.shares.set(shareId, updatedShare);
    return updatedShare;
  }

  // Helper methods for testing
  clear(): void {
    this.shares.clear();
    this.agentShares.clear();
  }

  getShareCount(): number {
    return this.shares.size;
  }

  getShareCountByAgent(agentId: string): number {
    return (this.agentShares.get(agentId) || new Set()).size;
  }
}

export class MockMetadataStore implements ContextMetadataStore {
  private metadata: Map<string, ContextMetadata[]> = new Map(); // agentId -> metadata array

  async setMetadata(
    metadata: Omit<ContextMetadata, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ContextMetadata> {
    const newMetadata: ContextMetadata = {
      ...metadata,
      id: `metadata-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const agentMetadata = this.metadata.get(newMetadata.agentId) || [];
    // Remove existing metadata with same key if it exists
    const filteredMetadata = agentMetadata.filter(
      (meta) => meta.contextKey !== newMetadata.contextKey,
    );
    filteredMetadata.push(newMetadata);
    this.metadata.set(newMetadata.agentId, filteredMetadata);

    return newMetadata;
  }

  async getMetadata(agentId: string, key?: string): Promise<ContextMetadata[]> {
    const agentMetadata = this.metadata.get(agentId) || [];
    if (key) {
      return agentMetadata.filter((meta) => meta.contextKey === key);
    }
    return agentMetadata;
  }

  async updateMetadata(agentId: string, key: string, value: any): Promise<ContextMetadata> {
    const agentMetadata = this.metadata.get(agentId) || [];
    const existingIndex = agentMetadata.findIndex((meta) => meta.contextKey === key);

    if (existingIndex === -1) {
      throw new Error(`Metadata with key ${key} not found for agent ${agentId}`);
    }

    const existingMetadata = agentMetadata[existingIndex];
    if (!existingMetadata) {
      throw new Error(`Metadata with key ${key} not found for agent ${agentId}`);
    }

    // Ensure updatedAt is always greater than createdAt by at least 1ms
    const now = new Date();
    const updatedAt =
      existingMetadata.createdAt >= now ? new Date(existingMetadata.createdAt.getTime() + 1) : now;

    const updatedMetadata: ContextMetadata = {
      id: existingMetadata.id,
      agentId: existingMetadata.agentId,
      contextKey: existingMetadata.contextKey,
      contextValue: value,
      contextType: existingMetadata.contextType,
      visibility: existingMetadata.visibility,
      expiresAt: existingMetadata.expiresAt,
      createdAt: existingMetadata.createdAt,
      updatedAt,
    };

    agentMetadata[existingIndex] = updatedMetadata;
    this.metadata.set(agentId, agentMetadata);

    return updatedMetadata;
  }

  async deleteMetadata(agentId: string, key: string): Promise<void> {
    const agentMetadata = this.metadata.get(agentId) || [];
    const filteredMetadata = agentMetadata.filter((meta) => meta.contextKey !== key);
    this.metadata.set(agentId, filteredMetadata);
  }

  async queryMetadata(query: ContextQuery): Promise<ContextMetadata[]> {
    let results: ContextMetadata[] = [];

    // Collect metadata from all agents or specific agent
    if (query.agentId) {
      results = this.metadata.get(query.agentId) || [];
    } else {
      // Get all metadata from all agents
      for (const agentMetadata of this.metadata.values()) {
        results.push(...agentMetadata);
      }
    }

    // Filter out expired metadata (like the Postgres implementation)
    const now = new Date();
    results = results.filter((meta) => !meta.expiresAt || meta.expiresAt > now);

    // Apply filters
    if (query.contextType) {
      results = results.filter((meta) => meta.contextType === query.contextType);
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
      const validMetadata = agentMetadata.filter((meta) => !meta.expiresAt || meta.expiresAt > now);
      this.metadata.set(agentId, validMetadata);
    }
  }

  // Helper methods for testing
  clear(): void {
    this.metadata.clear();
  }

  getMetadataCount(): number {
    let count = 0;
    for (const agentMetadata of this.metadata.values()) {
      count += agentMetadata.length;
    }
    return count;
  }

  getMetadataCountByAgent(agentId: string): number {
    return (this.metadata.get(agentId) || []).length;
  }

  // Get all metadata without expiration filtering (for testing cleanup)
  getAllMetadataRaw(): ContextMetadata[] {
    const allMetadata: ContextMetadata[] = [];
    for (const agentMetadata of this.metadata.values()) {
      allMetadata.push(...agentMetadata);
    }
    return allMetadata;
  }
}
