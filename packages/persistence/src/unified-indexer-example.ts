/**
 * Unified Indexer Service Example
 *
 * This example demonstrates how to use the unified indexer service
 * to populate contextStore with data from multiple sources and enable
 * cross-domain search for LLM context.
 */

import {
    createUnifiedIndexerService,
    type UnifiedIndexerServiceConfig,
    DEFAULT_SERVICE_CONFIG,
} from './unified-indexer-service.js';

import type { SearchQuery } from './unified-indexing-api.js';

/**
 * Example configuration for unified indexer service
 */
const exampleConfig: UnifiedIndexerServiceConfig = {
    // Unified indexing client configuration
    indexing: {
        vectorStore: {
            type: 'chromadb',
            connectionString: process.env.CHROMA_DB_URL || 'http://localhost:8000',
            indexName: 'promethean-unified',
        },
        metadataStore: {
            type: 'mongodb',
            connectionString: process.env.MONGODB_URL || 'mongodb://localhost:27017',
            tableName: 'unified_content',
        },
        embedding: {
            model: 'text-embedding-ada-002',
            dimensions: 1536,
            batchSize: 100,
        },
        cache: {
            enabled: true,
            ttl: 300000, // 5 minutes
            maxSize: 1000,
        },
        validation: {
            strict: true,
            skipVectorValidation: false,
            maxContentLength: 1000000, // 1MB
        },
    },

    // Context store configuration
    contextStore: {
        collections: {
            files: 'files',
            discord: 'discord',
            opencode: 'opencode',
            kanban: 'kanban',
            unified: 'unified',
        },
        formatTime: (ms: number) => new Date(ms).toISOString(),
        assistantName: 'Promethean',
    },

    // Data source configurations
    sources: {
        files: {
            enabled: true,
            paths: ['./src', './docs', './packages', './sites'],
            options: {
                batchSize: 50,
                excludePatterns: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '*.log', '.env*'],
                includePatterns: ['*.ts', '*.js', '*.md', '*.json', '*.yaml', '*.yml'],
                followSymlinks: false,
                maxDepth: 10,
            },
        },
        discord: {
            enabled: false, // Enable when Discord integration is ready
        },
        opencode: {
            enabled: false, // Enable when OpenCode integration is ready
        },
        kanban: {
            enabled: false, // Enable when Kanban integration is ready
        },
    },

    // Sync configuration
    sync: {
        interval: 300000, // 5 minutes
        batchSize: 100,
        retryAttempts: 3,
        retryDelay: 5000, // 5 seconds
    },
};

/**
 * Example usage of unified indexer service
 */
async function runUnifiedIndexerExample(): Promise<void> {
    console.log('🚀 Starting Unified Indexer Service Example...');

    try {
        // Create and initialize the service
        const indexerService = await createUnifiedIndexerService(exampleConfig);

        // Start the service (begins periodic syncing)
        await indexerService.start();
        console.log('✅ Unified Indexer Service started successfully');

        // Wait a moment for initial sync
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Get service status
        const status = await indexerService.getStatus();
        console.log('📊 Service Status:', {
            healthy: status.healthy,
            indexing: status.indexing,
            activeSources: status.activeSources,
            lastSync: new Date(status.lastSync).toISOString(),
            issues: status.issues,
        });

        // Get comprehensive statistics
        const stats = await indexerService.getStats();
        console.log('📈 Indexing Statistics:', {
            totalContent: stats.total.totalContent,
            contentByType: stats.total.contentByType,
            contentBySource: stats.total.contentBySource,
            lastIndexed: new Date(stats.total.lastIndexed).toISOString(),
            errors: stats.errors.length,
        });

        // Example 1: Search across all indexed content
        console.log('\n🔍 Example 1: Cross-domain search');
        const searchQuery: SearchQuery = {
            query: 'contextStore unified indexing',
            type: ['file', 'document'],
            limit: 10,
            fuzzy: true,
            semantic: true,
        };

        const searchResults = await indexerService.search(searchQuery);
        console.log(`Found ${searchResults.results.length} results:`);
        searchResults.results.forEach((result, index) => {
            console.log(
                `  ${index + 1}. [${result.content.type}] ${result.content.id} (score: ${result.score.toFixed(3)})`,
            );
            console.log(`     Source: ${result.content.source} | ${result.content.metadata.path || 'N/A'}`);
            console.log(`     Preview: ${result.content.content.substring(0, 100)}...`);
        });

        // Example 2: Get context for LLM consumption
        console.log('\n🤖 Example 2: LLM context compilation');
        const context = await indexerService.getContext(
            ['unified indexer service', 'contextStore', 'cross-domain search'],
            {
                recentLimit: 5,
                queryLimit: 3,
                limit: 10,
                formatAssistantMessages: true,
            },
        );

        console.log(`Compiled ${context.length} context messages for LLM:`);
        context.forEach((msg, index) => {
            console.log(`  ${index + 1}. [${msg.role}] ${msg.content.substring(0, 150)}...`);
        });

        // Example 3: Real-time search simulation
        console.log('\n⚡ Example 3: Real-time search simulation');
        const realtimeQueries = [
            'TypeScript implementation',
            'MongoDB integration',
            'ChromaDB vector search',
            'Unified content model',
        ];

        for (const query of realtimeQueries) {
            const startTime = Date.now();
            const results = await indexerService.search({
                query,
                limit: 5,
                semantic: true,
            });
            const duration = Date.now() - startTime;

            console.log(`  Query "${query}": ${results.results.length} results in ${duration}ms`);
        }

        // Keep service running for demonstration
        console.log('\n⏰ Keeping service running for 30 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 30000));

        // Stop the service
        await indexerService.stop();
        console.log('🛑 Unified Indexer Service stopped');
    } catch (error) {
        console.error('❌ Example failed:', error);
        process.exit(1);
    }
}

/**
 * Example of how to integrate with existing contextStore usage
 */
async function demonstrateContextStoreIntegration(): Promise<void> {
    console.log('\n🔗 Demonstrating ContextStore Integration...');

    // This shows how the unified indexer service integrates
    // with existing contextStore patterns in the codebase

    const indexerService = await createUnifiedIndexerService(exampleConfig);
    await indexerService.start();

    // Wait for initial sync
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get context just like existing contextStore usage
    const context = await indexerService.getContext(['promethean architecture', 'agent coordination'], {
        recentLimit: 10,
        queryLimit: 5,
        limit: 15,
    });

    console.log(`✅ Retrieved ${context.length} context messages from unified sources`);

    // The context can now be used exactly like existing contextStore.compileContext()
    // results - it's the same format expected by LLM clients

    await indexerService.stop();
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runUnifiedIndexerExample()
        .then(() => demonstrateContextStoreIntegration())
        .then(() => {
            console.log('\n🎉 All examples completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Examples failed:', error);
            process.exit(1);
        });
}

export { runUnifiedIndexerExample, demonstrateContextStoreIntegration, exampleConfig };
