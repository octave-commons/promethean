#!/usr/bin/env node

// Simple test to verify event deduplication is working
import { createLoggerComposable } from './dist/services/composables/logger.js';

console.log('🧪 Testing event deduplication...\n');

const { logger, flush } = createLoggerComposable();

// Test 1: Same event type multiple times
console.log('Test 1: Same event type multiple times');
logger('message_indexed', '📝 Indexed message msg-1');
logger('message_indexed', '📝 Indexed message msg-2');
logger('message_indexed', '📝 Indexed message msg-3');
logger('message_indexed', '📝 Indexed message msg-4');
logger('message_indexed', '📝 Indexed message msg-5');

flush(); // Should show (5x)

console.log('\nTest 2: Different event types');
logger('session_indexed', '📂 Indexed session sess-1');
logger('message_indexed', '📝 Indexed message msg-6');
logger('session_indexed', '📂 Indexed session sess-2');
logger('event_indexed', '🔔 Indexed event ev-1');

flush(); // Should show each event with counts

console.log('\nTest 3: Mixed with verbose mode');
process.argv.push('--verbose');
logger('message_indexed', '📝 Indexed message msg-7');
logger('message_indexed', '📝 Indexed message msg-8');
logger('message_indexed', '📝 Indexed message msg-9');

flush(); // Should show each individually due to verbose mode

console.log('\n✅ Deduplication test completed!');
