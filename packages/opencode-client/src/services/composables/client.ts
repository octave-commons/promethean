// SPDX-License-Identifier: GPL-3.0-only
// Client Composable - Creates and manages OpenCode client

import { createOpencodeClient } from '@opencode-ai/sdk';
import type { OpenCodeClient } from '../indexer-types.js';

export type ClientConfig = {
  readonly baseUrl: string;
};

export const createClient = (config: ClientConfig): OpenCodeClient => {
  return createOpencodeClient({
    baseUrl: config.baseUrl,
  }) as OpenCodeClient;
};
