import { ContextShare, ContextShareStore } from './types';
import { openLevelCache, Cache } from '@promethean/level-cache';

export class PostgresContextShareStore implements ContextShareStore {
  private cache: Cache<ContextShare> | null = null;
  private cachePromise: Promise<void> | null = null;

  constructor(
    private db: any,
    private cacheOptions?: any,
  ) {
    this.cachePromise = this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    this.cache = await openLevelCache({
      path: './tmp/agent-context-shares',
      namespace: 'agent-context-shares',
      ttl: 3600000, // 1 hour
      ...this.cacheOptions,
    });
  }

  private async getCache(): Promise<Cache<ContextShare>> {
    if (!this.cache) {
      if (!this.cachePromise) {
        this.cachePromise = this.initializeCache();
      }
      await this.cachePromise;
    }
    if (!this.cache) {
      throw new Error('Failed to initialize cache');
    }
    return this.cache;
  }

  async createShare(share: Omit<ContextShare, 'id' | 'createdAt'>): Promise<ContextShare> {
    const query = `
      INSERT INTO agent_context_shares (
        source_agent_id, target_agent_id, context_snapshot_id, 
        share_type, permissions, expires_at, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at
    `;

    const result = await this.db.query(query, [
      share.sourceAgentId,
      share.targetAgentId,
      share.contextSnapshotId,
      share.shareType,
      JSON.stringify(share.permissions),
      share.expiresAt,
      share.createdBy,
    ]);

    const createdShare: ContextShare = {
      ...share,
      id: result.rows[0].id,
      createdAt: result.rows[0].created_at,
    };

    // Update cache
    const cache = await this.getCache();
    await cache.set(createdShare.id, createdShare);

    return createdShare;
  }

  async getSharesForAgent(agentId: string): Promise<ContextShare[]> {
    const cache = await this.getCache();
    const cacheKey = `shares:${agentId}`;
    const cached = await cache.get(cacheKey);
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    const query = `
      SELECT * FROM agent_context_shares 
      WHERE source_agent_id = $1 OR target_agent_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.db.query(query, [agentId]);
    const shares = result.rows.map(this.mapRowToShare);

    await cache.set(cacheKey, shares);
    return shares;
  }

  async getSharedContexts(agentId: string): Promise<ContextShare[]> {
    const cache = await this.getCache();
    const cacheKey = `received:${agentId}`;
    const cached = await cache.get(cacheKey);
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    const query = `
      SELECT * FROM agent_context_shares 
      WHERE target_agent_id = $1 
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
    `;

    const result = await this.db.query(query, [agentId]);
    const shares = result.rows.map(this.mapRowToShare);

    await cache.set(cacheKey, shares);
    return shares;
  }

  async revokeShare(shareId: string): Promise<void> {
    const query = 'DELETE FROM agent_context_shares WHERE id = $1';
    await this.db.query(query, [shareId]);

    // Update cache - remove from cache by setting expiration
    const cache = await this.getCache();
    await cache.set(shareId, undefined as any);
  }

  async updateShare(shareId: string, updates: Partial<ContextShare>): Promise<ContextShare> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.shareType !== undefined) {
      fields.push(`share_type = $${paramIndex++}`);
      values.push(updates.shareType);
    }

    if (updates.permissions !== undefined) {
      fields.push(`permissions = $${paramIndex++}`);
      values.push(JSON.stringify(updates.permissions));
    }

    if (updates.expiresAt !== undefined) {
      fields.push(`expires_at = $${paramIndex++}`);
      values.push(updates.expiresAt);
    }

    if (fields.length === 0) {
      throw new Error('No updates provided');
    }

    values.push(shareId);

    const query = `
      UPDATE agent_context_shares 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    const updatedShare = this.mapRowToShare(result.rows[0]);

    // Update cache
    const cache = await this.getCache();
    await cache.set(updatedShare.id, updatedShare);

    return updatedShare;
  }

  private mapRowToShare(row: any): ContextShare {
    return {
      id: row.id,
      sourceAgentId: row.source_agent_id || row.owner_agent_id,
      targetAgentId: row.target_agent_id || row.shared_with_agent_id,
      contextSnapshotId: row.context_snapshot_id,
      shareType: row.share_type,
      permissions: row.permissions ? JSON.parse(row.permissions) : {},
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      createdBy: row.created_by,
    };
  }
}
