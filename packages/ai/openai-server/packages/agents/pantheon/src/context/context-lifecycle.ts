/**
 * Context Lifecycle Manager
 * Migrated from agent-context package with unified type system integration
 */

import type {
  AgentContext,
  ContextManager,
  ContextStatistics,
  EventStore,
  SnapshotStore,
  ContextShareStore,
  ContextMetadataStore,
  ContextEvent,
  ContextSnapshot,
  ContextShare,
  ContextMetadata as CoreContextMetadata
} from './types.js';
import { SecurityValidator, SecurityLogger } from './security.js';

export type ContextExportData = {
  context: AgentContext;
  events: ContextEvent[];
  snapshots: ContextSnapshot[];
  metadata: CoreContextMetadata[];
  shares: ContextShare[];
};

export type SystemStatistics = {
  totalContexts: number;
  totalEvents: number;
  totalSnapshots: number;
  totalShares: number;
  activeContexts: number;
};

export type ContextValidationResult = {
  isValid: boolean;
  issues: string[];
};

export type ContextInitialState = Record<string, unknown>;

export interface IContextLifecycleManager {
  createContext(agentId: string, initialState?: ContextInitialState): Promise<AgentContext>;
  archiveContext(agentId: string): Promise<void>;
  deleteContext(agentId: string): Promise<void>;
  cleanupExpiredContexts(): Promise<void>;
  getContextStatistics(agentId: string): Promise<ContextStatistics>;
  getSystemStatistics(): Promise<SystemStatistics>;
  exportContext(agentId: string): Promise<ContextExportData>;
  importContext(agentId: string, exportData: ContextExportData): Promise<void>;
  validateContextIntegrity(agentId: string): Promise<ContextValidationResult>;
}

export type ContextLifecycleConfig = {
  contextManager: ContextManager;
  eventStore: EventStore;
  snapshotStore: SnapshotStore;
  shareStore?: ContextShareStore;
  metadataStore?: ContextMetadataStore;
};

export class ContextLifecycleManager implements IContextLifecycleManager {
  private readonly contextManager: ContextManager;
  private readonly eventStore: EventStore;
  private readonly snapshotStore: SnapshotStore;
  private readonly shareStore?: ContextShareStore;
  private readonly metadataStore?: ContextMetadataStore;

  constructor(config: ContextLifecycleConfig) {
    this.contextManager = config.contextManager;
    this.eventStore = config.eventStore;
    this.snapshotStore = config.snapshotStore;
    this.shareStore = config.shareStore;
    this.metadataStore = config.metadataStore;
  }

  async createContext(agentId: string, initialState?: ContextInitialState): Promise<AgentContext> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      
      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'createContext',
        details: { hasInitialState: !!initialState }
      });

      // Create initial context with provided state
      const context = await this.contextManager.getContext(validatedAgentId);

      if (initialState && Object.keys(initialState).length > 0) {
        const sanitizedInitialState = SecurityValidator.sanitizeObject(initialState);
        return await this.contextManager.updateContext(validatedAgentId, {
          state: sanitizedInitialState,
        });
      }

      return context;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'createContext',
        details: { 
          hasInitialState: !!initialState,
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      });
      throw error;
    }
  }

  async archiveContext(agentId: string): Promise<void> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'archiveContext',
        details: { initiated: true }
      });

      // Check if context exists by looking for events or snapshots
      const events = await this.eventStore.getEvents(validatedAgentId);
      const latestSnapshot = await this.snapshotStore.getLatestSnapshot(validatedAgentId);

      // If no events and no snapshots, context doesn't exist - return silently
      if (events.length === 0 && !latestSnapshot) {
        SecurityLogger.log({
          type: 'data_access',
          severity: 'low',
          agentId: validatedAgentId,
          action: 'archiveContext',
          details: { reason: 'Context does not exist' }
        });
        return;
      }

      // Create a final snapshot before archiving
      await this.contextManager.createSnapshot(validatedAgentId);

      // Add archive event
      await this.contextManager.appendEvent({
        type: 'context_archived',
        agentId: validatedAgentId,
        data: {
          archivedAt: new Date(),
          archivedBy: 'system',
        },
      });

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'archiveContext',
        details: { completed: true }
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'archiveContext',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async deleteContext(agentId: string): Promise<void> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId: validatedAgentId,
        action: 'deleteContext',
        details: { initiated: true }
      });

      // Check if context exists by looking for events or snapshots
      const events = await this.eventStore.getEvents(validatedAgentId);
      const latestSnapshot = await this.snapshotStore.getLatestSnapshot(validatedAgentId);

      // If no events and no snapshots, context doesn't exist - return silently
      if (events.length === 0 && !latestSnapshot) {
        SecurityLogger.log({
          type: 'data_access',
          severity: 'low',
          agentId: validatedAgentId,
          action: 'deleteContext',
          details: { reason: 'Context does not exist' }
        });
        return;
      }

      // First archive context
      await this.archiveContext(validatedAgentId);

      // Then perform soft delete by creating a deletion event
      await this.contextManager.appendEvent({
        type: 'context_deleted',
        agentId: validatedAgentId,
        data: {
          deletedAt: new Date(),
          deletedBy: 'system',
        },
      });

      // Clean up metadata
      if (this.metadataStore) {
        try {
          const metadata = await this.metadataStore.getMetadata(validatedAgentId);
          for (const meta of metadata) {
            await this.metadataStore.deleteMetadata(validatedAgentId, meta.name);
          }
        } catch (error) {
          SecurityLogger.log({
            type: 'data_access',
            severity: 'medium',
            agentId: validatedAgentId,
            action: 'deleteContext',
            details: { 
              step: 'cleanup_metadata',
              error: error instanceof Error ? error.message : 'Unknown error' 
            }
          });
        }
      }

      // Clean up shares
      if (this.shareStore) {
        try {
          const shares = await this.shareStore.getSharesForAgent(validatedAgentId);
          for (const share of shares) {
            await this.shareStore.revokeShare(share.id);
          }
        } catch (error) {
          SecurityLogger.log({
            type: 'data_access',
            severity: 'medium',
            agentId: validatedAgentId,
            action: 'deleteContext',
            details: { 
              step: 'cleanup_shares',
              error: error instanceof Error ? error.message : 'Unknown error' 
            }
          });
        }
      }

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'deleteContext',
        details: { completed: true }
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId,
        action: 'deleteContext',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async cleanupExpiredContexts(): Promise<void> {
    try {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        action: 'cleanupExpiredContexts',
        details: { initiated: true }
      });

      if (!this.metadataStore) {
        SecurityLogger.log({
          type: 'data_access',
          severity: 'low',
          action: 'cleanupExpiredContexts',
          details: { reason: 'No metadata store configured' }
        });
        return;
      }

      // Use metadata store's built-in cleanup method
      await this.metadataStore.cleanupExpired();

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        action: 'cleanupExpiredContexts',
        details: { completed: true }
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        action: 'cleanupExpiredContexts',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async getContextStatistics(agentId: string): Promise<ContextStatistics> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      const context = await this.contextManager.getContext(validatedAgentId);
      const events = await this.eventStore.getEvents(validatedAgentId);
      const snapshots = await this.snapshotStore.getLatestSnapshot(validatedAgentId);

      let totalShares = 0;
      let activeShares = 0;

      if (this.shareStore) {
        try {
          const shares = await this.shareStore.getSharesForAgent(validatedAgentId);
          totalShares = shares.length;

          const now = new Date();
          activeShares = shares.filter((share) => !share.expiresAt || share.expiresAt > now).length;
        } catch (error) {
          SecurityLogger.log({
            type: 'data_access',
            severity: 'medium',
            agentId: validatedAgentId,
            action: 'getContextStatistics',
            details: { 
              step: 'share_stats',
              error: error instanceof Error ? error.message : 'Unknown error' 
            }
          });
        }
      }

      // Calculate context size (rough estimate based on state size)
      const contextSize = JSON.stringify(context.state).length;

      const stats = {
        totalEvents: events.length,
        totalSnapshots: snapshots ? 1 : 0,
        totalShares,
        lastActivity: context.updatedAt,
        contextSize,
        activeShares,
      };

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'getContextStatistics',
        details: stats
      });

      return stats;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getContextStatistics',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async getSystemStatistics(): Promise<SystemStatistics> {
    try {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        action: 'getSystemStatistics',
        details: { initiated: true }
      });

      // This would require iterating over all agents
      // For now, return placeholder values
      const stats = {
        totalContexts: 0,
        totalEvents: 0,
        totalSnapshots: 0,
        totalShares: 0,
        activeContexts: 0,
      };

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        action: 'getSystemStatistics',
        details: stats
      });

      return stats;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        action: 'getSystemStatistics',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async exportContext(agentId: string): Promise<ContextExportData> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'exportContext',
        details: { initiated: true }
      });

      const context = await this.contextManager.getContext(validatedAgentId);
      const events = await this.eventStore.getEvents(validatedAgentId);
      const latestSnapshot = await this.snapshotStore.getLatestSnapshot(validatedAgentId);
      const snapshots = latestSnapshot ? [latestSnapshot] : [];

      let metadata: CoreContextMetadata[] = [];
      let shares: ContextShare[] = [];

      if (this.metadataStore) {
        try {
          metadata = await this.metadataStore.getMetadata(validatedAgentId);
        } catch (error) {
          SecurityLogger.log({
            type: 'data_access',
            severity: 'medium',
            agentId: validatedAgentId,
            action: 'exportContext',
            details: { 
              step: 'export_metadata',
              error: error instanceof Error ? error.message : 'Unknown error' 
            }
          });
        }
      }

      if (this.shareStore) {
        try {
          shares = await this.shareStore.getSharesForAgent(validatedAgentId);
        } catch (error) {
          SecurityLogger.log({
            type: 'data_access',
            severity: 'medium',
            agentId: validatedAgentId,
            action: 'exportContext',
            details: { 
              step: 'export_shares',
              error: error instanceof Error ? error.message : 'Unknown error' 
            }
          });
        }
      }

      const exportData = {
        context,
        events,
        snapshots,
        metadata,
        shares,
      };

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'exportContext',
        details: { 
          eventsCount: events.length,
          snapshotsCount: snapshots.length,
          metadataCount: metadata.length,
          sharesCount: shares.length
        }
      });

      return exportData;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'exportContext',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async importContext(agentId: string, exportData: ContextExportData): Promise<void> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId: validatedAgentId,
        action: 'importContext',
        details: { 
          eventsCount: exportData.events.length,
          snapshotsCount: exportData.snapshots.length,
          metadataCount: exportData.metadata.length,
          sharesCount: exportData.shares.length
        }
      });

      // Import context state
      await this.contextManager.updateContext(validatedAgentId, {
        state: SecurityValidator.sanitizeObject(exportData.context.state),
      });

      // Import events
      for (const event of exportData.events) {
        try {
          await this.eventStore.appendEvent(event);
        } catch (error) {
          SecurityLogger.log({
            type: 'data_access',
            severity: 'medium',
            agentId: validatedAgentId,
            action: 'importContext',
            details: { 
              step: 'import_event',
              eventId: event.id,
              error: error instanceof Error ? error.message : 'Unknown error' 
            }
          });
        }
      }

      // Import snapshots
      for (const snapshot of exportData.snapshots) {
        try {
          await this.snapshotStore.saveSnapshot(snapshot);
        } catch (error) {
          SecurityLogger.log({
            type: 'data_access',
            severity: 'medium',
            agentId: validatedAgentId,
            action: 'importContext',
            details: { 
              step: 'import_snapshot',
              snapshotId: snapshot.id,
              error: error instanceof Error ? error.message : 'Unknown error' 
            }
          });
        }
      }

      // Import metadata
      if (this.metadataStore) {
        for (const metadata of exportData.metadata) {
          try {
            await this.metadataStore.setMetadata({
              id: metadata.id,
              agentId: validatedAgentId,
              name: metadata.name,
              description: metadata.description,
              createdAt: metadata.createdAt,
              updatedAt: metadata.updatedAt,
              expiresAt: metadata.expiresAt,
              tags: metadata.tags,
              permissions: metadata.permissions
            });
          } catch (error) {
            SecurityLogger.log({
              type: 'data_access',
              severity: 'medium',
              agentId: validatedAgentId,
              action: 'importContext',
              details: { 
                step: 'import_metadata',
                metadataId: metadata.id.value,
                error: error instanceof Error ? error.message : 'Unknown error' 
              }
            });
          }
        }
      }

      // Import shares
      if (this.shareStore) {
        for (const share of exportData.shares) {
          try {
            await this.shareStore.createShare(share);
          } catch (error) {
            SecurityLogger.log({
              type: 'data_access',
              severity: 'medium',
              agentId: validatedAgentId,
              action: 'importContext',
              details: { 
                step: 'import_share',
                shareId: share.id,
                error: error instanceof Error ? error.message : 'Unknown error' 
              }
            });
          }
        }
      }

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'importContext',
        details: { completed: true }
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId,
        action: 'importContext',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  private validateContextExistence(
    events: ContextEvent[],
    latestSnapshot: ContextSnapshot | null,
  ): string[] {
    const issues: string[] = [];

    if (events.length === 0 && !latestSnapshot) {
      issues.push('Context does not exist - no events or snapshots found');
    }

    return issues;
  }

  private validateVersionConsistency(
    context: AgentContext,
    events: ContextEvent[],
    latestSnapshot: ContextSnapshot | null,
  ): string[] {
    const issues: string[] = [];

    if (latestSnapshot) {
      const eventsSinceSnapshot = events.filter((event) => {
        if (!event.data || typeof event.data !== 'object') {
          return false;
        }
        const eventData = event.data as { version?: number };
        return eventData.version && eventData.version > latestSnapshot.version;
      });
      const expectedVersion = latestSnapshot.version + eventsSinceSnapshot.length;

      if (context.version !== expectedVersion) {
        issues.push(
          `Context version mismatch: expected ${expectedVersion}, got ${context.version}`,
        );
      }

      // Check snapshot integrity
      if (
        latestSnapshot.state &&
        typeof latestSnapshot.state === 'object' &&
        Object.keys(latestSnapshot.state).length === 0
      ) {
        issues.push('Snapshot state is empty');
      }
    } else {
      // No snapshot, version should match events count
      if (context.version !== events.length) {
        issues.push(`Context version mismatch: expected ${events.length}, got ${context.version}`);
      }
    }

    return issues;
  }

  private validateEventIntegrity(events: ContextEvent[]): string[] {
    const issues: string[] = [];

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

    return issues;
  }

  async validateContextIntegrity(agentId: string): Promise<ContextValidationResult> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const issues: string[] = [];

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'validateContextIntegrity',
        details: { initiated: true }
      });

      const context = await this.contextManager.getContext(validatedAgentId);
      const events = await this.eventStore.getEvents(validatedAgentId);
      const latestSnapshot = await this.snapshotStore.getLatestSnapshot(validatedAgentId);

      // Check if context exists at all
      issues.push(...this.validateContextExistence(events, latestSnapshot));

      const existenceIssues = issues.filter((issue) =>
        issue.includes('Context does not exist - no events or snapshots found'),
      );
      if (existenceIssues.length > 0) {
        return {
          isValid: false,
          issues,
        };
      }

      // Check version consistency
      issues.push(...this.validateVersionConsistency(context, events, latestSnapshot));

      // Check event integrity
      issues.push(...this.validateEventIntegrity(events));

      const result = {
        isValid: issues.length === 0,
        issues,
      };

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'validateContextIntegrity',
        details: { 
          isValid: result.isValid,
          issuesCount: issues.length
        }
      });

      return result;
    } catch (error) {
      const issues = [
        `Error during validation: ${error instanceof Error ? error.message : String(error)}`,
      ];

      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'validateContextIntegrity',
        details: { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      });

      return {
        isValid: false,
        issues,
      };
    }
  }
}

export default ContextLifecycleManager;