#!/usr/bin/env node

/**
 * Test script to verify unified indexing API implementation
 */

import { createUnifiedIndexingClient } from './unified-indexing-client.js';

import type { UnifiedIndexingConfig, SearchQuery } from './unified-indexing-api.js';

import { IndexableContent } from './unified-content-model.js';

async function testUnifiedIndexingAPI() {
    console.log('🧪 Testing Unified Indexing API...');

    try {
        // Test configuration
        const config: UnifiedIndexingConfig = {
            vectorStore: {
                type: 'chromadb',
                connectionString: 'http://localhost:8000',
                indexName: 'test-unified-index',
                dimensions: 1536,
            },
            metadataStore: {
                type: 'sqlite',
                connectionString: 'sqlite:./test.db',
                tableName: 'test_unified_content',
            },
            embedding: {
                model: 'text-embedding-ada-002',
                dimensions: 1536,
                batchSize: 10,
            },
            cache: {
                enabled: true,
                ttl: 60000,
                maxSize: 100,
            },
            validation: {
                strict: true,
                skipVectorValidation: false,
                maxContentLength: 10000,
            },
        };

        console.log('✅ Test 1: Create unified indexing client');
        const client = await createUnifiedIndexingClient(config);
        console.log('Client created successfully');

        // Test content
        const testContent: IndexableContent = {
            id: 'test-unified-1',
            type: 'message',
            source: 'discord',
            content: 'This is a test message for unified indexing API',
            timestamp: Date.now(),
            metadata: {
                type: 'message',
                source: 'discord',
                message_id: 'msg-test-1',
                channel_id: 'channel-123',
                user_id: 'user-456',
                user_name: 'test-user',
            },
        };

        console.log('✅ Test 2: Index content');
        const indexedId = await client.index(testContent);
        console.log(`Content indexed with ID: ${indexedId}`);

        console.log('✅ Test 3: Get content by ID');
        const retrieved = await client.getById(indexedId);
        if (retrieved) {
            console.log('Content retrieved successfully:', {
                id: retrieved.id,
                type: retrieved.type,
                source: retrieved.source,
                contentLength: retrieved.content.length,
            });
        } else {
            console.log('❌ Failed to retrieve content');
        }

        console.log('✅ Test 4: Search content');
        const searchQuery: SearchQuery = {
            query: 'test message',
            limit: 10,
        };
        const searchResults = await client.search(searchQuery);
        console.log(`Search returned ${searchResults.results.length} results in ${searchResults.took}ms`);

        console.log('✅ Test 5: Get content by type');
        const messageContent = await client.getByType('message');
        console.log(`Found ${messageContent.length} message-type items`);

        console.log('✅ Test 6: Get content by source');
        const discordContent = await client.getBySource('discord');
        console.log(`Found ${discordContent.length} discord-source items`);

        console.log('✅ Test 7: Update content');
        const updateSuccess = await client.update(indexedId, {
            content: 'Updated test message content',
        });
        console.log(`Content update ${updateSuccess ? 'succeeded' : 'failed'}`);

        console.log('✅ Test 8: Get indexing statistics');
        const stats = await client.getStats();
        console.log('Indexing statistics:', {
            totalContent: stats.totalContent,
            contentByType: stats.contentByType,
            contentBySource: stats.contentBySource,
            lastIndexed: new Date(stats.lastIndexed).toISOString(),
        });

        console.log('✅ Test 9: Health check');
        const health = await client.healthCheck();
        console.log('Health status:', {
            healthy: health.healthy,
            vectorStore: health.vectorStore,
            metadataStore: health.metadataStore,
            issues: health.issues,
        });

        console.log('✅ Test 10: Batch indexing');
        const batchContent: IndexableContent[] = [
            {
                id: 'batch-1',
                type: 'file',
                source: 'filesystem',
                content: 'Batch test file 1',
                timestamp: Date.now(),
                metadata: {
                    type: 'file',
                    source: 'filesystem',
                    path: '/test/batch1.txt',
                },
            },
            {
                id: 'batch-2',
                type: 'event',
                source: 'opencode',
                content: 'Batch test event 2',
                timestamp: Date.now(),
                metadata: {
                    type: 'event',
                    source: 'opencode',
                    event_type: 'test.event',
                },
            },
        ];

        const batchIds = await client.indexBatch(batchContent);
        console.log(`Batch indexed ${batchIds.length} items`);

        console.log('🎉 All tests passed! Unified indexing API is working correctly.');
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    testUnifiedIndexingAPI();
}
