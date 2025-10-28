/**
 * Discord Migration Adapter
 *
 * This module migrates the Discord message indexer to use the unified indexing API.
 * It provides backward compatibility while transitioning to the unified approach.
 */

import type { UnifiedIndexingClient } from '@promethean-os/persistence';
import type { IndexableContent } from '@promethean-os/persistence';
import { transformDiscordMessage } from '@promethean-os/persistence';

/**
 * Discord message event
 */
export type DiscordMessageEvent = {
    readonly provider: string;
    readonly tenant: string;
    readonly message_id: string;
    readonly author_urn: string;
    readonly space_urn: string;
    readonly text: string;
    readonly attachments?: readonly any[];
    readonly created_at: string | Date;
};

/**
 * Discord indexing statistics
 */
export type DiscordIndexingStats = {
    totalMessages: number;
    indexedMessages: number;
    skippedMessages: number;
    errors: string[];
    duration: number;
};

/**
 * Migrated Discord indexer that uses the unified indexing API
 */
export class UnifiedDiscordIndexer {
    private unifiedClient: UnifiedIndexingClient;

    constructor(unifiedClient: UnifiedIndexingClient) {
        this.unifiedClient = unifiedClient;
    }

    /**
     * Handle a social message created event
     */
    async handleSocialMessageCreated(evt: DiscordMessageEvent): Promise<void> {
        try {
            // Transform Discord message to unified content
            const unifiedContent = transformDiscordMessage(
                {
                    id: evt.message_id,
                    content: evt.text,
                    created_at: typeof evt.created_at === 'string' ? evt.created_at : evt.created_at.toISOString(),
                    author_urn: evt.author_urn,
                    space_urn: evt.space_urn,
                    attachments: (evt.attachments || []) as Array<{
                        urn?: string;
                        url?: string;
                        content_type?: string;
                        size?: number;
                        sha256?: string;
                    }>,
                },
                {
                    type: 'message',
                    source: 'discord',
                    message_id: evt.message_id,
                    author_urn: evt.author_urn,
                    space_urn: evt.space_urn,
                    user_name: evt.author_urn?.split(':').pop() || 'unknown',
                    channel_id: evt.space_urn,
                    created_at:
                        typeof evt.created_at === 'string'
                            ? new Date(evt.created_at).getTime()
                            : evt.created_at.getTime(),
                    provider: evt.provider,
                    tenant: evt.tenant,
                },
            );

            // Index using the unified API
            await this.unifiedClient.index(unifiedContent, {
                validate: true,
            });

            console.log(`[discord-unified-indexer] Indexed message ${evt.message_id}`);
        } catch (error) {
            console.error(`[discord-unified-indexer] Failed to index message ${evt.message_id}:`, error);
            throw error;
        }
    }

    /**
     * Index multiple Discord messages
     */
    async indexMessages(events: DiscordMessageEvent[]): Promise<DiscordIndexingStats> {
        const startTime = Date.now();
        const stats: DiscordIndexingStats = {
            totalMessages: events.length,
            indexedMessages: 0,
            skippedMessages: 0,
            errors: [],
            duration: 0,
        };

        try {
            // Convert events to unified content format
            const unifiedContents: IndexableContent[] = [];

            for (const evt of events) {
                try {
                    const unifiedContent = transformDiscordMessage(
                        {
                            id: evt.message_id,
                            content: evt.text,
                            created_at:
                                typeof evt.created_at === 'string' ? evt.created_at : evt.created_at.toISOString(),
                            author_urn: evt.author_urn,
                            space_urn: evt.space_urn,
                            attachments: (evt.attachments || []) as Array<{
                                urn?: string;
                                url?: string;
                                content_type?: string;
                                size?: number;
                                sha256?: string;
                            }>,
                        },
                        {
                            type: 'message',
                            source: 'discord',
                            message_id: evt.message_id,
                            author_urn: evt.author_urn,
                            space_urn: evt.space_urn,
                            user_name: evt.author_urn?.split(':').pop() || 'unknown',
                            channel_id: evt.space_urn,
                            created_at:
                                typeof evt.created_at === 'string'
                                    ? new Date(evt.created_at).getTime()
                                    : evt.created_at.getTime(),
                            provider: evt.provider,
                            tenant: evt.tenant,
                        },
                    );

                    unifiedContents.push(unifiedContent);
                    stats.indexedMessages++;
                } catch (error) {
                    stats.skippedMessages++;
                    stats.errors.push(`${evt.message_id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
     * Search Discord messages using the unified API
     */
    async searchMessages(query: string, limit: number = 10): Promise<any[]> {
        const unifiedResults = await this.unifiedClient.search({
            query,
            limit,
            type: 'message',
            source: 'discord',
            includeContent: true,
        });

        // Convert back to Discord format
        return unifiedResults.results.map((result) => ({
            message_id: result.content.id,
            text: result.content.content,
            author_urn: (result.content.metadata as any)?.author_urn,
            space_urn: (result.content.metadata as any)?.space_urn,
            created_at: new Date(result.content.timestamp),
            score: result.score,
            highlights: result.highlights || [],
        }));
    }

    /**
     * Get Discord message by ID using the unified API
     */
    async getMessageById(messageId: string): Promise<any | null> {
        const result = await this.unifiedClient.getById(messageId);

        if (!result || result.type !== 'message' || result.source !== 'discord') {
            return null;
        }

        return {
            message_id: result.id,
            text: result.content,
            author_urn: (result.metadata as any)?.author_urn,
            space_urn: (result.metadata as any)?.space_urn,
            created_at: new Date(result.timestamp),
            metadata: result.metadata,
        };
    }

    /**
     * Get Discord messages by channel using the unified API
     */
    async getMessagesByChannel(channelId: string, limit: number = 50): Promise<any[]> {
        const searchResults = await this.unifiedClient.search({
            limit,
            type: 'message',
            source: 'discord',
            metadata: { channel_id: channelId },
            includeContent: true,
        });

        return searchResults.results.map((result) => ({
            message_id: result.content.id,
            text: result.content.content,
            author_urn: (result.content.metadata as any)?.author_urn,
            space_urn: (result.content.metadata as any)?.space_urn,
            created_at: new Date(result.content.timestamp),
            score: result.score,
        }));
    }

    /**
     * Remove Discord message using the unified API
     */
    async removeMessage(messageId: string): Promise<boolean> {
        return await this.unifiedClient.delete(messageId);
    }

    /**
     * Get Discord indexing statistics using the unified API
     */
    async getStats(): Promise<{
        totalMessages: number;
        messagesByChannel: Record<string, number>;
        messagesByUser: Record<string, number>;
    }> {
        const messageStats = await this.unifiedClient.getByType('message');
        const discordMessages = messageStats.filter((msg) => msg.source === 'discord');

        const messagesByChannel: Record<string, number> = {};
        const messagesByUser: Record<string, number> = {};

        for (const message of discordMessages) {
            const channelId = (message.metadata as any)?.channel_id || 'unknown';
            const userName = (message.metadata as any)?.user_name || 'unknown';

            messagesByChannel[channelId] = (messagesByChannel[channelId] || 0) + 1;
            messagesByUser[userName] = (messagesByUser[userName] || 0) + 1;
        }

        return {
            totalMessages: discordMessages.length,
            messagesByChannel,
            messagesByUser,
        };
    }

    /**
     * Migrate existing MongoDB data to the unified API
     */
    async migrateExistingData(mongoCollection: any, query: any = {}): Promise<DiscordIndexingStats> {
        const startTime = Date.now();
        const stats: DiscordIndexingStats = {
            totalMessages: 0,
            indexedMessages: 0,
            skippedMessages: 0,
            errors: [],
            duration: 0,
        };

        try {
            // Find all existing Discord messages
            const existingMessages = await mongoCollection.find(query).toArray();
            stats.totalMessages = existingMessages.length;

            // Convert to unified content format
            const unifiedContents: IndexableContent[] = [];

            for (const doc of existingMessages) {
                try {
                    const unifiedContent = transformDiscordMessage(
                        {
                            id: doc.foreign_id || doc._id?.toString(),
                            content: doc.text,
                            created_at: doc.created_at || doc.indexed_at,
                            author_urn: doc.author_urn,
                            space_urn: doc.space_urn,
                            attachments: (doc.attachments || []) as Array<{
                                urn?: string;
                                url?: string;
                                content_type?: string;
                                size?: number;
                                sha256?: string;
                            }>,
                        },
                        {
                            type: 'message',
                            source: 'discord',
                            message_id: doc.foreign_id,
                            author_urn: doc.author_urn,
                            space_urn: doc.space_urn,
                            user_name: doc.author_urn?.split(':').pop() || 'unknown',
                            channel_id: doc.space_urn,
                            created_at: doc.created_at ? new Date(doc.created_at).getTime() : undefined,
                            provider: doc.provider,
                            tenant: doc.tenant,
                        },
                    );

                    unifiedContents.push(unifiedContent);
                    stats.indexedMessages++;
                } catch (error) {
                    stats.skippedMessages++;
                    stats.errors.push(`${doc.foreign_id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            // Batch index using the unified API
            if (unifiedContents.length > 0) {
                await this.unifiedClient.indexBatch(unifiedContents, {
                    validate: true,
                    batchSize: 100,
                });
            }

            console.log(`[discord-unified-indexer] Migrated ${stats.indexedMessages} messages`);
        } catch (error) {
            stats.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        stats.duration = Date.now() - startTime;
        return stats;
    }
}

/**
 * Factory function to create a unified Discord indexer
 */
export function createUnifiedDiscordIndexer(unifiedClient: UnifiedIndexingClient): UnifiedDiscordIndexer {
    return new UnifiedDiscordIndexer(unifiedClient);
}
