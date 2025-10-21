import { createOpencodeClient } from '@opencode-ai/sdk';

const client = createOpencodeClient({ baseUrl: 'http://localhost:4096' });

async function debugSession() {
  try {
    // First test with invalid ID to see error structure
    console.log('=== Testing invalid ID ===');
    const invalidResponse = await client.session.get('test-session-123');
    console.log('Invalid response:', JSON.stringify(invalidResponse, null, 2));

    // Then test with valid ID format
    console.log('\n=== Testing valid ID format ===');
    const validResponse = await client.session.get('ses-123456789');
    console.log('Valid response type:', typeof validResponse);
    console.log('Valid response keys:', Object.keys(validResponse || {}));
    console.log('Valid response:', JSON.stringify(validResponse, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

debugSession();
