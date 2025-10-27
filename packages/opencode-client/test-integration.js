#!/usr/bin/env node

/**
 * Simple integration test runner
 */

import { DualStoreManager, cleanupClients } from '@promethean-os/persistence';
import { processMessage } from './dist/actions/messages/index.js';
import { messageToMarkdown } from './dist/services/indexer-formatters.js';

async function runIntegrationTest() {
  console.log('🧪 Running integration test...');

  try {
    await cleanupClients();

    const store = await DualStoreManager.create('test-integration', 'text', 'timestamp');
    const context = { sessionStore: store };

    const mockMessage = {
      info: {
        id: 'integration-test-msg',
        role: 'user',
        sessionID: 'integration-test-session',
        time: { created: Date.now() },
      },
      parts: [
        { type: 'text', text: 'Integration test message' },
        { type: 'text', text: 'Second part of test' },
      ],
    };

    // Test message storage
    await processMessage(context, 'integration-test-session', mockMessage);
    console.log('✅ Message storage test passed');

    // Verify storage
    const results = await store.getMostRelevant(['integration-test-msg'], 1);

    if (results.length !== 1) {
      throw new Error(`Expected 1 result, got ${results.length}`);
    }

    const storedEntry = results[0];
    if (!storedEntry) {
      throw new Error('Expected stored entry to be found');
    }

    // Test JSON format
    if (typeof storedEntry.text !== 'string' || !storedEntry.text.startsWith('{')) {
      throw new Error('Expected JSON format in stored text');
    }

    const parsedMessage = JSON.parse(storedEntry.text);

    if (JSON.stringify(parsedMessage.info) !== JSON.stringify(mockMessage.info)) {
      throw new Error('Message info mismatch');
    }

    if (JSON.stringify(parsedMessage.parts) !== JSON.stringify(mockMessage.parts)) {
      throw new Error('Message parts mismatch');
    }

    console.log('✅ JSON format test passed');

    // Test formatter with stored entry
    const markdown = messageToMarkdown(storedEntry);

    if (!markdown.includes('# Message: integration-test-msg')) {
      throw new Error('Markdown formatting failed - missing message ID');
    }

    if (!markdown.includes('**Role:** user')) {
      throw new Error('Markdown formatting failed - missing role');
    }

    if (!markdown.includes('Integration test message')) {
      throw new Error('Markdown formatting failed - missing content');
    }

    console.log('✅ Formatter test passed');

    // Test formatter with direct message (legacy format)
    const legacyMarkdown = messageToMarkdown(mockMessage);

    if (!legacyMarkdown.includes('# Message: integration-test-msg')) {
      throw new Error('Legacy markdown formatting failed - missing message ID');
    }

    if (!legacyMarkdown.includes('**Role:** user')) {
      throw new Error('Legacy markdown formatting failed - missing role');
    }

    if (!legacyMarkdown.includes('Integration test message')) {
      throw new Error('Legacy markdown formatting failed - missing content');
    }

    console.log('✅ Legacy formatter test passed');

    console.log('🎉 All integration tests passed!');
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    process.exit(1);
  } finally {
    await cleanupClients();
  }
}

runIntegrationTest();
