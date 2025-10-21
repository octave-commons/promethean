#!/usr/bin/env node

// Test script for the spawn functionality
import { spawn } from '../src/actions/sessions/spawn.js';
import { createOpencodeClient } from '@opencode-ai/sdk';

async function testSpawn() {
  try {
    console.log('Testing spawn functionality...');

    const client = createOpencodeClient({
      baseUrl: 'http://localhost:4096',
    });

    const result = await spawn({
      title: 'Test Spawn Session',
      message: 'spawn',
      client,
    });

    const spawnData = JSON.parse(result);
    console.log('Spawn result:', JSON.stringify(spawnData, null, 2));

    console.log('✅ Spawn test completed successfully');
  } catch (error) {
    console.error('❌ Spawn test failed:', error);
    process.exit(1);
  }
}

testSpawn();
