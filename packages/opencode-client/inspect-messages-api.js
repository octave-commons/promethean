#!/usr/bin/env node

// Focus specifically on messages API response
import { createOpencodeClient } from '@opencode-ai/sdk';
import { initializeStores } from './dist/initializeStores.js';

async function inspectMessagesAPI() {
  console.log('🔍 Initializing client...\n');
  await initializeStores();

  const client = createOpencodeClient({
    baseUrl: 'http://localhost:4096',
  });

  try {
    // Get sessions first
    const sessionsResponse = await client.session.list();
    
    if (!sessionsResponse.data || sessionsResponse.data.length === 0) {
      console.log('No sessions found');
      return;
    }

    const sessionId = sessionsResponse.data[0].id;
    console.log(`📝 Getting messages for session: ${sessionId}`);
    
    // Get messages with detailed response info
    const messagesResponse = await client.session.messages({
      path: { id: sessionId }
    });
    
    console.log('\n📄 RAW MESSAGES RESPONSE:');
    console.log('='.repeat(50));
    console.log('Response type:', typeof messagesResponse);
    console.log('Response keys:', Object.keys(messagesResponse));
    console.log('Has data property:', 'data' in messagesResponse);
    console.log('Data value:', messagesResponse.data);
    console.log('Data type:', typeof messagesResponse.data);
    console.log('Data length:', messagesResponse.data?.length);
    
    if (messagesResponse.data && messagesResponse.data.length > 0) {
      const firstMessage = messagesResponse.data[0];
      console.log('\n🔍 FIRST MESSAGE STRUCTURE:');
      console.log('='.repeat(30));
      console.log('Message keys:', Object.keys(firstMessage));
      console.log('Info:', JSON.stringify(firstMessage.info, null, 2));
      console.log('Parts:', JSON.stringify(firstMessage.parts, null, 2));
      
      // Check if parts have content
      if (firstMessage.parts && firstMessage.parts.length > 0) {
        console.log('\n📝 PARTS ANALYSIS:');
        firstMessage.parts.forEach((part, index) => {
          console.log(`Part ${index}:`, {
            type: part.type,
            hasText: !!part.text,
            textLength: part.text?.length || 0,
            textPreview: part.text?.substring(0, 100) || '[NO TEXT]',
            hasImages: !!part.images,
            imagesCount: part.images?.length || 0
          });
        });
      }
    }

  } catch (error) {
    console.error('Error inspecting messages API:', error);
  }
}

inspectMessagesAPI().catch(console.error);