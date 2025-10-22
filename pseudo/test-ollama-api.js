#!/usr/bin/env node

// Test script to debug Ollama API
import { listModels } from './dist/api/ollama.js';

async function testModels() {
  try {
    console.log('Testing listModels API...');
    const models = await listModels(false);
    console.log('Raw result:', JSON.stringify(models, null, 2));
    console.log('Models count:', models.length);
    console.log('First model:', models[0]);
  } catch (error) {
    console.error('Error:', error);
  }
}

testModels();
