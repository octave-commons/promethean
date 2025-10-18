import { DualStoreManager } from './dist/dualStore.js';

async function testGetOperation() {
    console.log('🧪 Testing DualStoreManager get operation...');

    try {
        // Create a test dual store
        const store = await DualStoreManager.create('test_get_operation', 'text', 'timestamp');

        // Insert a test entry
        const testEntry = {
            id: 'test-entry-123',
            text: 'This is a test entry for the get operation',
            timestamp: new Date(),
            metadata: { type: 'test', source: 'unit-test' },
        };

        await store.insert(testEntry);
        console.log('✅ Test entry inserted');

        // Test the get operation
        const retrievedEntry = await store.get('test-entry-123');

        if (retrievedEntry) {
            console.log('✅ Entry retrieved successfully:');
            console.log('   ID:', retrievedEntry.id);
            console.log('   Text:', retrievedEntry.text);
            console.log('   Timestamp:', new Date(retrievedEntry.timestamp).toISOString());
            console.log('   Metadata:', retrievedEntry.metadata);
        } else {
            console.log('❌ Failed to retrieve entry');
            return false;
        }

        // Test getting non-existent entry
        const nonExistentEntry = await store.get('non-existent-id');
        if (nonExistentEntry === null) {
            console.log('✅ Correctly returned null for non-existent entry');
        } else {
            console.log('❌ Should have returned null for non-existent entry');
            return false;
        }

        console.log('🎉 All tests passed!');
        return true;
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}

testGetOperation().then((success) => {
    process.exit(success ? 0 : 1);
});
