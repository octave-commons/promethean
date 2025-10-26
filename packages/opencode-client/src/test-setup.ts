import { initializeStores } from './initializeStores.js';

// Silence console output during tests unless explicitly enabled
if (process.env.NODE_ENV === 'test' && process.env.VERBOSE_TESTS !== 'true') {
  const originalConsole = { ...console };

  // Override console methods to silence them during tests
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.debug = () => {};

  // Keep original methods available for debugging if needed
  (console as any).original = originalConsole;
}

// Initialize stores for tests
let storesInitialized = false;

export const setupTestStores = async () => {
  if (!storesInitialized) {
    await initializeStores();
    storesInitialized = true;
  }
};
