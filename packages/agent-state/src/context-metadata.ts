import { ContextMetadata, ContextMetadataStore, ContextQuery } from './types';

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
  ): Promise<ContextMetadata> {
    const metadata: Omit<ContextMetadata, 'id' | 'createdAt' | 'updatedAt'> = {
      agentId,
      contextKey: key,
      contextValue: value,
      contextType: options.type || 'generic',
      visibility: options.visibility || 'private',
      expiresAt: options.expiresAt,
    };

    return await this.metadataStore.setMetadata(metadata);
  }

  async getMetadata(agentId: string, key?: string): Promise<ContextMetadata[]> {
    return await this.metadataStore.getMetadata(agentId, key);
  }

  async updateMetadata(agentId: string, key: string, value: any): Promise<ContextMetadata> {
    return await this.metadataStore.updateMetadata(agentId, key, value);
  }

  async deleteMetadata(agentId: string, key: string): Promise<void> {
    await this.metadataStore.deleteMetadata(agentId, key);
  }

  async queryMetadata(query: ContextQuery): Promise<ContextMetadata[]> {
    return await this.metadataStore.queryMetadata(query);
  }

  async searchByValue(
    agentId: string,
    searchValue: any,
    options: {
      type?: string;
      visibility?: string;
      limit?: number;
    } = {},
  ): Promise<ContextMetadata[]> {
    const allMetadata = await this.metadataStore.getMetadata(agentId);

    let filtered = allMetadata.filter((meta) => {
      // Simple string search in serialized value
      const valueStr = JSON.stringify(meta.contextValue).toLowerCase();
      const searchStr =
        typeof searchValue === 'string'
          ? searchValue.toLowerCase()
          : JSON.stringify(searchValue).toLowerCase();
      return valueStr.includes(searchStr);
    });

    if (options.type) {
      filtered = filtered.filter((meta) => meta.contextType === options.type);
    }

    if (options.visibility) {
      filtered = filtered.filter((meta) => meta.visibility === options.visibility);
    }

    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  async getMetadataByType(agentId: string, type: string): Promise<ContextMetadata[]> {
    return await this.queryMetadata({
      agentId,
      contextType: type,
    });
  }

  async getPublicMetadata(agentId?: string): Promise<ContextMetadata[]> {
    const query: ContextQuery = {
      visibility: 'public',
    };

    if (agentId) {
      query.agentId = agentId;
    }

    return await this.metadataStore.queryMetadata(query);
  }

  async getSharedMetadata(agentId: string): Promise<ContextMetadata[]> {
    return await this.queryMetadata({
      agentId,
      visibility: 'shared',
    });
  }

  async cleanupExpired(): Promise<number> {
    // Get count of expired items before cleanup
    let allMetadata: ContextMetadata[] = [];

    // Try to get raw access to all metadata (including expired)
    if ('getAllMetadataRaw' in this.metadataStore) {
      allMetadata = (this.metadataStore as any).getAllMetadataRaw();
    } else {
      // Fallback: use queryMetadata (may filter expired in some implementations)
      allMetadata = await this.metadataStore.queryMetadata({});
    }

    const now = new Date();
    const expired = allMetadata.filter((meta) => meta.expiresAt && meta.expiresAt < now);

    // Perform cleanup
    await this.metadataStore.cleanupExpired();

    return expired.length;
  }

  async setTopicMetadata(
    agentId: string,
    topic: string,
    data: any,
    options: { expiresAt?: Date; visibility?: 'private' | 'shared' | 'public' } = {},
  ): Promise<ContextMetadata> {
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
  ): Promise<ContextMetadata> {
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
  ): Promise<ContextMetadata> {
    return await this.setMetadata(agentId, `session:${sessionId}`, data, {
      type: 'session',
      ...options,
    });
  }

  async getTopics(agentId: string): Promise<string[]> {
    const topicMetadata = await this.getMetadataByType(agentId, 'topic');
    return topicMetadata
      .map((meta) => meta.contextKey.replace('topic:', ''))
      .filter((topic) => topic.length > 0);
  }

  async getParticipants(agentId: string): Promise<string[]> {
    const participantMetadata = await this.getMetadataByType(agentId, 'participant');
    return participantMetadata
      .map((meta) => meta.contextKey.replace('participant:', ''))
      .filter((participant) => participant.length > 0);
  }

  async getSessions(agentId: string): Promise<string[]> {
    const sessionMetadata = await this.getMetadataByType(agentId, 'session');
    return sessionMetadata
      .map((meta) => meta.contextKey.replace('session:', ''))
      .filter((session) => session.length > 0);
  }
}
