import { DualStoreManager } from '@promethean/persistence';
import { contextStore } from './stores.js';

// Store access proxies using ContextStore with proper type casting
export const createStoreProxy = (storeName: string): DualStoreManager<'text', 'timestamp'> => {
  return new Proxy({} as DualStoreManager<'text', 'timestamp'>, {
    get(_, prop) {
      const collection = contextStore.getCollection(storeName);
      // Cast from DualStoreManager<string, string> to DualStoreManager<'text', 'timestamp'>
      const typedCollection = collection as DualStoreManager<'text', 'timestamp'>;
      return typedCollection[prop as keyof DualStoreManager<'text', 'timestamp'>];
    },
  });
};
