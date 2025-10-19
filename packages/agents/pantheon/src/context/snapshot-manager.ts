/**
 * Snapshot Manager implementations
 * Migrated from agent-context package
 */

import { v4 as uuidv4 } from 'uuid';
import type { ContextSnapshot, SnapshotStore } from './types.js';
import { SecurityValidator, SecurityLogger } from './security.js';

// In-memory snapshot store for testing and development
export class MemorySnapshotStore implements SnapshotStore {
  private snapshots: Map<string, ContextSnapshot> = new Map();
  private latestSnapshots: Map<string, string> = new Map(); // agentId -> snapshotId

  async saveSnapshot(snapshot: ContextSnapshot): Promise<void> {
    try {
      const validatedSnapshot = {
        ...snapshot,
        id: snapshot.id || uuidv4(),
        timestamp: snapshot.timestamp || new Date(),
        agentId: SecurityValidator.validateAgentId(snapshot.agentId),
        state: SecurityValidator.sanitizeObject(snapshot.state) as Record<
          string,
          unknown
        >,
      };

      this.snapshots.set(validatedSnapshot.id, validatedSnapshot);
      this.latestSnapshots.set(validatedSnapshot.agentId, validatedSnapshot.id);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedSnapshot.agentId,
        action: 'saveSnapshot',
        details: {
          snapshotId: validatedSnapshot.id,
          version: validatedSnapshot.version,
        },
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId: snapshot.agentId,
        action: 'saveSnapshot',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getLatestSnapshot(agentId: string): Promise<ContextSnapshot | null> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const latestSnapshotId = this.latestSnapshots.get(validatedAgentId);

      if (!latestSnapshotId) {
        return null;
      }

      return this.snapshots.get(latestSnapshotId) || null;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getLatestSnapshot',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getSnapshot(snapshotId: string): Promise<ContextSnapshot | null> {
    try {
      if (!snapshotId || typeof snapshotId !== 'string') {
        throw new Error('Snapshot ID must be a non-empty string');
      }

      return this.snapshots.get(snapshotId) || null;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        action: 'getSnapshot',
        details: {
          snapshotId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  // Additional utility methods
  async getSnapshotsForAgent(agentId: string): Promise<ContextSnapshot[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const agentSnapshots: ContextSnapshot[] = [];

      for (const snapshot of this.snapshots.values()) {
        if (snapshot.agentId === validatedAgentId) {
          agentSnapshots.push(snapshot);
        }
      }

      return agentSnapshots.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getSnapshotsForAgent',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getSnapshotsInVersionRange(
    agentId: string,
    fromVersion: number,
    toVersion: number
  ): Promise<ContextSnapshot[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const agentSnapshots = await this.getSnapshotsForAgent(validatedAgentId);

      return agentSnapshots.filter(
        (snapshot) =>
          snapshot.version >= fromVersion && snapshot.version <= toVersion
      );
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getSnapshotsInVersionRange',
        details: {
          fromVersion,
          toVersion,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async deleteSnapshot(snapshotId: string): Promise<void> {
    try {
      if (!snapshotId || typeof snapshotId !== 'string') {
        throw new Error('Snapshot ID must be a non-empty string');
      }

      const snapshot = this.snapshots.get(snapshotId);
      if (!snapshot) {
        throw new Error(`Snapshot not found: ${snapshotId}`);
      }

      this.snapshots.delete(snapshotId);

      // Update latest snapshot reference if needed
      const latestSnapshotId = this.latestSnapshots.get(snapshot.agentId);
      if (latestSnapshotId === snapshotId) {
        // Find the next most recent snapshot for this agent
        const agentSnapshots = await this.getSnapshotsForAgent(
          snapshot.agentId
        );
        if (agentSnapshots.length > 0) {
          this.latestSnapshots.set(
            snapshot.agentId,
            agentSnapshots[0]?.id || ''
          );
        } else {
          this.latestSnapshots.delete(snapshot.agentId);
        }
      }

      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId: snapshot.agentId,
        action: 'deleteSnapshot',
        details: { snapshotId },
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        action: 'deleteSnapshot',
        details: {
          snapshotId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async clearSnapshots(agentId: string): Promise<void> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      // Remove all snapshots for this agent
      for (const [snapshotId, snapshot] of this.snapshots.entries()) {
        if (snapshot.agentId === validatedAgentId) {
          this.snapshots.delete(snapshotId);
        }
      }

      this.latestSnapshots.delete(validatedAgentId);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId: validatedAgentId,
        action: 'clearSnapshots',
        details: { cleared: true },
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId,
        action: 'clearSnapshots',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  getStoreStats(): {
    totalSnapshots: number;
    totalAgents: number;
    snapshotsByAgent: Record<string, number>;
  } {
    const snapshotsByAgent: Record<string, number> = {};

    for (const snapshot of this.snapshots.values()) {
      snapshotsByAgent[snapshot.agentId] =
        (snapshotsByAgent[snapshot.agentId] || 0) + 1;
    }

    return {
      totalSnapshots: this.snapshots.size,
      totalAgents: this.latestSnapshots.size,
      snapshotsByAgent,
    };
  }
}

// PostgreSQL snapshot store for production use
export class PostgresSnapshotStore implements SnapshotStore {
  constructor(
    private pool: any, // PostgreSQL pool
    private tableName: string = 'context_snapshots'
  ) {}

  async saveSnapshot(snapshot: ContextSnapshot): Promise<void> {
    try {
      const validatedSnapshot = {
        ...snapshot,
        id: snapshot.id || uuidv4(),
        timestamp: snapshot.timestamp || new Date(),
        agentId: SecurityValidator.validateAgentId(snapshot.agentId),
        state: SecurityValidator.sanitizeObject(snapshot.state) as Record<
          string,
          unknown
        >,
      };

      const query = `
        INSERT INTO ${this.tableName} (id, agent_id, timestamp, state, version, event_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          timestamp = EXCLUDED.timestamp,
          state = EXCLUDED.state,
          version = EXCLUDED.version,
          event_id = EXCLUDED.event_id
      `;

      const values = [
        validatedSnapshot.id,
        validatedSnapshot.agentId,
        validatedSnapshot.timestamp,
        JSON.stringify(validatedSnapshot.state),
        validatedSnapshot.version,
        validatedSnapshot.eventId,
      ];

      await this.pool.query(query, values);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedSnapshot.agentId,
        action: 'saveSnapshot',
        details: {
          snapshotId: validatedSnapshot.id,
          version: validatedSnapshot.version,
        },
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId: snapshot.agentId,
        action: 'saveSnapshot',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getLatestSnapshot(agentId: string): Promise<ContextSnapshot | null> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      const query = `
        SELECT id, agent_id, timestamp, state, version, event_id
        FROM ${this.tableName}
        WHERE agent_id = $1
        ORDER BY version DESC, timestamp DESC
        LIMIT 1
      `;

      const result = await this.pool.query(query, [validatedAgentId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        agentId: row.agent_id,
        timestamp: new Date(row.timestamp),
        state: row.state,
        version: row.version,
        eventId: row.event_id,
      };
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getLatestSnapshot',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getSnapshot(snapshotId: string): Promise<ContextSnapshot | null> {
    try {
      if (!snapshotId || typeof snapshotId !== 'string') {
        throw new Error('Snapshot ID must be a non-empty string');
      }

      const query = `
        SELECT id, agent_id, timestamp, state, version, event_id
        FROM ${this.tableName}
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [snapshotId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        agentId: row.agent_id,
        timestamp: new Date(row.timestamp),
        state: row.state,
        version: row.version,
        eventId: row.event_id,
      };
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        action: 'getSnapshot',
        details: {
          snapshotId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  // Additional utility methods for PostgreSQL
  async getSnapshotsForAgent(agentId: string): Promise<ContextSnapshot[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      const query = `
        SELECT id, agent_id, timestamp, state, version, event_id
        FROM ${this.tableName}
        WHERE agent_id = $1
        ORDER BY version DESC, timestamp DESC
      `;

      const result = await this.pool.query(query, [validatedAgentId]);

      return result.rows.map((row: any) => ({
        id: row.id,
        agentId: row.agent_id,
        timestamp: new Date(row.timestamp),
        state: row.state,
        version: row.version,
        eventId: row.event_id,
      }));
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getSnapshotsForAgent',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async initializeTable(): Promise<void> {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          agent_id VARCHAR(255) NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          state JSONB NOT NULL,
          version INTEGER NOT NULL,
          event_id VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(agent_id, version)
        );

        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_agent_id ON ${this.tableName}(agent_id);
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_version ON ${this.tableName}(version);
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_timestamp ON ${this.tableName}(timestamp);
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_agent_version ON ${this.tableName}(agent_id, version);
      `;

      await this.pool.query(query);
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        action: 'initializeTable',
        details: {
          tableName: this.tableName,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }
}

export default {
  MemorySnapshotStore,
  PostgresSnapshotStore,
};
