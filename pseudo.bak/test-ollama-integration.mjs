#!/usr/bin/env node

// Integration test script for Ollama API
import {
  submitJob,
  listJobs,
  getJobStatus,
  getJobResult,
  getQueueInfo,
  listModels,
} from './dist/api/ollama.js';

async function testIntegration() {
  console.log('🧪 Starting Ollama API Integration Test\n');

  try {
    // Test 1: List models
    console.log('1. Testing listModels...');
    const models = await listModels();
    console.log(`✓ Found ${models.length} models`);
    console.log(`First model: ${models[0]}\n`);

    // Test 2: Submit a job
    console.log('2. Testing submitJob...');
    const jobResult = await submitJob({
      modelName: 'qwen3:4b',
      jobType: 'generate',
      priority: 'medium',
      jobName: 'integration-test',
      prompt: 'What is 2+2? Answer with just the number.',
    });
    console.log(`✓ Job submitted with ID: ${jobResult.id}\n`);

    // Test 3: List jobs (should show our job)
    console.log('3. Testing listJobs...');
    const jobs = await listJobs({ limit: 10 });
    console.log(`✓ Found ${jobs.length} jobs in queue`);
    const ourJob = jobs.find((j) => j.id === jobResult.id);
    console.log(`✓ Our job found in queue: ${ourJob ? 'Yes' : 'No'}\n`);

    // Test 4: Get job status
    console.log('4. Testing getJobStatus...');
    const status = await getJobStatus(jobResult.id);
    console.log(`✓ Job status: ${status.status}\n`);

    // Test 5: Wait for job completion and get result
    console.log('5. Waiting for job completion...');
    let finalStatus = status;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max

    while (
      finalStatus.status !== 'completed' &&
      finalStatus.status !== 'failed' &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      finalStatus = await getJobStatus(jobResult.id);
      process.stdout.write('.');
      attempts++;
    }
    console.log(`\n✓ Final status: ${finalStatus.status}\n`);

    // Test 6: Get job result if completed
    if (finalStatus.status === 'completed') {
      console.log('6. Testing getJobResult...');
      const result = await getJobResult(jobResult.id);
      console.log(`✓ Job result: ${result.result}\n`);
    } else {
      console.log(`⚠️  Job did not complete. Status: ${finalStatus.status}`);
      if (finalStatus.error) {
        console.log(`Error: ${finalStatus.error.message}`);
      }
    }

    // Test 7: Get queue info
    console.log('7. Testing getQueueInfo...');
    const queueInfo = await getQueueInfo();
    console.log(`✓ Queue info:`, queueInfo);

    console.log('\n🎉 Integration test completed successfully!');
  } catch (error) {
    console.error('\n❌ Integration test failed:', error);
    process.exit(1);
  }
}

testIntegration();
