/**
 * Context Share Store implementations
 * Migrated from agent-context package
 */

import { v4 as uuidv4 } from 'uuid';
import type { ContextShare, ContextShareStore } from './types.js';
import { SecurityValidator, SecurityLogger } from './security.js';

// In-memory share store for testing and development
export class MemoryContextShareStore implements ContextShareStore {
  private shares: Map<string, ContextShare> = new Map();

  async createShare(
    share: Omit<ContextShare, 'id' | 'createdAt'>
  ): Promise<ContextShare> {
    try {
      const validatedShare = {
        ...share,
        id: uuidv4(),
        createdAt: new Date(),
        sourceAgentId: SecurityValidator.validateAgentId(share.sourceAgentId),
        targetAgentId: SecurityValidator.validateAgentId(share.targetAgentId),
        contextSnapshotId: SecurityValidator.validateSnapshotId(
          share.contextSnapshotId
        ),
        shareType: SecurityValidator.validateShareType(
          share.shareType as any
        ) as 'read' | 'write' | 'admin',
        permissions: SecurityValidator.sanitizeObject(
          share.permissions
        ) as Record<string, any>,
      };

      this.shares.set(validatedShare.id, validatedShare);

      SecurityLogger.log({
        type: 'authorization',
        severity: 'low',
        agentId: validatedShare.sourceAgentId,
        action: 'createShare',
        details: {
          shareId: validatedShare.id,
          targetAgentId: validatedShare.targetAgentId,
          shareType: validatedShare.shareType,
        },
      });

      return validatedShare;
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'high',
        agentId: share.sourceAgentId,
        action: 'createShare',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getSharesForAgent(agentId: string): Promise<ContextShare[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const agentShares: ContextShare[] = [];

      for (const share of this.shares.values()) {
        if (share.sourceAgentId === validatedAgentId) {
          agentShares.push(share);
        }
      }

      return agentShares.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        agentId,
        action: 'getSharesForAgent',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getSharedContexts(agentId: string): Promise<ContextShare[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const sharedContexts: ContextShare[] = [];

      for (const share of this.shares.values()) {
        if (share.targetAgentId === validatedAgentId) {
          sharedContexts.push(share);
        }
      }

      return sharedContexts.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        agentId,
        action: 'getSharedContexts',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async revokeShare(shareId: string): Promise<void> {
    try {
      if (!shareId || typeof shareId !== 'string') {
        throw new Error('Share ID must be a non-empty string');
      }

      const share = this.shares.get(shareId);
      if (!share) {
        throw new Error(`Share not found: ${shareId}`);
      }

      this.shares.delete(shareId);

      SecurityLogger.log({
        type: 'authorization',
        severity: 'low',
        agentId: share.sourceAgentId,
        action: 'revokeShare',
        details: { shareId, targetAgentId: share.targetAgentId },
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        action: 'revokeShare',
        details: {
          shareId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async updateShare(
    shareId: string,
    updates: Partial<ContextShare>
  ): Promise<ContextShare> {
    try {
      if (!shareId || typeof shareId !== 'string') {
        throw new Error('Share ID must be a non-empty string');
      }

      const existingShare = this.shares.get(shareId);
      if (!existingShare) {
        throw new Error(`Share not found: ${shareId}`);
      }

      const updatedShare: ContextShare = {
        ...existingShare,
        ...updates,
        id: shareId, // Preserve original ID
        createdAt: existingShare.createdAt, // Preserve creation time
        // Validate updated fields
        shareType: updates.shareType
          ? (SecurityValidator.validateShareType(updates.shareType as any) as
              | 'read'
              | 'write'
              | 'admin')
          : existingShare.shareType,
        permissions: updates.permissions
          ? (SecurityValidator.sanitizeObject(updates.permissions) as Record<
              string,
              any
            >)
          : existingShare.permissions,
      };

      this.shares.set(shareId, updatedShare);

      SecurityLogger.log({
        type: 'authorization',
        severity: 'low',
        agentId: existingShare.sourceAgentId,
        action: 'updateShare',
        details: { shareId, updates: Object.keys(updates) },
      });

      return updatedShare;
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        action: 'updateShare',
        details: {
          shareId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  // Additional utility methods
  async getShare(shareId: string): Promise<ContextShare | null> {
    try {
      if (!shareId || typeof shareId !== 'string') {
        return null;
      }

      return this.shares.get(shareId) || null;
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        action: 'getShare',
        details: {
          shareId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      return null;
    }
  }

  async getSharesBySnapshot(snapshotId: string): Promise<ContextShare[]> {
    try {
      const validatedSnapshotId =
        SecurityValidator.validateSnapshotId(snapshotId);
      const snapshotShares: ContextShare[] = [];

      for (const share of this.shares.values()) {
        if (share.contextSnapshotId === validatedSnapshotId) {
          snapshotShares.push(share);
        }
      }

      return snapshotShares;
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        action: 'getSharesBySnapshot',
        details: {
          snapshotId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async cleanupExpiredShares(): Promise<number> {
    try {
      const now = new Date();
      let cleanedCount = 0;

      for (const [shareId, share] of this.shares.entries()) {
        if (share.expiresAt && share.expiresAt < now) {
          this.shares.delete(shareId);
          cleanedCount++;
        }
      }

      SecurityLogger.log({
        type: 'authorization',
        severity: 'low',
        action: 'cleanupExpiredShares',
        details: { cleanedCount },
      });

      return cleanedCount;
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        action: 'cleanupExpiredShares',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  getStoreStats(): {
    totalShares: number;
    activeShares: number;
    expiredShares: number;
    sharesByType: Record<string, number>;
    sharesByAgent: Record<string, number>;
  } {
    const now = new Date();
    const stats = {
      totalShares: this.shares.size,
      activeShares: 0,
      expiredShares: 0,
      sharesByType: {} as Record<string, number>,
      sharesByAgent: {} as Record<string, number>,
    };

    for (const share of this.shares.values()) {
      // Count by type
      stats.sharesByType[share.shareType] =
        (stats.sharesByType[share.shareType] || 0) + 1;

      // Count by agent
      stats.sharesByAgent[share.sourceAgentId] =
        (stats.sharesByAgent[share.sourceAgentId] || 0) + 1;

      // Count active vs expired
      if (share.expiresAt && share.expiresAt < now) {
        stats.expiredShares++;
      } else {
        stats.activeShares++;
      }
    }

    return stats;
  }

  clear(): void {
    this.shares.clear();
  }
}

// PostgreSQL share store for production use
export class PostgresContextShareStore implements ContextShareStore {
  constructor(
    private pool: any, // PostgreSQL pool
    private tableName: string = 'context_shares'
  ) {}

  async createShare(
    share: Omit<ContextShare, 'id' | 'createdAt'>
  ): Promise<ContextShare> {
    try {
      const validatedShare = {
        ...share,
        id: uuidv4(),
        createdAt: new Date(),
        sourceAgentId: SecurityValidator.validateAgentId(share.sourceAgentId),
        targetAgentId: SecurityValidator.validateAgentId(share.targetAgentId),
        contextSnapshotId: SecurityValidator.validateSnapshotId(
          share.contextSnapshotId
        ),
        shareType: SecurityValidator.validateShareType(
          share.shareType as any
        ) as 'read' | 'write' | 'admin',
        permissions: SecurityValidator.sanitizeObject(
          share.permissions
        ) as Record<string, any>,
      };

      const query = `
        INSERT INTO ${this.tableName} (
          id, source_agent_id, target_agent_id, context_snapshot_id, 
          share_type, permissions, expires_at, created_at, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, source_agent_id, target_agent_id, context_snapshot_id,
                 share_type, permissions, expires_at, created_at, created_by
      `;

      const values = [
        validatedShare.id,
        validatedShare.sourceAgentId,
        validatedShare.targetAgentId,
        validatedShare.contextSnapshotId,
        validatedShare.shareType,
        JSON.stringify(validatedShare.permissions),
        validatedShare.expiresAt,
        validatedShare.createdAt,
        validatedShare.createdBy,
      ];

      const result = await this.pool.query(query, values);
      const row = result.rows[0];

      SecurityLogger.log({
        type: 'authorization',
        severity: 'low',
        agentId: validatedShare.sourceAgentId,
        action: 'createShare',
        details: {
          shareId: validatedShare.id,
          targetAgentId: validatedShare.targetAgentId,
          shareType: validatedShare.shareType,
        },
      });

      return {
        id: row.id,
        sourceAgentId: row.source_agent_id,
        targetAgentId: row.target_agent_id,
        contextSnapshotId: row.context_snapshot_id,
        shareType: row.share_type,
        permissions: row.permissions,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        createdBy: row.created_by,
      };
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'high',
        agentId: share.sourceAgentId,
        action: 'createShare',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getSharesForAgent(agentId: string): Promise<ContextShare[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      const query = `
        SELECT id, source_agent_id, target_agent_id, context_snapshot_id,
               share_type, permissions, expires_at, created_at, created_by
        FROM ${this.tableName}
        WHERE source_agent_id = $1
        ORDER BY created_at DESC
      `;

      const result = await this.pool.query(query, [validatedAgentId]);

      return result.rows.map((row: any) => ({
        id: row.id,
        sourceAgentId: row.source_agent_id,
        targetAgentId: row.target_agent_id,
        contextSnapshotId: row.context_snapshot_id,
        shareType: row.share_type,
        permissions: row.permissions,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        createdBy: row.created_by,
      }));
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        agentId,
        action: 'getSharesForAgent',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getSharedContexts(agentId: string): Promise<ContextShare[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      const query = `
        SELECT id, source_agent_id, target_agent_id, context_snapshot_id,
               share_type, permissions, expires_at, created_at, created_by
        FROM ${this.tableName}
        WHERE target_agent_id = $1
        ORDER BY created_at DESC
      `;

      const result = await this.pool.query(query, [validatedAgentId]);

      return result.rows.map((row: any) => ({
        id: row.id,
        sourceAgentId: row.source_agent_id,
        targetAgentId: row.target_agent_id,
        contextSnapshotId: row.context_snapshot_id,
        shareType: row.share_type,
        permissions: row.permissions,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        createdBy: row.created_by,
      }));
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        agentId,
        action: 'getSharedContexts',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async revokeShare(shareId: string): Promise<void> {
    try {
      if (!shareId || typeof shareId !== 'string') {
        throw new Error('Share ID must be a non-empty string');
      }

      const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
      const result = await this.pool.query(query, [shareId]);

      if (result.rowCount === 0) {
        throw new Error(`Share not found: ${shareId}`);
      }

      SecurityLogger.log({
        type: 'authorization',
        severity: 'low',
        action: 'revokeShare',
        details: { shareId },
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        action: 'revokeShare',
        details: {
          shareId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async updateShare(
    shareId: string,
    updates: Partial<ContextShare>
  ): Promise<ContextShare> {
    try {
      if (!shareId || typeof shareId !== 'string') {
        throw new Error('Share ID must be a non-empty string');
      }

      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.shareType !== undefined) {
        setClauses.push(`share_type = $${paramIndex++}`);
        values.push(SecurityValidator.validateShareType(updates.shareType));
      }

      if (updates.permissions !== undefined) {
        setClauses.push(`permissions = $${paramIndex++}`);
        values.push(SecurityValidator.sanitizeObject(updates.permissions));
      }

      if (updates.expiresAt !== undefined) {
        setClauses.push(`expires_at = $${paramIndex++}`);
        values.push(updates.expiresAt);
      }

      if (setClauses.length === 0) {
        throw new Error('No valid updates provided');
      }

      values.push(shareId);

      const query = `
        UPDATE ${this.tableName}
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, source_agent_id, target_agent_id, context_snapshot_id,
                 share_type, permissions, expires_at, created_at, created_by
      `;

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error(`Share not found: ${shareId}`);
      }

      const row = result.rows[0];

      SecurityLogger.log({
        type: 'authorization',
        severity: 'low',
        action: 'updateShare',
        details: { shareId, updates: Object.keys(updates) },
      });

      return {
        id: row.id,
        sourceAgentId: row.source_agent_id,
        targetAgentId: row.target_agent_id,
        contextSnapshotId: row.context_snapshot_id,
        shareType: row.share_type,
        permissions: row.permissions,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        createdBy: row.created_by,
      };
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        action: 'updateShare',
        details: {
          shareId,
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
          source_agent_id VARCHAR(255) NOT NULL,
          target_agent_id VARCHAR(255) NOT NULL,
          context_snapshot_id VARCHAR(255) NOT NULL,
          share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('read', 'write', 'admin')),
          permissions JSONB DEFAULT '{}',
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          created_by VARCHAR(255)
        );

        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_source_agent ON ${this.tableName}(source_agent_id);
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_target_agent ON ${this.tableName}(target_agent_id);
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_snapshot ON ${this.tableName}(context_snapshot_id);
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_expires_at ON ${this.tableName}(expires_at);
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_created_at ON ${this.tableName}(created_at);
      `;

      await this.pool.query(query);
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
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
  MemoryContextShareStore,
  PostgresContextShareStore,
};
