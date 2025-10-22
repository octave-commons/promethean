// Test script to verify logger deduplication behavior
import { createLoggerComposable } from '../packages/opencode-client/src/services/composables/logger.js';

console.log('Testing logger deduplication...\n');

const { logger, flush } = createLoggerComposable();

// Simulate rapid message updates (should be deduped)
console.log('=== Testing rapid message updates (should be deduped) ===');
for (let i = 0; i < 10; i++) {
  logger('message_part_update', `🔄 Skipping indexing for part update of message msg_123`);
}

// Wait a bit and log more
setTimeout(() => {
  console.log('\n=== After 6 seconds (should log again) ===');
  for (let i = 0; i < 3; i++) {
    logger('message_part_update', `🔄 Skipping indexing for part update of message msg_123`);
  }

  // Test different event type
  console.log('\n=== Testing different event type ===');
  logger('message_indexed', `📝 Indexed message msg_456 for session ses_789`);

  // More of the same
  for (let i = 0; i < 5; i++) {
    logger('message_indexed', `📝 Indexed message msg_456 for session ses_789`);
  }

  // Flush any remaining logs
  setTimeout(() => {
    console.log('\n=== Flushing remaining logs ===');
    flush();
    console.log('\nTest completed!');
  }, 1000);
}, 6000);
