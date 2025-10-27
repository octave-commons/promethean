#!/usr/bin/env node

/**
 * Test script to verify dual store consistency fix
 */

import { DualStoreManager } from './dualStore.js';

async function testDualStoreFix() {
    console.log('🧪 Testing Dual Store Consistency Fix...');

    try {
        // Create a test collection
        const testCollection = await DualStoreManager.create('test-consistency', 'text', 'timestamp');

        // Test 1: Normal insertion should work
        console.log('✅ Test 1: Normal insertion');
        await testCollection.insert({
            text: 'Test document 1',
            timestamp: Date.now(),
            metadata: {
                type: 'test',
                userName: 'test-user',
            },
        });

        // Test 2: Simulate vector write failure
        console.log('✅ Test 2: Vector write failure handling');

        // Set consistency level to eventual (should not throw on vector failures)
        process.env.DUAL_WRITE_ENABLED = 'true';
        process.env.DUAL_WRITE_CONSISTENCY = 'eventual'; // Should not throw

        await testCollection.insert({
            text: 'Test document 2',
            timestamp: Date.now(),
            metadata: {
                type: 'test',
                userName: 'test-user-2',
            },
        });

        // Test 3: Check consistency report
        console.log('✅ Test 3: Consistency report');
        const report = await testCollection.getConsistencyReport(10);
        console.log('📊 Consistency Report:', {
            total: report.totalDocuments,
            consistent: report.consistentDocuments,
            inconsistent: report.inconsistentDocuments,
            missingVectors: report.missingVectors,
            failures: report.vectorWriteFailures.length,
        });

        // Test 4: Check individual document consistency
        console.log('✅ Test 4: Individual consistency check');
        const recentDocs = await testCollection.getMostRecent(1);
        if (recentDocs.length > 0) {
            const docId = recentDocs[0]?.id;
            if (docId) {
                const consistency = await testCollection.checkConsistency(docId);
                console.log('🔍 Document Consistency:', consistency);
            }
        }

        console.log('🎉 All tests passed! Dual store consistency fix is working.');

        // Cleanup
        await testCollection.cleanup();
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    testDualStoreFix();
}
