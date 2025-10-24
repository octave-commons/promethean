import { DualStoreManager } from '@promethean-os/persistence';
import { contextStore } from './stores.js';

// Store access proxies using ContextStore with proper type casting
export const createStoreProxy = (storeName: string): DualStoreManager<'text', 'timestamp'> => {
  return new Proxy({} as DualStoreManager<'text', 'timestamp'>, {
    get(_, prop) {
      // For now, let's try to get the collection synchronously
      // This will work if initializeStores() was called first
      try {
        const collection = (contextStore as any).collections?.get(storeName);
        if (!collection) {
          throw new Error(
            `Collection ${storeName} not initialized. Call initializeStores() first.`,
          );
        }
        const typedCollection = collection as DualStoreManager<'text', 'timestamp'>;
        return typedCollection[prop as keyof DualStoreManager<'text', 'timestamp'>];
      } catch (error) {
        throw new Error(
          `Collection ${storeName} not accessible. Make sure initializeStores() was called: ${error}`,
        );
      }
    },
  });
};
