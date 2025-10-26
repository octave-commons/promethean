// SPDX-License-Identifier: GPL-3.0-only
// Test store setup helpers

// This is a helper file, not a test file, so no AVA import needed
// import test from 'ava'; // Commented out to indicate this is not a test file
import { initializeStores } from '../../initializeStores.js';
import type { DualStoreManager } from '@promethean-os/persistence';

let testStores: Record<string, DualStoreManager<'text', 'timestamp'>> | null = null;

/**
 * Initialize stores for testing
 */
export async function setupTestStores(): Promise<
  Record<string, DualStoreManager<'text', 'timestamp'>>
> {
  if (testStores) {
    return testStores;
  }

  console.log('🧪 Setting up test stores...');

  try {
    // Initialize stores using the standard approach
    testStores = await initializeStores();
    return testStores;
  } catch (error) {
    console.error('❌ Failed to setup test stores:', error);
    throw error;
  }
}

/**
 * Clean up test stores after tests
 */
export async function cleanupTestStores(): Promise<void> {
  if (!testStores) {
    return;
  }

  console.log('🧹 Cleaning up test stores...');

  try {
    // For now, just clear the reference
    for (const [name] of Object.entries(testStores)) {
      console.log(`📂 Cleared test store: ${name}`);
    }

    testStores = null;
  } catch (error) {
    console.error('❌ Failed to cleanup test stores:', error);
    throw error;
  }
}

/**
 * Get a test store by name
 */
export function getTestStore(name: string): DualStoreManager<'text', 'timestamp'> {
  if (!testStores) {
    throw new Error('Test stores not initialized. Call setupTestStores() first.');
  }

  const store = testStores[name];
  if (!store) {
    throw new Error(`Test store '${name}' not found.`);
  }

  return store;
}

/**
 * Mock store data for testing
 */
export async function mockStoreData(
  storeName: string,
  data: Array<{ id: string; text: string; timestamp?: number }>,
): Promise<void> {
  const store = getTestStore(storeName);

  for (const item of data) {
    await store.insert({
      id: item.id,
      text: item.text,
      timestamp: item.timestamp || Date.now(),
    });
  }
}
