#!/usr/bin/env node

// Test to check if queue processor is keeping process alive
import { listJobs } from './dist/api/ollama.js';

async function testListJobsWithForceExit() {
  console.log('Testing listJobs with force exit...');

  try {
    const jobs = await listJobs({
      limit: 10,
      agentOnly: false,
    });

    console.log(`Found ${jobs.length} jobs`);

    // Force exit after a short delay
    setTimeout(() => {
      console.log('Forcing exit...');
      process.exit(0);
    }, 100);
  } catch (error) {
    console.error('listJobs failed:', error.message);
    process.exit(1);
  }
}

testListJobsWithForceExit();
