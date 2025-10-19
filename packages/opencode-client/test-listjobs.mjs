#!/usr/bin/env node

// Test to isolate the hanging issue
import { listJobs } from './dist/api/ollama.js';

async function testListJobs() {
  console.log('Testing listJobs...');

  try {
    const startTime = Date.now();

    // Add timeout manually
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out after 10 seconds')), 10000);
    });

    const listJobsPromise = listJobs({
      limit: 10,
      agentOnly: false,
    });

    const jobs = await Promise.race([listJobsPromise, timeoutPromise]);

    const endTime = Date.now();
    console.log(`✓ listJobs completed in ${endTime - startTime}ms`);
    console.log(`Found ${jobs.length} jobs`);

    // Exit cleanly
    process.exit(0);
  } catch (error) {
    console.error('✗ listJobs failed:', error.message);
    process.exit(1);
  }
}

testListJobs();
