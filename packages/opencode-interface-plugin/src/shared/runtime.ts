// SPDX-License-Identifier: GPL-3.0-only
// Runtime helpers shared by Session Orchestrator plugins

import type { PluginInput } from '@opencode-ai/plugin';
import type { OpencodeClient } from '@opencode-ai/sdk';
import { createOpencodeClient } from '@opencode-ai/sdk';

import { initializeStores } from '../initializeStores.js';

let storesReady = false;

async function ensureStoresReady(): Promise<void> {
  if (!storesReady) {
    await initializeStores();
    storesReady = true;
  }
}

export interface PluginRuntime {
  opencodeClient: OpencodeClient;
}

export async function createPluginRuntime(pluginContext: PluginInput): Promise<PluginRuntime> {
  await ensureStoresReady();

  const opencodeClient =
    (pluginContext?.client as OpencodeClient | undefined) ??
    createOpencodeClient({ baseUrl: 'http://localhost:4096' });

  return {
    opencodeClient,
  };
}
