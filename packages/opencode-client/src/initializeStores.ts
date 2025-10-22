import {
  contextStore,
  SESSION_STORE_NAME,
  EVENT_STORE_NAME,
  MESSAGE_STORE_NAME,
} from './stores.js';

export async function initializeStores(): Promise<Record<string, boolean>> {
  console.log('🔧 Initializing stores...');

  try {
    // Create all collections using ContextStore
    console.log('📝 Creating session collection...');
    await contextStore.createCollection(SESSION_STORE_NAME, 'text', 'timestamp');

    console.log('📝 Creating event collection...');
    await contextStore.createCollection(EVENT_STORE_NAME, 'text', 'timestamp');

    console.log('📝 Creating message collection...');
    await contextStore.createCollection(MESSAGE_STORE_NAME, 'text', 'timestamp');

    console.log('✅ All collections created successfully');

    return {
      [SESSION_STORE_NAME]: true,
      [EVENT_STORE_NAME]: true,
      [MESSAGE_STORE_NAME]: true,
    };
  } catch (error) {
    console.error('❌ Failed to initialize stores:', error);
    throw error;
  }
}
