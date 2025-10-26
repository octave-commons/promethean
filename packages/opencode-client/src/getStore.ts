import { StoreNames, SearchableStore, contextStore } from './index.js';

export async function getStore(name: StoreNames): Promise<SearchableStore> {
  return contextStore.getCollection(name) as SearchableStore;
}
