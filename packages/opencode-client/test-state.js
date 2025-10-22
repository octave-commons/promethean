import { writeFile } from 'fs/promises';

// Test the state saving logic
const testState = {
  lastIndexedSessionId: 'test-session-123',
  lastIndexedMessageId: 'test-message-456',
  savedAt: Date.now(),
};

await writeFile('.indexer-state.json', JSON.stringify(testState, null, 2));
console.log('✅ Test state file created');
console.log('Content:', JSON.stringify(testState, null, 2));
