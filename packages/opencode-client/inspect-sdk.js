#!/usr/bin/env node

// Inspect raw SDK responses
import { createOpencodeClient } from '@opencode-ai/sdk';
import { initializeStores } from './dist/initializeStores.js';

async function inspectSDKResponses() {
  console.log('🔍 Initializing stores and client...\n');
  await initializeStores();

  const client = createOpencodeClient({
    baseUrl: 'http://localhost:4096',
  });

  try {
    // First, get a list of sessions
    console.log('📋 Getting sessions list...');
    const sessionsResponse = await client.session.list();
    console.log('Sessions response:', JSON.stringify(sessionsResponse, null, 2));

    if (!sessionsResponse.data || sessionsResponse.data.length === 0) {
      console.log('No sessions found');
      return;
    }

    const sessionId = sessionsResponse.data[0].id;
    console.log(`\n📝 Getting messages for session: ${sessionId}`);

    // Get messages for the first session
    const messagesResponse = await client.session.messages({
      path: { id: sessionId },
    });

    console.log('\n📄 RAW MESSAGES RESPONSE:');
    console.log('='.repeat(50));
    console.log(JSON.stringify(messagesResponse, null, 2));

    if (messagesResponse.data && messagesResponse.data.length > 0) {
      const firstMessage = messagesResponse.data[0];
      console.log('\n🔍 FIRST MESSAGE DETAILS:');
      console.log('='.repeat(30));
      console.log('Message keys:', Object.keys(firstMessage));
      console.log('Info:', JSON.stringify(firstMessage.info, null, 2));
      console.log('Parts:', JSON.stringify(firstMessage.parts, null, 2));

      // Check if parts have content
      if (firstMessage.parts) {
        firstMessage.parts.forEach((part, index) => {
          console.log(`\nPart ${index}:`, JSON.stringify(part, null, 2));
        });
      }
    }
  } catch (error) {
    console.error('Error inspecting SDK responses:', error);
  }
}

inspectSDKResponses().catch(console.error);
