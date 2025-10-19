/**
 * Context Metadata Store implementations
 * Migrated from agent-context package with unified type system integration
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  CoreContextMetadata,
  ContextMetadataStore,
  ContextQuery,
} from './types.js';
import { SecurityValidator, SecurityLogger } from './security.js';

// In-memory metadata store for testing and development
export class MemoryContextMetadataStore implements ContextMetadataStore {
  private metadata: Map<string, CoreContextMetadata> = new Map();

  async setMetadata(
    metadata: Omit<CoreContextMetadata, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CoreContextMetadata> {
    try {
      const validatedMetadata: CoreContextMetadata = {
        ...metadata,
        id: { value: uuidv4(), type: 'agent' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
        agentId: SecurityValidator.validateAgentId(
          metadata.agentId as unknown as string
        ) as any,
        name: SecurityValidator.validateAgentId(metadata.name),
        permissions: {
          read: metadata.permissions.read.map(
            (id) =>
              SecurityValidator.validateAgentId(id as unknown as string) as any
          ),
          write: metadata.permissions.write.map(
            (id) =>
              SecurityValidator.validateAgentId(id as unknown as string) as any
          ),
          admin: metadata.permissions.admin.map(
            (id) =>
              SecurityValidator.validateAgentId(id as unknown as string) as any
          ),
          public: metadata.permissions.public,
        },
      };

      const key = this.generateKey(
        (validatedMetadata.agentId as any)?.value ||
          (validatedMetadata.agentId as unknown as string),
        validatedMetadata.name
      );
      this.metadata.set(key, validatedMetadata);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId:
          (validatedMetadata.agentId as any)?.value ||
          (validatedMetadata.agentId as unknown as string),
        action: 'setMetadata',
        details: {
          metadataId: validatedMetadata.id.value,
          name: validatedMetadata.name,
        },
      });

      return validatedMetadata;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId: metadata.agentId as unknown as string,
        action: 'setMetadata',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getMetadata(
    agentId: string,
    key?: string
  ): Promise<CoreContextMetadata[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const results: CoreContextMetadata[] = [];

      for (const [, metadata] of this.metadata.entries()) {
        if (this.isMetadataForAgent(metadata, validatedAgentId)) {
          if (!key || metadata.name === key) {
            results.push(metadata);
          }
        }
      }

      return results.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getMetadata',
        details: {
          key,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async updateMetadata(
    agentId: string,
    key: string,
    value: any
  ): Promise<CoreContextMetadata> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const validatedKey = SecurityValidator.validateAgentId(key);
      const storeKey = this.generateKey(validatedAgentId, validatedKey);

      const existingMetadata = this.metadata.get(storeKey);
      if (!existingMetadata) {
        throw new Error(`Metadata not found: ${storeKey}`);
      }

      const updatedMetadata: CoreContextMetadata = {
        ...existingMetadata,
        description: JSON.stringify(SecurityValidator.sanitizeObject(value)),
        updatedAt: new Date(),
      };

      this.metadata.set(storeKey, updatedMetadata);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'updateMetadata',
        details: { key: validatedKey },
      });

      return updatedMetadata;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'updateMetadata',
        details: {
          key,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async deleteMetadata(agentId: string, key: string): Promise<void> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const validatedKey = SecurityValidator.validateAgentId(key);
      const storeKey = this.generateKey(validatedAgentId, validatedKey);

      const existed = this.metadata.has(storeKey);
      this.metadata.delete(storeKey);

      if (existed) {
        SecurityLogger.log({
          type: 'data_access',
          severity: 'low',
          agentId: validatedAgentId,
          action: 'deleteMetadata',
          details: { key: validatedKey },
        });
      }
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'deleteMetadata',
        details: {
          key,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async queryMetadata(query: ContextQuery): Promise<CoreContextMetadata[]> {
    try {
      let results: CoreContextMetadata[] = Array.from(this.metadata.values());

      // Filter by agent ID
      if (query.agentId) {
        const validatedAgentId = SecurityValidator.validateAgentId(
          query.agentId
        );
        results = results.filter((metadata) =>
          this.isMetadataForAgent(metadata, validatedAgentId)
        );
      }

      // Filter by context type (description in unified system)
      if (query.contextType) {
        results = results.filter(
          (metadata) => metadata.description === query.contextType
        );
      }

      // Filter by visibility
      if (query.visibility) {
        results = results.filter((metadata) => {
          if (query.visibility === 'public') return metadata.permissions.public;
          if (query.visibility === 'shared')
            return metadata.permissions.read.length > 1;
          return (
            metadata.permissions.read.length === 1 &&
            !metadata.permissions.public
          );
        });
      }

      // Filter by key pattern (name in unified system)
      if (query.keyPattern) {
        const pattern = new RegExp(query.keyPattern, 'i');
        results = results.filter((metadata) => pattern.test(metadata.name));
      }

      // Apply limit and offset
      if (query.offset) {
        results = results.slice(query.offset);
      }

      if (query.limit) {
        results = results.slice(0, query.limit);
      }

      return results.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        action: 'queryMetadata',
        details: {
          query,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async cleanupExpired(): Promise<void> {
    try {
      const now = new Date();
      let cleanedCount = 0;

      for (const [key, metadata] of this.metadata.entries()) {
        if (metadata.expiresAt && metadata.expiresAt < now) {
          this.metadata.delete(key);
          cleanedCount++;
        }
      }

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        action: 'cleanupExpired',
        details: { cleanedCount },
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        action: 'cleanupExpired',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  private generateKey(agentId: string, name: string): string {
    return `${agentId}:${name}`;
  }

  private isMetadataForAgent(
    metadata: CoreContextMetadata,
    agentId: string
  ): boolean {
    return (
      (metadata.agentId as any)?.value === agentId ||
      metadata.permissions.read.includes(agentId as any)
    );
  }

  // Additional utility methods
  getAllMetadata(): CoreContextMetadata[] {
    return Array.from(this.metadata.values());
  }

  clear(): void {
    this.metadata.clear();
  }

  getStoreStats(): {
    totalMetadata: number;
    expiredMetadata: number;
    metadataByAgent: Record<string, number>;
    metadataByType: Record<string, number>;
  } {
    const now = new Date();
    const stats = {
      totalMetadata: this.metadata.size,
      expiredMetadata: 0,
      metadataByAgent: {} as Record<string, number>,
      metadataByType: {} as Record<string, number>,
    };

    for (const metadata of this.metadata.values()) {
      // Count by agent
      const agentId = metadata.agentId as unknown as string;
      stats.metadataByAgent[agentId] =
        (stats.metadataByAgent[agentId] || 0) + 1;

      // Count by type
      const type = metadata.description || 'unknown';
      stats.metadataByType[type] = (stats.metadataByType[type] || 0) + 1;

      // Count expired
      if (metadata.expiresAt && metadata.expiresAt < now) {
        stats.expiredMetadata++;
      }
    }

    return stats;
  }
}

// PostgreSQL metadata store for production use
export class PostgresContextMetadataStore implements ContextMetadataStore {
  constructor(
    private pool: any, // PostgreSQL pool
    private tableName: string = 'context_metadata'
  ) {}

  async setMetadata(
    metadata: Omit<CoreContextMetadata, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CoreContextMetadata> {
    try {
      const validatedMetadata = {
        ...metadata,
        id: { value: uuidv4(), type: 'agent' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
        agentId: SecurityValidator.validateAgentId(
          metadata.agentId as unknown as string
        ) as any,
        name: SecurityValidator.validateAgentId(metadata.name),
      };

      const query = `
        INSERT INTO ${this.tableName} (
          id, agent_id, name, description, parent_id, created_at, updated_at,
          expires_at, tags, read_permissions, write_permissions, admin_permissions, public
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (agent_id, name) DO UPDATE SET
          description = EXCLUDED.description,
          updated_at = EXCLUDED.updated_at,
          expires_at = EXCLUDED.expires_at,
          tags = EXCLUDED.tags,
          read_permissions = EXCLUDED.read_permissions,
          write_permissions = EXCLUDED.write_permissions,
          admin_permissions = EXCLUDED.admin_permissions,
          public = EXCLUDED.public
        RETURNING id, agent_id, name, description, parent_id, created_at, updated_at,
                  expires_at, tags, read_permissions, write_permissions, admin_permissions, public
      `;

      const values = [
        validatedMetadata.id.value,
        validatedMetadata.agentId,
        validatedMetadata.name,
        validatedMetadata.description,
        validatedMetadata.parentId?.value,
        validatedMetadata.createdAt,
        validatedMetadata.updatedAt,
        validatedMetadata.expiresAt,
        JSON.stringify(validatedMetadata.tags || []),
        JSON.stringify(validatedMetadata.permissions.read),
        JSON.stringify(validatedMetadata.permissions.write),
        JSON.stringify(validatedMetadata.permissions.admin),
        validatedMetadata.permissions.public,
      ];

      const result = await this.pool.query(query, values);
      const row = result.rows[0];

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId:
          (validatedMetadata.agentId as any)?.value ||
          (validatedMetadata.agentId as unknown as string),
        action: 'setMetadata',
        details: {
          metadataId: validatedMetadata.id.value,
          name: validatedMetadata.name,
        },
      });

      return {
        id: { value: row.id, type: 'agent' },
        agentId: row.agent_id,
        name: row.name,
        description: row.description,
        ...(row.parent_id && {
          parentId: { value: row.parent_id, type: 'agent' },
        }),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
        tags: row.tags,
        permissions: {
          read: row.read_permissions,
          write: row.write_permissions,
          admin: row.admin_permissions,
          public: row.public,
        },
      };
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'high',
        agentId: metadata.agentId as unknown as string,
        action: 'setMetadata',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getMetadata(
    agentId: string,
    key?: string
  ): Promise<CoreContextMetadata[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      let query = `
        SELECT id, agent_id, name, description, parent_id, created_at, updated_at,
               expires_at, tags, read_permissions, write_permissions, admin_permissions, public
        FROM ${this.tableName}
        WHERE agent_id = $1
      `;

      const params: any[] = [validatedAgentId];

      if (key) {
        query += ` AND name = $2`;
        params.push(key);
      }

      query += ` ORDER BY updated_at DESC`;

      const result = await this.pool.query(query, params);

      return result.rows.map((row: any) => ({
        id: { value: row.id, type: 'agent' },
        agentId: row.agent_id,
        name: row.name,
        description: row.description,
        ...(row.parent_id && {
          parentId: { value: row.parent_id, type: 'agent' },
        }),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
        tags: row.tags,
        permissions: {
          read: row.read_permissions,
          write: row.write_permissions,
          admin: row.admin_permissions,
          public: row.public,
        },
      }));
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getMetadata',
        details: {
          key,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async updateMetadata(
    agentId: string,
    key: string,
    value: any
  ): Promise<CoreContextMetadata> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const validatedKey = SecurityValidator.validateAgentId(key);
      const sanitizedValue = SecurityValidator.sanitizeObject(value);

      const query = `
        UPDATE ${this.tableName}
        SET description = $1, updated_at = NOW()
        WHERE agent_id = $2 AND name = $3
        RETURNING id, agent_id, name, description, parent_id, created_at, updated_at,
                  expires_at, tags, read_permissions, write_permissions, admin_permissions, public
      `;

      const result = await this.pool.query(query, [
        JSON.stringify(sanitizedValue),
        validatedAgentId,
        validatedKey,
      ]);

      if (result.rows.length === 0) {
        throw new Error(
          `Metadata not found: ${validatedAgentId}:${validatedKey}`
        );
      }

      const row = result.rows[0];

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'updateMetadata',
        details: { key: validatedKey },
      });

      return {
        id: { value: row.id, type: 'agent' },
        agentId: row.agent_id,
        name: row.name,
        description: row.description,
        ...(row.parent_id && {
          parentId: { value: row.parent_id, type: 'agent' },
        }),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
        tags: row.tags,
        permissions: {
          read: row.read_permissions,
          write: row.write_permissions,
          admin: row.admin_permissions,
          public: row.public,
        },
      };
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'updateMetadata',
        details: {
          key,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async deleteMetadata(agentId: string, key: string): Promise<void> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const validatedKey = SecurityValidator.validateAgentId(key);

      const query = `DELETE FROM ${this.tableName} WHERE agent_id = $1 AND name = $2`;
      const result = await this.pool.query(query, [
        validatedAgentId,
        validatedKey,
      ]);

      if (result.rowCount > 0) {
        SecurityLogger.log({
          type: 'data_access',
          severity: 'low',
          agentId: validatedAgentId,
          action: 'deleteMetadata',
          details: { key: validatedKey },
        });
      }
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'deleteMetadata',
        details: {
          key,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async queryMetadata(query: ContextQuery): Promise<CoreContextMetadata[]> {
    try {
      let sqlQuery = `
        SELECT id, agent_id, name, description, parent_id, created_at, updated_at,
               expires_at, tags, read_permissions, write_permissions, admin_permissions, public
        FROM ${this.tableName}
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (query.agentId) {
        sqlQuery += ` AND agent_id = $${paramIndex++}`;
        params.push(SecurityValidator.validateAgentId(query.agentId));
      }

      if (query.contextType) {
        sqlQuery += ` AND description = $${paramIndex++}`;
        params.push(query.contextType);
      }

      if (query.visibility) {
        if (query.visibility === 'public') {
          sqlQuery += ` AND public = true`;
        } else if (query.visibility === 'shared') {
          sqlQuery += ` AND public = false AND array_length(read_permissions, 1) > 1`;
        } else {
          sqlQuery += ` AND public = false AND array_length(read_permissions, 1) = 1`;
        }
      }

      if (query.keyPattern) {
        sqlQuery += ` AND name ~ $${paramIndex++}`;
        params.push(query.keyPattern);
      }

      sqlQuery += ` ORDER BY updated_at DESC`;

      if (query.limit) {
        sqlQuery += ` LIMIT $${paramIndex++}`;
        params.push(query.limit);
      }

      if (query.offset) {
        sqlQuery += ` OFFSET $${paramIndex++}`;
        params.push(query.offset);
      }

      const result = await this.pool.query(sqlQuery, params);

      return result.rows.map((row: any) => ({
        id: { value: row.id, type: 'agent' },
        agentId: row.agent_id,
        name: row.name,
        description: row.description,
        ...(row.parent_id && {
          parentId: { value: row.parent_id, type: 'agent' },
        }),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
        tags: row.tags,
        permissions: {
          read: row.read_permissions,
          write: row.write_permissions,
          admin: row.admin_permissions,
          public: row.public,
        },
      }));
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        action: 'queryMetadata',
        details: {
          query,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async cleanupExpired(): Promise<void> {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE expires_at < NOW()`;
      const result = await this.pool.query(query);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        action: 'cleanupExpired',
        details: { cleanedCount: result.rowCount },
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        action: 'cleanupExpired',
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
          name VARCHAR(255) NOT NULL,
          description TEXT,
          parent_id UUID,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE,
          tags TEXT[] DEFAULT '{}',
          read_permissions VARCHAR(255)[] DEFAULT '{}',
          write_permissions VARCHAR(255)[] DEFAULT '{}',
          admin_permissions VARCHAR(255)[] DEFAULT '{}',
          public BOOLEAN DEFAULT false,
          UNIQUE(agent_id, name)
        );

        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_agent_id ON ${this.tableName}(agent_id);
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_name ON ${this.tableName}(name);
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_expires_at ON ${this.tableName}(expires_at);
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_updated_at ON ${this.tableName}(updated_at);
        CREATE INDEX IF NOT EXISTS idx_${this.tableName}_public ON ${this.tableName}(public);
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
  MemoryContextMetadataStore,
  PostgresContextMetadataStore,
};
