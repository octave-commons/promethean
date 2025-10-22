// Simple test to verify the logger deduplication logic
console.log('Testing logger deduplication logic...\n');

// Simulate the logger logic
let previousEventType;
let consecutiveEventCount = 0;
let pendingEventLog;
let lastLogTime = 0;
const LOG_DEBOUNCE_MS = 5000; // 5 seconds

const logger = (eventType, message) => {
  const now = Date.now();
  const timeSinceLastLog = now - lastLogTime;

  // If this is the same event type as before, just increment counter
  if (previousEventType === eventType) {
    consecutiveEventCount++;

    // Only log if it's been 5+ seconds since last log or we're in verbose mode
    const shouldLog = timeSinceLastLog > LOG_DEBOUNCE_MS || process.argv.includes('--verbose');

    if (shouldLog) {
      const count = consecutiveEventCount > 1 ? ` (${consecutiveEventCount}x)` : '';
      console.log(`${message}${count}`);
      lastLogTime = now;
    }
    return;
  }

  // If we have a pending event from a different type, log it with count
  if (previousEventType && pendingEventLog) {
    const count = consecutiveEventCount > 1 ? ` (${consecutiveEventCount}x)` : '';
    console.log(`${pendingEventLog}${count}`);
  }

  // Set up new event as pending
  previousEventType = eventType;
  consecutiveEventCount = 1;
  pendingEventLog = message;
  lastLogTime = now;

  // Log the first occurrence immediately
  console.log(message);
};

// Test rapid message updates (should be deduped)
console.log('=== Testing rapid message updates (should be deduped) ===');
for (let i = 0; i < 10; i++) {
  logger('message_part_update', `🔄 Skipping indexing for part update of message msg_123`);
}

console.log('\n=== Testing different event type ===');
logger('message_indexed', `📝 Indexed message msg_456 for session ses_789`);

// More of the same
for (let i = 0; i < 5; i++) {
  logger('message_indexed', `📝 Indexed message msg_456 for session ses_789`);
}

console.log('\n=== After waiting 6 seconds (should log again) ===');
setTimeout(() => {
  for (let i = 0; i < 3; i++) {
    logger('message_part_update', `🔄 Skipping indexing for part update of message msg_123`);
  }
  console.log('\nTest completed!');
}, 6000);
