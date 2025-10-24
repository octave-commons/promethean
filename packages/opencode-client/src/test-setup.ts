import { initializeStores } from './initializeStores.js';

// Initialize stores for tests
let storesInitialized = false;

export const setupTestStores = async () => {
  if (!storesInitialized) {
    await initializeStores();
    storesInitialized = true;
  }
};
