import { ContextStore } from "@promethean/persistence/contextStore.js";

export const contextStore = new ContextStore();

export async function registerSinks() {
  if (contextStore.collectionCount() > 0) return;

  await contextStore.createCollection("bridge_logs", "text", "timestamp");
  await contextStore.createCollection("bridge_searches", "text", "timestamp");
}
