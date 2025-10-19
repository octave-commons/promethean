#!/usr/bin/env node

// Test script to debug plugin loading
import { CachePlugin } from './dist/plugins/cache.js';
import { OllamaPlugin } from './dist/plugins/ollama.js';
import { SessionsPlugin } from './dist/plugins/sessions.js';

async function debugPlugins() {
  console.log('Debugging individual plugins...\n');

  try {
    // Create a mock client
    const mockClient = {
      request: async (method, params) => {
        console.log(`Mock client request: ${method}`, params);
        return { success: true, data: 'mock response' };
      },
    };

    const context = { client: mockClient };

    // Test Cache Plugin
    console.log('1. Testing CachePlugin...');
    try {
      const cachePlugin = await CachePlugin(context);
      console.log('CachePlugin tools:', Object.keys(cachePlugin.tool || {}));
      console.log('CachePlugin tool count:', Object.keys(cachePlugin.tool || {}).length);
    } catch (error) {
      console.log('CachePlugin failed:', error.message);
    }

    // Test Ollama Plugin
    console.log('\n2. Testing OllamaPlugin...');
    try {
      const ollamaPlugin = await OllamaPlugin(context);
      console.log('OllamaPlugin tools:', Object.keys(ollamaPlugin.tool || {}));
      console.log('OllamaPlugin tool count:', Object.keys(ollamaPlugin.tool || {}).length);
    } catch (error) {
      console.log('OllamaPlugin failed:', error.message);
    }

    // Test Sessions Plugin
    console.log('\n3. Testing SessionsPlugin...');
    try {
      const sessionsPlugin = await SessionsPlugin(context);
      console.log('SessionsPlugin tools:', Object.keys(sessionsPlugin.tool || {}));
      console.log('SessionsPlugin tool count:', Object.keys(sessionsPlugin.tool || {}).length);
    } catch (error) {
      console.log('SessionsPlugin failed:', error.message);
    }
  } catch (error) {
    console.error('Failed to debug plugins:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugPlugins();
