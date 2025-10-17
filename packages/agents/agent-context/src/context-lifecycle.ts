import {
  AgentContext,
  ContextManager,
  ContextStatistics,
  EventStore,
  SnapshotStore,
  ContextShareStore,
  ContextMetadataStore,
} from './types';

export interface IContextLifecycleManager {
  createContext(agentId: string, initialState?: any): Promise<AgentContext>;
  archiveContext(agentId: string): Promise<void>;
  deleteContext(agentId: string): Promise<void>;
  cleanupExpiredContexts(): Promise<void>;
  getContextStatistics(agentId: string): Promise<ContextStatistics>;
  getSystemStatistics(): Promise<{
    totalContexts: number;
    totalEvents: number;
    totalSnapshots: number;
    totalShares: number;
    activeContexts: number;
  }>;
  exportContext(agentId: string): Promise<{
    context: AgentContext;
    events: any[];
    snapshots: any[];
    metadata: any[];
    shares: any[];
  }>;
  importContext(agentId: string, exportData: any): Promise<void>;
  validateContextIntegrity(agentId: string): Promise<{
    isValid: boolean;
    issues: string[];
  }>;
}

export class ContextLifecycleManager implements IContextLifecycleManager {
  constructor(
    private contextManager: ContextManager,
    private eventStore: EventStore,
    private snapshotStore: SnapshotStore,
    private shareStore?: ContextShareStore,
    private metadataStore?: ContextMetadataStore,
  ) {}

  async createContext(agentId: string, initialState?: any): Promise<AgentContext> {
    // Create initial context with provided state
    const context = await this.contextManager.getContext(agentId);

    if (initialState && Object.keys(initialState).length > 0) {
      return await this.contextManager.updateContext(agentId, {
        state: initialState,
      });
    }

    return context;
  }

  async archiveContext(agentId: string): Promise<void> {
    // Check if context exists by looking for events or snapshots
    const events = await this.eventStore.getEvents(agentId);
    const latestSnapshot = await this.snapshotStore.getLatestSnapshot(agentId);

    // If no events and no snapshots, context doesn't exist - return silently
    if (events.length === 0 && !latestSnapshot) {
      return;
    }

    // Create a final snapshot before archiving
    await this.contextManager.createSnapshot(agentId);

    // Add archive event
    await this.contextManager.appendEvent({
      type: 'context_archived',
      agentId,
      data: {
        archivedAt: new Date(),
        archivedBy: 'system',
      },
    });
  }

  async deleteContext(agentId: string): Promise<void> {
    // Check if context exists by looking for events or snapshots
    const events = await this.eventStore.getEvents(agentId);
    const latestSnapshot = await this.snapshotStore.getLatestSnapshot(agentId);

    // If no events and no snapshots, context doesn't exist - return silently
    if (events.length === 0 && !latestSnapshot) {
      return;
    }

    // First archive the context
    await this.archiveContext(agentId);

    // Then perform soft delete by creating a deletion event
    await this.contextManager.appendEvent({
      type: 'context_deleted',
      agentId,
      data: {
        deletedAt: new Date(),
        deletedBy: 'system',
      },
    });

    // Clean up metadata
    if (this.metadataStore) {
      const metadata = await this.metadataStore.getMetadata(agentId);
      for (const meta of metadata) {
        await this.metadataStore.deleteMetadata(agentId, meta.contextKey);
      }
    }

    // Clean up shares
    if (this.shareStore) {
      const shares = await this.shareStore.getSharesForAgent(agentId);
      for (const share of shares) {
        await this.shareStore.revokeShare(share.id);
      }
    }
  }

  async cleanupExpiredContexts(): Promise<void> {
    if (!this.metadataStore) {
      return;
    }

    // Use the metadata store's built-in cleanup method
    await this.metadataStore.cleanupExpired();
  }

  async getContextStatistics(agentId: string): Promise<ContextStatistics> {
    const context = await this.contextManager.getContext(agentId);
    const events = await this.eventStore.getEvents(agentId);
    const snapshots = await this.snapshotStore.getLatestSnapshot(agentId);

    let totalShares = 0;
    let activeShares = 0;

    if (this.shareStore) {
      const shares = await this.shareStore.getSharesForAgent(agentId);
      totalShares = shares.length;

      const now = new Date();
      activeShares = shares.filter((share) => !share.expiresAt || share.expiresAt > now).length;
    }

    // Calculate context size (rough estimate based on state size)
    const contextSize = JSON.stringify(context.state).length;

    return {
      totalEvents: events.length,
      totalSnapshots: snapshots ? 1 : 0,
      totalShares,
      lastActivity: context.updatedAt,
      contextSize,
      activeShares,
    };
  }

  async getSystemStatistics(): Promise<{
    totalContexts: number;
    totalEvents: number;
    totalSnapshots: number;
    totalShares: number;
    activeContexts: number;
  }> {
    // This would require iterating over all agents
    // For now, return placeholder values
    return {
      totalContexts: 0,
      totalEvents: 0,
      totalSnapshots: 0,
      totalShares: 0,
      activeContexts: 0,
    };
  }

  async exportContext(agentId: string): Promise<{
    context: AgentContext;
    events: any[];
    snapshots: any[];
    metadata: any[];
    shares: any[];
  }> {
    const context = await this.contextManager.getContext(agentId);
    const events = await this.eventStore.getEvents(agentId);
    const latestSnapshot = await this.snapshotStore.getLatestSnapshot(agentId);
    const snapshots = latestSnapshot ? [latestSnapshot] : [];

    let metadata: any[] = [];
    let shares: any[] = [];

    if (this.metadataStore) {
      metadata = await this.metadataStore.getMetadata(agentId);
    }

    if (this.shareStore) {
      shares = await this.shareStore.getSharesForAgent(agentId);
    }

    return {
      context,
      events,
      snapshots,
      metadata,
      shares,
    };
  }

  async importContext(
    agentId: string,
    exportData: {
      context: AgentContext;
      events: any[];
      snapshots: any[];
      metadata: any[];
      shares: any[];
    },
  ): Promise<void> {
    // Import context state
    await this.contextManager.updateContext(agentId, {
      state: exportData.context.state,
    });

    // Import events
    for (const event of exportData.events) {
      await this.eventStore.appendEvent(event);
    }

    // Import snapshots
    for (const snapshot of exportData.snapshots) {
      await this.snapshotStore.saveSnapshot(snapshot);
    }

    // Import metadata
    if (this.metadataStore) {
      for (const metadata of exportData.metadata) {
        await this.metadataStore.setMetadata({
          agentId,
          contextKey: metadata.contextKey,
          contextValue: metadata.contextValue,
          contextType: metadata.contextType || 'imported',
          visibility: metadata.visibility || 'private',
          expiresAt: metadata.expiresAt,
        });
      }
    }

    // Import shares
    if (this.shareStore) {
      for (const share of exportData.shares) {
        await this.shareStore.createShare(share);
      }
    }
  }

  async validateContextIntegrity(agentId: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const context = await this.contextManager.getContext(agentId);
      const events = await this.eventStore.getEvents(agentId);
      const latestSnapshot = await this.snapshotStore.getLatestSnapshot(agentId);

      // Check if context exists at all
      if (events.length === 0 && !latestSnapshot) {
        issues.push('Context does not exist - no events or snapshots found');
        return {
          isValid: false,
          issues,
        };
      }

      // Check if context version matches events + snapshot version
      if (latestSnapshot) {
        const eventsSinceSnapshot = events.filter(
          (event) => event.data && event.data.version > latestSnapshot.version,
        );
        const expectedVersion = latestSnapshot.version + eventsSinceSnapshot.length;

        if (context.version !== expectedVersion) {
          issues.push(
            `Context version mismatch: expected ${expectedVersion}, got ${context.version}`,
          );
        }

        // Check snapshot integrity
        if (latestSnapshot.state && typeof latestSnapshot.state === 'object') {
          // Basic state validation
          if (Object.keys(latestSnapshot.state).length === 0) {
            issues.push('Snapshot state is empty');
          }
        }
      } else {
        // No snapshot, version should match events count
        if (context.version !== events.length) {
          issues.push(
            `Context version mismatch: expected ${events.length}, got ${context.version}`,
          );
        }
      }

      // Check for duplicate event IDs
      const eventIds = events.map((e) => e.id);
      const uniqueEventIds = new Set(eventIds);
      if (eventIds.length !== uniqueEventIds.size) {
        issues.push('Duplicate event IDs found');
      }

      // Check event order
      for (let i = 1; i < events.length; i++) {
        const currentEvent = events[i];
        const previousEvent = events[i - 1];
        if (currentEvent && previousEvent && currentEvent.timestamp < previousEvent.timestamp) {
          issues.push(`Event order violation at index ${i}`);
          break;
        }
      }
    } catch (error) {
      issues.push(`Error during validation: ${error}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}
