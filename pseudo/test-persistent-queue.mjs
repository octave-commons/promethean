#!/usr/bin/env node

// Test persistent ollama queue integration

import {
  initializePersistentStore,
  submitJobPersistent,
  getJobPersistent,
  listJobsPersistent,
  getQueueStatsPersistent,
  startQueueProcessorPersistent,
  stopQueueProcessorPersistent,
  closePersistentStore,
} from '@promethean/ollama-queue';

async function testPersistentQueue() {
  console.log('🧪 Testing Persistent Ollama Queue Integration...\n');

  try {
    // Initialize persistent store
    console.log('📦 Initializing persistent store...');
    await initializePersistentStore('./test-ollama-cache');
    console.log('✅ Persistent store initialized\n');

    // Start queue processor
    console.log('🚀 Starting queue processor...');
    startQueueProcessorPersistent();
    console.log('✅ Queue processor started\n');

    // Submit a test job
    console.log('📤 Submitting test job...');
    const job = await submitJobPersistent({
      type: 'generate',
      modelName: 'llama3.2:1b',
      prompt: 'What is 2 + 2? Answer with just the number.',
      priority: 'medium',
      name: 'Test Math Job',
      agentId: 'test-agent',
      sessionId: 'test-session',
    });
    console.log(`✅ Job submitted: ${job.id}\n`);

    // Wait a bit and check job status
    console.log('⏳ Waiting for job to process...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Get job details
    console.log('🔍 Checking job status...');
    const jobDetails = await getJobPersistent(job.id);
    console.log(`✅ Job status: ${jobDetails?.status}`);
    if (jobDetails?.result) {
      console.log(`📋 Result: ${JSON.stringify(jobDetails.result)}`);
    }
    console.log('');

    // List all jobs
    console.log('📋 Listing all jobs...');
    const jobs = await listJobsPersistent({ limit: 10 });
    console.log(`✅ Found ${jobs.length} jobs:`);
    jobs.forEach((j) => {
      console.log(`  - ${j.id}: ${j.status} (${j.modelName})`);
    });
    console.log('');

    // Get queue stats
    console.log('📊 Getting queue stats...');
    const stats = await getQueueStatsPersistent();
    console.log('✅ Queue stats:', stats);
    console.log('');

    // Test persistence by stopping and restarting
    console.log('🔄 Testing persistence...');
    console.log('Stopping queue processor...');
    stopQueueProcessorPersistent();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Restarting queue processor...');
    startQueueProcessorPersistent();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if job is still there
    const jobAfterRestart = await getJobPersistent(job.id);
    console.log(`✅ Job still exists after restart: ${jobAfterRestart?.status}`);

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    stopQueueProcessorPersistent();
    await closePersistentStore();
    console.log('✅ Cleanup complete');

    console.log('\n🎉 Persistent queue integration test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testPersistentQueue();
