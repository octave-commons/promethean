import { ContextSnapshot, SnapshotStore } from './types';
import { openLevelCache, Cache } from '@promethean/level-cache';

export class PostgresSnapshotStore implements SnapshotStore {
  private cache: Cache<ContextSnapshot> | null = null;
  private cachePromise: Promise<void> | null = null;

  constructor(
    private db: any,
    private cacheOptions?: any,
  ) {
    this.cachePromise = this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    this.cache = await openLevelCache({
      path: './tmp/agent-context-snapshots',
      namespace: 'agent-context-snapshots',
      ttl: 7200000, // 2 hours
      ...this.cacheOptions,
    });
  }

  private async getCache(): Promise<Cache<ContextSnapshot>> {
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

  async saveSnapshot(snapshot: ContextSnapshot): Promise<void> {
    const query = `
      INSERT INTO agent_context_snapshots (id, agent_id, timestamp, state, version, event_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        state = EXCLUDED.state,
        version = EXCLUDED.version,
        event_id = EXCLUDED.event_id
    `;

    await this.db.query(query, [
      snapshot.id,
      snapshot.agentId,
      snapshot.timestamp,
      JSON.stringify(snapshot.state),
      snapshot.version,
      snapshot.eventId,
    ]);

    // Update cache
    const cache = await this.getCache();
    await cache.set(snapshot.id, snapshot);
    await cache.set(`latest:${snapshot.agentId}`, snapshot);
  }

  async getLatestSnapshot(agentId: string): Promise<ContextSnapshot | null> {
    // Try cache first
    const cache = await this.getCache();
    const cacheKey = `latest:${agentId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const query = `
      SELECT * FROM agent_context_snapshots 
      WHERE agent_id = $1 
      ORDER BY version DESC 
      LIMIT 1
    `;

    const result = await this.db.query(query, [agentId]);

    if (result.rows.length === 0) {
      return null;
    }

    const snapshot = this.mapRowToSnapshot(result.rows[0]);
    await cache.set(cacheKey, snapshot);
    return snapshot;
  }

  async getSnapshot(snapshotId: string): Promise<ContextSnapshot | null> {
    // Try cache first
    const cache = await this.getCache();
    const cached = await cache.get(snapshotId);
    if (cached) {
      return cached;
    }

    const query = 'SELECT * FROM agent_context_snapshots WHERE id = $1';
    const result = await this.db.query(query, [snapshotId]);

    if (result.rows.length === 0) {
      return null;
    }

    const snapshot = this.mapRowToSnapshot(result.rows[0]);
    await cache.set(snapshotId, snapshot);
    return snapshot;
  }

  private mapRowToSnapshot(row: any): ContextSnapshot {
    return {
      id: row.id,
      agentId: row.agent_id,
      timestamp: new Date(row.timestamp),
      state: JSON.parse(row.state),
      version: row.version,
      eventId: row.event_id,
    };
  }
}
