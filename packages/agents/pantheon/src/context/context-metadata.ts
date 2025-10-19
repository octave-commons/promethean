/**
 * Context Metadata Service
 * Migrated from agent-context package with unified type system integration
 */

import { v4 as uuidv4 } from 'uuid';
import type { 
  ContextMetadata as CoreContextMetadata,
  ContextMetadataStore,
  ContextQuery 
} from './types.js';
import { SecurityValidator, SecurityLogger } from './security.js';

export class ContextMetadataService {
  constructor(private metadataStore: ContextMetadataStore) {}

  async setMetadata(
    agentId: string,
    key: string,
    value: any,
    options: {
      type?: string;
      visibility?: 'private' | 'shared' | 'public';
      expiresAt?: Date;
    } = {},
  ): Promise<CoreContextMetadata> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const sanitizedKey = SecurityValidator.validateAgentId(key); // Reuse validation for keys
      const sanitizedValue = SecurityValidator.sanitizeObject(value);

      const metadata: Omit<CoreContextMetadata, 'id' | 'createdAt' | 'updatedAt'> = {
        id: { value: uuidv4(), type: 'agent' }, // Generate context ID
        agentId: validatedAgentId as any, // Type conversion for unified system
        name: sanitizedKey,
        description: options.type || 'generic',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: options.expiresAt,
        tags: [options.type || 'generic'],
        permissions: {
          read: [validatedAgentId as any],
          write: [validatedAgentId as any],
          admin: [validatedAgentId as any],
          public: options.visibility === 'public'
        }
      };

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'setMetadata',
        details: { key: sanitizedKey, type: options.type }
      });

      return await this.metadataStore.setMetadata(metadata);
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'setMetadata',
        details: { 
          key, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      });
      throw error;
    }
  }

  async getMetadata(agentId: string, key?: string): Promise<CoreContextMetadata[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      
      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'getMetadata',
        details: { key }
      });

      return await this.metadataStore.getMetadata(validatedAgentId, key);
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getMetadata',
        details: { 
          key,
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      });
      throw error;
    }
  }

  async updateMetadata(agentId: string, key: string, value: any): Promise<CoreContextMetadata> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const sanitizedKey = SecurityValidator.validateAgentId(key);
      const sanitizedValue = SecurityValidator.sanitizeObject(value);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'updateMetadata',
        details: { key: sanitizedKey }
      });

      return await this.metadataStore.updateMetadata(validatedAgentId, sanitizedKey, sanitizedValue);
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'updateMetadata',
        details: { 
          key,
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      });
      throw error;
    }
  }

  async deleteMetadata(agentId: string, key: string): Promise<void> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const sanitizedKey = SecurityValidator.validateAgentId(key);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'deleteMetadata',
        details: { key: sanitizedKey }
      });

      await this.metadataStore.deleteMetadata(validatedAgentId, sanitizedKey);
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'deleteMetadata',
        details: { 
          key,
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      });
      throw error;
    }
  }

  async queryMetadata(query: ContextQuery): Promise<CoreContextMetadata[]> {
    try {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        action: 'queryMetadata',
        details: { query }
      });

      return await this.metadataStore.queryMetadata(query);
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        action: 'queryMetadata',
        details: { 
          query,
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      });
      throw error;
    }
  }

  async searchByValue(
    agentId: string,
    searchValue: any,
    options: {
      type?: string;
      visibility?: string;
      limit?: number;
    } = {},
  ): Promise<CoreContextMetadata[]> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const allMetadata = await this.metadataStore.getMetadata(validatedAgentId);

      let filtered = allMetadata.filter((meta) => {
        // Simple string search in serialized value
        const valueStr = JSON.stringify(meta).toLowerCase();
        const searchStr =
          typeof searchValue === 'string'
            ? searchValue.toLowerCase()
            : JSON.stringify(searchValue).toLowerCase();
        return valueStr.includes(searchStr);
      });

      if (options.type) {
        filtered = filtered.filter((meta) => meta.description === options.type);
      }

      if (options.visibility) {
        filtered = filtered.filter((meta) => {
          if (options.visibility === 'public') return meta.permissions.public;
          if (options.visibility === 'shared') return meta.permissions.read.length > 1;
          return meta.permissions.read.length === 1 && !meta.permissions.public;
        });
      }

      if (options.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'searchByValue',
        details: { 
          searchValue: typeof searchValue === 'string' ? searchValue : 'object',
          resultCount: filtered.length
        }
      });

      return filtered;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'searchByValue',
        details: { 
          searchValue: typeof searchValue === 'string' ? searchValue : 'object',
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      });
      throw error;
    }
  }

  async getMetadataByType(agentId: string, type: string): Promise<CoreContextMetadata[]> {
    return await this.queryMetadata({
      agentId,
      contextType: type,
    });
  }

  async getPublicMetadata(agentId?: string): Promise<CoreContextMetadata[]> {
    const query: ContextQuery = {
      visibility: 'public',
    };

    if (agentId) {
      query.agentId = agentId;
    }

    return await this.metadataStore.queryMetadata(query);
  }

  async getSharedMetadata(agentId: string): Promise<CoreContextMetadata[]> {
    return await this.queryMetadata({
      agentId,
      visibility: 'shared',
    });
  }

  async cleanupExpired(): Promise<number> {
    try {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        action: 'cleanupExpired',
        details: { initiated: true }
      });

      const result = await this.metadataStore.cleanupExpired();

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        action: 'cleanupExpired',
        details: { cleanedCount: result }
      });

      return result;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        action: 'cleanupExpired',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async setTopicMetadata(
    agentId: string,
    topic: string,
    data: any,
    options: { expiresAt?: Date; visibility?: 'private' | 'shared' | 'public' } = {},
  ): Promise<CoreContextMetadata> {
    return await this.setMetadata(agentId, `topic:${topic}`, data, {
      type: 'topic',
      ...options,
    });
  }

  async setParticipantMetadata(
    agentId: string,
    participantId: string,
    data: any,
    options: { expiresAt?: Date; visibility?: 'private' | 'shared' | 'public' } = {},
  ): Promise<CoreContextMetadata> {
    return await this.setMetadata(agentId, `participant:${participantId}`, data, {
      type: 'participant',
      ...options,
    });
  }

  async setSessionMetadata(
    agentId: string,
    sessionId: string,
    data: any,
    options: { expiresAt?: Date; visibility?: 'private' | 'shared' | 'public' } = {},
  ): Promise<CoreContextMetadata> {
    return await this.setMetadata(agentId, `session:${sessionId}`, data, {
      type: 'session',
      ...options,
    });
  }

  async getTopics(agentId: string): Promise<string[]> {
    try {
      const topicMetadata = await this.getMetadataByType(agentId, 'topic');
      return topicMetadata
        .map((meta) => meta.name.replace('topic:', ''))
        .filter((topic) => topic.length > 0);
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getTopics',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  }

  async getParticipants(agentId: string): Promise<string[]> {
    try {
      const participantMetadata = await this.getMetadataByType(agentId, 'participant');
      return participantMetadata
        .map((meta) => meta.name.replace('participant:', ''))
        .filter((participant) => participant.length > 0);
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getParticipants',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  }

  async getSessions(agentId: string): Promise<string[]> {
    try {
      const sessionMetadata = await this.getMetadataByType(agentId, 'session');
      return sessionMetadata
        .map((meta) => meta.name.replace('session:', ''))
        .filter((session) => session.length > 0);
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getSessions',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  }

  // Enhanced methods for unified system
  async getMetadataStatistics(agentId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    byVisibility: Record<string, number>;
    expired: number;
    totalSize: number;
  }> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const allMetadata = await this.metadataStore.getMetadata(validatedAgentId);
      const now = new Date();

      const stats = {
        total: allMetadata.length,
        byType: {} as Record<string, number>,
        byVisibility: {} as Record<string, number>,
        expired: 0,
        totalSize: 0
      };

      for (const meta of allMetadata) {
        // Count by type
        const type = meta.description || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;

        // Count by visibility
        if (meta.permissions.public) {
          stats.byVisibility.public = (stats.byVisibility.public || 0) + 1;
        } else if (meta.permissions.read.length > 1) {
          stats.byVisibility.shared = (stats.byVisibility.shared || 0) + 1;
        } else {
          stats.byVisibility.private = (stats.byVisibility.private || 0) + 1;
        }

        // Count expired
        if (meta.expiresAt && meta.expiresAt < now) {
          stats.expired++;
        }

        // Calculate size
        stats.totalSize += JSON.stringify(meta).length;
      }

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'getMetadataStatistics',
        details: stats
      });

      return stats;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getMetadataStatistics',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async exportMetadata(agentId: string, options: {
    includeExpired?: boolean;
    types?: string[];
    format?: 'json' | 'csv';
  } = {}): Promise<string> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      let metadata = await this.metadataStore.getMetadata(validatedAgentId);

      // Filter expired if requested
      if (!options.includeExpired) {
        const now = new Date();
        metadata = metadata.filter(meta => !meta.expiresAt || meta.expiresAt >= now);
      }

      // Filter by types if specified
      if (options.types && options.types.length > 0) {
        metadata = metadata.filter(meta => 
          options.types!.includes(meta.description || 'unknown')
        );
      }

      if (options.format === 'csv') {
        // Convert to CSV format
        const headers = ['id', 'name', 'description', 'visibility', 'createdAt', 'updatedAt', 'expiresAt'];
        const rows = metadata.map(meta => [
          meta.id.value,
          meta.name,
          meta.description,
          meta.permissions.public ? 'public' : meta.permissions.read.length > 1 ? 'shared' : 'private',
          meta.createdAt.toISOString(),
          meta.updatedAt.toISOString(),
          meta.expiresAt?.toISOString() || ''
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
      }

      // Default to JSON format
      return JSON.stringify(metadata, null, 2);
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'exportMetadata',
        details: { 
          options,
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      });
      throw error;
    }
  }
}

export default ContextMetadataService;