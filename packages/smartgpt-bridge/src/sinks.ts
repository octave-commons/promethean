// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
import { ContextStore } from "@promethean/persistence/contextStore.js";

export const contextStore = new ContextStore();

export async function registerSinks() {
  if (contextStore.collections.size) return;

  await contextStore.createCollection("bridge_logs", "text", "timestamp");
  await contextStore.createCollection("bridge_searches", "text", "timestamp");
}
