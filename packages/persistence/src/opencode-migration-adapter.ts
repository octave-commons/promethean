/**
 * OpenCode Migration Adapter
 *
 * This module migrates the OpenCode indexer to use the unified indexing API.
 * It provides backward compatibility while transitioning to the unified approach.
 */

import type { UnifiedIndexingClient } from '@promethean-os/persistence';
import type { IndexableContent } from '@promethean-os/persistence';
import { transformOpenCodeSession, transformOpencodeEvent, transformOpenCodeMessage } from '@promethean-os/persistence';

/**
 * OpenCode session data
 */
export type OpenCodeSession = {
    id: string;
    title?: string;
    status: 'active' | 'closed';
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>;
};

/**
 * OpenCode event data
 */
export type OpenCodeEvent = {
    id: string;
    sessionId: string;
    type: string;
    data: any;
    timestamp: Date;
    metadata?: Record<string, any>;
};

/**
 * OpenCode message data
 */
export type OpenCodeMessage = {
    id: string;
    sessionId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
};

/**
 * OpenCode indexing statistics
 */
export type OpenCodeIndexingStats = {
    totalItems: number;
    indexedItems: number;
    skippedItems: number;
    errors: string[];
    duration: number;
};

/**
 * Migrated OpenCode indexer that uses the unified indexing API
 */
export class UnifiedOpenCodeIndexer {
    private unifiedClient: UnifiedIndexingClient;

    constructor(unifiedClient: UnifiedIndexingClient) {
        this.unifiedClient = unifiedClient;
    }

    /**
     * Index an OpenCode session using the unified API
     */
    async indexSession(session: OpenCodeSession): Promise<void> {
        try {
            const unifiedContent = transformOpenCodeSession(
                {
                    id: session.id,
                    title: session.title,
                    status: session.status,
                    created_at: session.createdAt.toISOString(),
                    updated_at: session.updatedAt.toISOString(),
                },
                {
                    type: 'session',
                    source: 'opencode',
                    session_id: session.id,
                    status: session.status,
                    created_at: session.createdAt.getTime(),
                    updated_at: session.updatedAt.getTime(),
                    ...session.metadata,
                },
            );

            await this.unifiedClient.index(unifiedContent, {
                validate: true,
            });

            console.log(`[opencode-unified-indexer] Indexed session ${session.id}`);
        } catch (error) {
            console.error(`[opencode-unified-indexer] Failed to index session ${session.id}:`, error);
            throw error;
        }
    }

    /**
     * Index an OpenCode message using the unified API
     */
    async indexMessage(message: OpenCodeMessage): Promise<void> {
        try {
            const unifiedContent = transformOpenCodeMessage(
                {
                    id: message.id,
                    session_id: message.sessionId,
                    role: message.role,
                    content: message.content,
                    timestamp: message.timestamp.toISOString(),
                },
                {
                    type: 'message',
                    source: 'opencode',
                    session_id: message.sessionId,
                    role: message.role,
                    timestamp: message.timestamp.getTime(),
                    ...message.metadata,
                },
            );

            await this.unifiedClient.index(unifiedContent, {
                validate: true,
            });

            console.log(`[opencode-unified-indexer] Indexed message ${message.id}`);
        } catch (error) {
            console.error(`[opencode-unified-indexer] Failed to index message ${message.id}:`, error);
            throw error;
        }
    }

    /**
     * Index multiple OpenCode items
     */
    async indexBatch(
        items: Array<{ type: 'session' | 'event' | 'message'; data: any }>,
    ): Promise<OpenCodeIndexingStats> {
        const startTime = Date.now();
        const stats: OpenCodeIndexingStats = {
            totalItems: items.length,
            indexedItems: 0,
            skippedItems: 0,
            errors: [],
            duration: 0,
        };

        try {
            const unifiedContents: IndexableContent[] = [];

            for (const item of items) {
                try {
                    let unifiedContent: IndexableContent;

                    switch (item.type) {
                        case 'session':
                            unifiedContent = transformOpenCodeSession(
                                {
                                    id: item.data.id,
                                    title: item.data.title,
                                    status: item.data.status,
                                    created_at: item.data.createdAt.toISOString(),
                                    updated_at: item.data.updatedAt.toISOString(),
                                },
                                {
                                    type: 'session',
                                    source: 'opencode',
                                    session_id: item.data.id,
                                    status: item.data.status,
                                    created_at: item.data.createdAt.getTime(),
                                    updated_at: item.data.updatedAt.getTime(),
                                    ...item.data.metadata,
                                },
                            );
                            break;

                        case 'event':
                            unifiedContent = transformOpencodeEvent(
                                {
                                    id: item.data.id,
                                    type: item.data.type,
                                    timestamp: item.data.timestamp.getTime(),
                                    data: item.data.data,
                                    properties: item.data.metadata,
                                },
                                {
                                    type: 'event',
                                    source: 'opencode',
                                    session_id: item.data.sessionId,
                                    event_type: item.data.type,
                                    timestamp: item.data.timestamp.getTime(),
                                    ...item.data.metadata,
                                },
                            );
                            break;

                        case 'message':
                            unifiedContent = transformOpenCodeMessage(
                                {
                                    id: item.data.id,
                                    session_id: item.data.sessionId,
                                    role: item.data.role,
                                    content: item.data.content,
                                    timestamp: item.data.timestamp.toISOString(),
                                },
                                {
                                    type: 'message',
                                    source: 'opencode',
                                    session_id: item.data.sessionId,
                                    role: item.data.role,
                                    timestamp: item.data.timestamp.getTime(),
                                    ...item.data.metadata,
                                },
                            );
                            break;

                        default:
                            throw new Error(`Unknown item type: ${(item as any).type}`);
                    }

                    unifiedContents.push(unifiedContent);
                    stats.indexedItems++;
                } catch (error) {
                    stats.skippedItems++;
                    stats.errors.push(
                        `${item.type}:${item.data.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    );
                }
            }

            // Batch index using the unified API
            if (unifiedContents.length > 0) {
                await this.unifiedClient.indexBatch(unifiedContents, {
                    validate: true,
                    batchSize: 100,
                });
            }
        } catch (error) {
            stats.errors.push(`Batch indexing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        stats.duration = Date.now() - startTime;
        return stats;
    }

    /**
     * Search OpenCode sessions using the unified API
     */
    async searchSessions(query: string, limit: number = 10): Promise<any[]> {
        const unifiedResults = await this.unifiedClient.search({
            query,
            limit,
            type: 'session',
            source: 'opencode',
            includeContent: true,
        });

        return unifiedResults.results.map((result) => ({
            id: result.content.id,
            title: (result.content.metadata as any)?.title || '',
            status: (result.content.metadata as any)?.status || 'unknown',
            createdAt: new Date(result.content.timestamp),
            updatedAt: new Date((result.content.metadata as any)?.updated_at || result.content.timestamp),
            score: result.score,
            highlights: result.highlights || [],
        }));
    }

    /**
     * Search OpenCode events using the unified API
     */
    async searchEvents(query: string, sessionId?: string, limit: number = 10): Promise<any[]> {
        const searchOptions: any = {
            query,
            limit,
            type: 'event',
            source: 'opencode',
            includeContent: true,
        };

        if (sessionId) {
            searchOptions.metadata = { session_id: sessionId };
        }

        const unifiedResults = await this.unifiedClient.search(searchOptions);

        return unifiedResults.results.map((result) => ({
            id: result.content.id,
            sessionId: (result.content.metadata as any)?.session_id,
            eventType: (result.content.metadata as any)?.event_type,
            timestamp: new Date(result.content.timestamp),
            data: result.content.content,
            score: result.score,
            highlights: result.highlights || [],
        }));
    }

    /**
     * Search OpenCode messages using the unified API
     */
    async searchMessages(query: string, sessionId?: string, limit: number = 10): Promise<any[]> {
        const searchOptions: any = {
            query,
            limit,
            type: 'message',
            source: 'opencode',
            includeContent: true,
        };

        if (sessionId) {
            searchOptions.metadata = { session_id: sessionId };
        }

        const unifiedResults = await this.unifiedClient.search(searchOptions);

        return unifiedResults.results.map((result) => ({
            id: result.content.id,
            sessionId: (result.content.metadata as any)?.session_id,
            role: (result.content.metadata as any)?.role,
            content: result.content.content,
            timestamp: new Date(result.content.timestamp),
            score: result.score,
            highlights: result.highlights || [],
        }));
    }

    /**
     * Get OpenCode session by ID using the unified API
     */
    async getSessionById(sessionId: string): Promise<any | null> {
        const result = await this.unifiedClient.getById(sessionId);

        if (!result || result.type !== 'session' || result.source !== 'opencode') {
            return null;
        }

        return {
            id: result.id,
            title: (result.metadata as any)?.title,
            status: (result.metadata as any)?.status,
            createdAt: new Date(result.timestamp),
            updatedAt: new Date((result.metadata as any)?.updated_at || result.timestamp),
            metadata: result.metadata,
        };
    }

    /**
     * Get OpenCode events by session ID using the unified API
     */
    async getEventsBySession(sessionId: string, limit: number = 50): Promise<any[]> {
        const searchResults = await this.unifiedClient.search({
            limit,
            type: 'event',
            source: 'opencode',
            metadata: { session_id: sessionId },
            includeContent: true,
        });

        return searchResults.results.map((result) => ({
            id: result.content.id,
            sessionId: (result.content.metadata as any)?.session_id,
            eventType: (result.content.metadata as any)?.event_type,
            timestamp: new Date(result.content.timestamp),
            data: result.content.content,
            score: result.score,
        }));
    }

    /**
     * Get OpenCode messages by session ID using the unified API
     */
    async getMessagesBySession(sessionId: string, limit: number = 50): Promise<any[]> {
        const searchResults = await this.unifiedClient.search({
            limit,
            type: 'message',
            source: 'opencode',
            metadata: { session_id: sessionId },
            includeContent: true,
        });

        return searchResults.results.map((result) => ({
            id: result.content.id,
            sessionId: (result.content.metadata as any)?.session_id,
            role: (result.content.metadata as any)?.role,
            content: result.content.content,
            timestamp: new Date(result.content.timestamp),
            score: result.score,
        }));
    }

    /**
     * Index an OpenCode event using the unified API
     */
    async indexEvent(event: OpenCodeEvent): Promise<void> {
        try {
            const unifiedContent = transformOpencodeEvent(
                {
                    id: event.id,
                    type: event.type,
                    timestamp: event.timestamp.getTime(),
                    data: event.data,
                    properties: event.metadata,
                },
                {
                    type: 'event',
                    source: 'opencode',
                    session_id: event.sessionId,
                    event_type: event.type,
                    timestamp: event.timestamp.getTime(),
                    ...event.metadata,
                },
            );

            await this.unifiedClient.index(unifiedContent, {
                validate: true,
            });

            console.log(`[opencode-unified-indexer] Indexed event ${event.id}`);
        } catch (error) {
            console.error(`[opencode-unified-indexer] Failed to index event ${event.id}:`, error);
            throw error;
        }
    }

    /**
     * Get OpenCode indexing statistics using the unified API
     */
    async getStats(): Promise<{
        totalSessions: number;
        totalEvents: number;
        totalMessages: number;
        sessionsByStatus: Record<string, number>;
        eventsByType: Record<string, number>;
        messagesByRole: Record<string, number>;
    }> {
        const [sessions, events, messages] = await Promise.all([
            this.unifiedClient.getByType('session'),
            this.unifiedClient.getByType('event'),
            this.unifiedClient.getByType('message'),
        ]);

        const opencodeSessions = sessions.filter((s) => s.source === 'opencode');
        const opencodeEvents = events.filter((e) => e.source === 'opencode');
        const opencodeMessages = messages.filter((m) => m.source === 'opencode');

        const sessionsByStatus: Record<string, number> = {};
        const eventsByType: Record<string, number> = {};
        const messagesByRole: Record<string, number> = {};

        for (const session of opencodeSessions) {
            const status = (session.metadata as any)?.status || 'unknown';
            sessionsByStatus[status] = (sessionsByStatus[status] || 0) + 1;
        }

        for (const event of opencodeEvents) {
            const eventType = (event.metadata as any)?.event_type || 'unknown';
            eventsByType[eventType] = (eventsByType[eventType] || 0) + 1;
        }

        for (const message of opencodeMessages) {
            const role = (message.metadata as any)?.role || 'unknown';
            messagesByRole[role] = (messagesByRole[role] || 0) + 1;
        }

        return {
            totalSessions: opencodeSessions.length,
            totalEvents: opencodeEvents.length,
            totalMessages: opencodeMessages.length,
            sessionsByStatus,
            eventsByType,
            messagesByRole,
        };
    }
}

/**
 * Factory function to create a unified OpenCode indexer
 */
export function createUnifiedOpenCodeIndexer(unifiedClient: UnifiedIndexingClient): UnifiedOpenCodeIndexer {
    return new UnifiedOpenCodeIndexer(unifiedClient);
}
