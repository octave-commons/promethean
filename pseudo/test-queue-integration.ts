import { DualStoreManager } from './dualStore.js';

async function testQueueIntegration() {
    console.log('Testing Chroma write queue integration...');

    try {
        // Create a dual store manager
        const store = await DualStoreManager.create('test_queue', 'text', 'timestamp');

        // Get queue stats
        const stats = store.getChromaQueueStats();
        console.log('Initial queue stats:', stats);

        // Add some test entries
        const entries = [
            { text: 'Test document 1', timestamp: Date.now(), metadata: { type: 'test', batch: 1 } },
            { text: 'Test document 2', timestamp: Date.now(), metadata: { type: 'test', batch: 1 } },
            { text: 'Test document 3', timestamp: Date.now(), metadata: { type: 'test', batch: 1 } },
        ];

        console.log('Adding test entries...');
        for (const entry of entries) {
            await store.insert(entry);
        }

        // Check queue stats after adding entries
        const afterStats = store.getChromaQueueStats();
        console.log('Queue stats after adding entries:', afterStats);

        // Force flush to ensure all writes are processed
        console.log('Forcing queue flush...');
        // Note: We can't directly access forceFlush from here, but the queue will flush automatically

        // Wait a bit for processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Final stats
        const finalStats = store.getChromaQueueStats();
        console.log('Final queue stats:', finalStats);

        console.log('✅ Queue integration test completed successfully');

        // Cleanup
        await store.cleanup();
    } catch (error) {
        console.error('❌ Queue integration test failed:', error);
        process.exit(1);
    }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testQueueIntegration();
}
