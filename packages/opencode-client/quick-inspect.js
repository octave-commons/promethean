#!/usr/bin/env node

// Lightweight inspection of messages API
import { createOpencodeClient } from '@opencode-ai/sdk';
import { initializeStores } from './dist/initializeStores.js';

async function quickInspectMessages() {
  console.log('🔍 Initializing client...\n');
  await initializeStores();

  const client = createOpencodeClient({
    baseUrl: 'http://localhost:4096',
  });

  try {
    const sessionsResponse = await client.session.list();
    
    if (!sessionsResponse.data || sessionsResponse.data.length === 0) {
      console.log('No sessions found');
      return;
    }

    const sessionId = sessionsResponse.data[0].id;
    console.log(`Session ID: ${sessionId}`);
    
    // Get messages without logging everything
    const messagesResponse = await client.session.messages({
      path: { id: sessionId }
    });
    
    console.log('Messages count:', messagesResponse.data?.length || 0);
    
    if (messagesResponse.data && messagesResponse.data.length > 0) {
      const firstMessage = messagesResponse.data[0];
      console.log('First message structure:');
      console.log('- Has info:', !!firstMessage.info);
      console.log('- Has parts:', !!firstMessage.parts);
      console.log('- Parts count:', firstMessage.parts?.length || 0);
      
      if (firstMessage.parts && firstMessage.parts.length > 0) {
        const firstPart = firstMessage.parts[0];
        console.log('First part:');
        console.log('- Type:', firstPart.type);
        console.log('- Has text:', !!firstPart.text);
        console.log('- Text length:', firstPart.text?.length || 0);
        console.log('- Text preview:', firstPart.text?.substring(0, 50) + (firstPart.text?.length > 50 ? '...' : '[EMPTY]'));
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

quickInspectMessages().catch(console.error);